import express from 'express';
import path from 'path';
import Papa from 'papaparse';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { normalizeJobRow } from './src/utils/parseJobs';
import { Job } from './src/types';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory cache for sheet jobs
interface CacheEntry {
  jobs: Job[];
  timestamp: number;
  sheetId: string;
}

const DEFAULT_SHEET_ID = '15We6ItLp14oyoqTjboXlXEGIrEnYyENAWreNuhin45o';
let jobsCache: CacheEntry | null = null;
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes

async function fetchJobsFromSheet(sheetId: string): Promise<Job[]> {
  const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
  
  const response = await fetch(exportUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });

  if (!response.ok) {
    // Try gviz alternative URL if export fails
    const gvizUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;
    const fallbackRes = await fetch(gvizUrl);
    if (!fallbackRes.ok) {
      throw new Error(`Failed to fetch Google Sheet (${response.status} / ${fallbackRes.status})`);
    }
    const csvText = await fallbackRes.text();
    return parseCsvToJobs(csvText);
  }

  const csvText = await response.text();
  return parseCsvToJobs(csvText);
}

function parseCsvToJobs(csvText: string): Job[] {
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim()
  });

  if (!parsed.data || parsed.data.length === 0) {
    return [];
  }

  return parsed.data.map((row, idx) => normalizeJobRow(row, idx));
}

// API Routes
app.get('/api/jobs', async (req, res) => {
  try {
    const sheetId = (req.query.sheetId as string) || DEFAULT_SHEET_ID;
    const force = req.query.force === 'true';

    const now = Date.now();
    if (!force && jobsCache && jobsCache.sheetId === sheetId && (now - jobsCache.timestamp) < CACHE_TTL_MS) {
      return res.json({
        success: true,
        cached: true,
        sheetId,
        lastSynced: new Date(jobsCache.timestamp).toISOString(),
        total: jobsCache.jobs.length,
        jobs: jobsCache.jobs
      });
    }

    const jobs = await fetchJobsFromSheet(sheetId);
    jobsCache = {
      jobs,
      timestamp: now,
      sheetId
    };

    res.json({
      success: true,
      cached: false,
      sheetId,
      lastSynced: new Date(now).toISOString(),
      total: jobs.length,
      jobs
    });
  } catch (error: any) {
    console.error('Error fetching jobs from sheet:', error);
    // Return stale cache if available, else error
    if (jobsCache && jobsCache.jobs.length > 0) {
      return res.json({
        success: true,
        cached: true,
        stale: true,
        sheetId: jobsCache.sheetId,
        lastSynced: new Date(jobsCache.timestamp).toISOString(),
        total: jobsCache.jobs.length,
        jobs: jobsCache.jobs,
        warning: `Failed to refresh sheet: ${error.message}. Displaying cached jobs.`
      });
    }

    res.status(500).json({
      success: false,
      error: `Could not load job listings from Google Sheet (${error.message || 'Unknown error'}). Ensure the sheet is public.`
    });
  }
});

app.post('/api/jobs/sync', async (req, res) => {
  try {
    const sheetId = (req.body.sheetId as string) || DEFAULT_SHEET_ID;
    const jobs = await fetchJobsFromSheet(sheetId);
    const now = Date.now();
    
    jobsCache = {
      jobs,
      timestamp: now,
      sheetId
    };

    res.json({
      success: true,
      sheetId,
      lastSynced: new Date(now).toISOString(),
      total: jobs.length,
      jobs
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: `Sync failed: ${error.message}`
    });
  }
});

// Gemini AI Resume Matcher
app.post('/api/ai/match', async (req, res) => {
  try {
    const { resumeText, availableJobs } = req.body;
    
    if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length < 10) {
      return res.status(400).json({ success: false, error: 'Please provide candidate resume or skills text.' });
    }

    const jobsToAnalyze: Job[] = Array.isArray(availableJobs) && availableJobs.length > 0 
      ? availableJobs 
      : (jobsCache?.jobs || []);

    if (jobsToAnalyze.length === 0) {
      return res.status(400).json({ success: false, error: 'No active job listings available to match against.' });
    }

    // Lazy load Gemini AI if key exists
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      const ai = new GoogleGenAI({ apiKey });
      const subset = jobsToAnalyze.slice(0, 30); // Sample top 30 jobs to fit prompt context cleanly

      const prompt = `You are an expert recruitment career counselor.
Analyze the following candidate resume/skills profile and find the top 5 most compatible job listings from the provided list.

Candidate Profile:
"""
${resumeText.substring(0, 2000)}
"""

Available Job Listings:
${JSON.stringify(subset.map(j => ({ id: j.id, title: j.title, company: j.company, category: j.category, skills: j.skills, summary: j.summary.substring(0, 300) })))}

Respond ONLY with a valid JSON array of objects with the following schema:
[
  {
    "jobId": "string (matching job id)",
    "matchScore": number (0 to 100 score),
    "matchReason": "string (2 sentence explanation of why this job matches the candidate)",
    "keyMatchingSkills": ["string array of 2-4 matching skills"]
  }
]
Do not include markdown code block quotes around the JSON if possible, or use standard json formatting.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      let responseText = response.text || '';
      responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

      try {
        const matches = JSON.parse(responseText);
        return res.json({ success: true, matches });
      } catch (parseErr) {
        console.warn('Failed to parse Gemini JSON output, falling back to heuristic matcher:', parseErr);
      }
    }

    // Fallback keyword heuristic matcher if no Gemini key or parse error
    const candidateTerms = resumeText.toLowerCase().split(/\W+/).filter(t => t.length > 3);
    const matches = jobsToAnalyze.slice(0, 20).map((job) => {
      const jobText = (job.title + ' ' + job.category + ' ' + job.description + ' ' + job.skills.join(' ')).toLowerCase();
      let score = 30; // base score
      const matchingSkills: string[] = [];

      job.skills.forEach(skill => {
        if (resumeText.toLowerCase().includes(skill.toLowerCase())) {
          score += 15;
          matchingSkills.push(skill);
        }
      });

      candidateTerms.forEach(term => {
        if (jobText.includes(term)) score += 2;
      });

      score = Math.min(98, Math.max(45, score));

      return {
        jobId: job.id,
        matchScore: score,
        matchReason: `Matches experience in ${job.category} with skills in ${matchingSkills.join(', ') || job.title}.`,
        keyMatchingSkills: matchingSkills.length > 0 ? matchingSkills : [job.category, job.workMode]
      };
    }).sort((a, b) => b.matchScore - a.matchScore).slice(0, 5);

    res.json({ success: true, matches, note: apiKey ? 'Heuristic fallback used' : 'Heuristic search' });
  } catch (error: any) {
    console.error('AI match error:', error);
    res.status(500).json({ success: false, error: 'Failed to process AI resume matching.' });
  }
});

// Vite Development or Static Production Server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Job Portal Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
