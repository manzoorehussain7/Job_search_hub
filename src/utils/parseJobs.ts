import { Job } from '../types';

export function normalizeJobRow(row: Record<string, string>, index: number): Job {
  const rawTitle = (row.Title || row.title || '').trim();
  const rawDesc = (row.Description || row.description || row.Summary || row.summary || '').trim();
  const rawSummary = (row.Summary || row.summary || '').trim();
  const rawCategory = (row.Category || row.category || '').trim();

  let title = rawTitle;
  let company = 'Direct Employer';
  let location = 'Location Unspecified';
  let workMode: Job['workMode'] = 'Full-time';

  // Work mode detection
  const lowerTitle = rawTitle.toLowerCase();
  const lowerDesc = rawDesc.toLowerCase();

  if (lowerTitle.includes('intern') || lowerTitle.includes('internship') || lowerDesc.includes('internship')) {
    workMode = 'Internship';
  } else if (lowerTitle.includes('remote') || lowerTitle.includes('work from home') || lowerDesc.includes('remote') || lowerDesc.includes('work mode: remote')) {
    workMode = 'Remote';
  } else if (lowerTitle.includes('part-time') || lowerTitle.includes('part time')) {
    workMode = 'Part-time';
  } else if (lowerTitle.includes('contract') || lowerTitle.includes('freelance')) {
    workMode = 'Contract';
  } else {
    workMode = 'Full-time';
  }

  // Extract Company & Location from title e.g., "Position Title in Company Name Location"
  const inMatch = rawTitle.match(/\sin\s+(.+)$/i);
  if (inMatch) {
    const afterIn = inMatch[1].trim();
    // Match location patterns like "City, Country" or "Lahore, Pakistan"
    const locMatch = afterIn.match(/(.+?)\s+([A-Z][a-zA-Za-z\s]+,\s*[A-Z][a-zA-Za-z\s]+)$/);
    if (locMatch) {
      company = locMatch[1].replace(/,\s*$/, '').trim();
      location = locMatch[2].trim();
    } else {
      // Try comma split: "Company Name Lahore, Pakistan"
      const parts = afterIn.split(/\s+(?=[A-Z][a-z]+\s*,\s*)/);
      if (parts.length > 1) {
        company = parts[0].trim();
        location = parts.slice(1).join(' ').trim();
      } else {
        company = afterIn;
      }
    }
    title = rawTitle.substring(0, inMatch.index).trim();
  } else {
    // If no "in", try "at Company"
    const atMatch = rawTitle.match(/\sat\s+(.+)$/i);
    if (atMatch) {
      company = atMatch[1].trim();
      title = rawTitle.substring(0, atMatch.index).trim();
    }
  }

  // Clean trailing "Job" or "Job in ..." if leftover
  title = title.replace(/\s+Job$/i, '').replace(/- REMOTE \/ Work From Home$/i, '').trim();

  // Category Auto-Categorization
  let category = rawCategory;
  if (!category || category.toLowerCase() === 'general') {
    const combined = (rawTitle + ' ' + rawDesc).toLowerCase();
    if (/design|graphic|ui\/ux|illustrator|video|photoshop|figma/i.test(combined)) {
      category = 'Design & Creative';
    } else if (/seo|digital marketing|social media|content writer|copywriter|marketing/i.test(combined)) {
      category = 'Marketing & SEO';
    } else if (/sales|b2b|business development|lead generation|outbound|account executive/i.test(combined)) {
      category = 'Sales & Business';
    } else if (/ecommerce|e-commerce|shopify|woocommerce|glass mirror|store|amazon/i.test(combined)) {
      category = 'E-Commerce';
    } else if (/intern|internship|summer program|trainee/i.test(combined)) {
      category = 'Internships';
    } else if (/software|developer|coding|web|fullstack|frontend|backend|python|react|node|javascript|it specialist|cloud|saas/i.test(combined)) {
      category = 'Engineering & IT';
    } else if (/healthcare|medical|nurse|doctor|patient|dbs|clinical/i.test(combined)) {
      category = 'Healthcare & Medical';
    } else {
      category = 'Operations & Admin';
    }
  }

  // Extract sections (responsibilities, requirements, benefits)
  const responsibilities: string[] = [];
  const requirements: string[] = [];
  const benefits: string[] = [];
  const skillsSet = new Set<string>();

  // Extract common tech/skills from text
  const skillKeywords = [
    'Google Workspace', 'WordPress', 'WooCommerce', 'React', 'Node.js', 'TypeScript',
    'Python', 'SEO', 'Digital Marketing', 'B2B Sales', 'LinkedIn Sales Navigator',
    'Cold Outreach', 'Excel', 'Google Docs', 'Communication', 'Graphic Design',
    'E-Commerce', 'Lead Generation', 'UI/UX', 'Figma', 'Customer Support', 'AI Solutions'
  ];

  skillKeywords.forEach((sk) => {
    if (new RegExp('\\b' + sk.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i').test(rawDesc)) {
      skillsSet.add(sk);
    }
  });

  // Extract bullet lines or sentences from description
  if (rawDesc) {
    const lines = rawDesc.split(/(?:\r?\n|;|\. (?=[A-Z]))+/);
    let currentSection: 'resp' | 'req' | 'ben' | 'desc' = 'desc';

    lines.forEach((l) => {
      const cleanLine = l.replace(/^[-*•:\d.]+\s*/, '').trim();
      if (!cleanLine || cleanLine.length < 5) return;

      const lower = cleanLine.toLowerCase();
      if (lower.includes('key responsibilities') || lower.includes('responsibilities:')) {
        currentSection = 'resp';
        return;
      } else if (lower.includes('job specification') || lower.includes('required skills') || lower.includes('requirements:')) {
        currentSection = 'req';
        return;
      } else if (lower.includes('job rewards') || lower.includes('benefits:') || lower.includes('perks')) {
        currentSection = 'ben';
        return;
      }

      if (currentSection === 'resp' && responsibilities.length < 8) {
        responsibilities.push(cleanLine);
      } else if (currentSection === 'req' && requirements.length < 8) {
        requirements.push(cleanLine);
      } else if (currentSection === 'ben' && benefits.length < 5) {
        benefits.push(cleanLine);
      }
    });
  }

  return {
    id: `job-${index + 1}`,
    title: title || rawTitle || `Job Opening #${index + 1}`,
    rawTitle,
    company: company || 'Company',
    location: location || 'Remote / Online',
    workMode,
    category,
    description: rawDesc || 'No description provided.',
    summary: rawSummary || rawDesc.substring(0, 200) + '...',
    sourceUrl: row.Source || row.source || undefined,
    enclosure: row.Enclosure || row.enclosure || undefined,
    postedDate: new Date().toISOString().split('T')[0],
    skills: Array.from(skillsSet),
    responsibilities,
    requirements,
    benefits
  };
}
