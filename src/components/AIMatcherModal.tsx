import React, { useState } from 'react';
import { X, Sparkles, Brain, CheckCircle2, ChevronRight, Loader2, Award } from 'lucide-react';
import { Job, AIMatchResult } from '../types';

interface AIMatcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableJobs: Job[];
  onSelectJob: (job: Job) => void;
}

export const AIMatcherModal: React.FC<AIMatcherModalProps> = ({
  isOpen,
  onClose,
  availableJobs,
  onSelectJob,
}) => {
  const [resumeText, setResumeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<AIMatchResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRunMatch = async () => {
    if (!resumeText.trim() || resumeText.length < 10) {
      setError('Please enter your skills, past experience, or resume summary.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText,
          availableJobs: availableJobs.slice(0, 40),
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to match jobs');
      }

      setMatches(data.matches || []);
    } catch (err: any) {
      setError(err.message || 'An error occurred during AI analysis.');
    } finally {
      setLoading(false);
    }
  };

  const sampleBios = [
    'Software Engineer experienced in React, Node.js, TypeScript, Google Workspace, and workflow automation.',
    'SEO and Digital Marketing intern with experience in social media management, Google Analytics, content strategy, and WooCommerce.',
    'B2B Sales Representative proficient in LinkedIn Sales Navigator, cold outreach, lead generation, and client relationship management.',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-2xl bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl text-slate-100 overflow-hidden my-8 p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                AI Resume Job Matcher
              </h2>
              <p className="text-xs text-slate-400">
                Powered by Gemini AI • Matches your candidate profile against {availableJobs.length} live jobs
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto pr-1 flex-1 custom-scrollbar">
          {/* Resume Text Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Paste Your Resume, Bio, or Key Skills
            </label>
            <textarea
              rows={4}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume summary, skills (e.g. React, SEO, WordPress, B2B Sales), education, or previous work roles..."
              className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Sample Prompts */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Quick Sample Profiles:
            </span>
            <div className="flex flex-wrap gap-2">
              {sampleBios.map((bio, idx) => (
                <button
                  key={idx}
                  onClick={() => setResumeText(bio)}
                  className="px-2.5 py-1 rounded-lg text-xs bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 transition cursor-pointer text-left line-clamp-1 max-w-xs"
                >
                  "{bio.substring(0, 45)}..."
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl">
              {error}
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={handleRunMatch}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Gemini AI is analyzing job fit...</span>
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 text-purple-300" />
                <span>Find Best Matching Job Openings</span>
              </>
            )}
          </button>

          {/* Matches Output List */}
          {matches.length > 0 && (
            <div className="mt-6 pt-4 border-t border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center justify-between">
                <span>Top Recommended Roles</span>
                <span className="text-xs text-indigo-400 font-semibold">{matches.length} Matches Found</span>
              </h3>

              <div className="space-y-3">
                {matches.map((m) => {
                  const matchedJob = availableJobs.find((j) => j.id === m.jobId);
                  if (!matchedJob) return null;

                  return (
                    <div
                      key={m.jobId}
                      className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500/40 transition text-left flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <h4 className="font-bold text-white text-sm sm:text-base">{matchedJob.title}</h4>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">
                            {m.matchScore}% Match
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mb-2">
                          {matchedJob.company} • {matchedJob.location} • {matchedJob.workMode}
                        </p>
                        <p className="text-xs text-slate-300 leading-relaxed mb-3">{m.matchReason}</p>

                        {m.keyMatchingSkills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {m.keyMatchingSkills.map((sk, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800/80"
                              >
                                ✓ {sk}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="pt-3 mt-3 border-t border-slate-900 flex justify-end">
                        <button
                          onClick={() => {
                            onClose();
                            onSelectJob(matchedJob);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition"
                        >
                          <span>View Job Details</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
