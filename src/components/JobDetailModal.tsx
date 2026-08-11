import React, { useState } from 'react';
import { X, Building2, MapPin, Bookmark, CheckCircle2, Share2, ExternalLink, Briefcase, Sparkles, Check } from 'lucide-react';
import { Job } from '../types';

interface JobDetailModalProps {
  job: Job | null;
  onClose: () => void;
  isBookmarked: boolean;
  isApplied: boolean;
  onToggleBookmark: (jobId: string) => void;
  onOpenApply: (job: Job) => void;
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({
  job,
  onClose,
  isBookmarked,
  isApplied,
  onToggleBookmark,
  onOpenApply,
}) => {
  const [copied, setCopied] = useState(false);

  if (!job) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-3xl bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl text-slate-100 overflow-hidden my-8 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 bg-slate-900/90 border-b border-slate-800 flex items-start justify-between gap-4 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center font-extrabold text-indigo-400 text-lg shrink-0">
              {job.company.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                  {job.category}
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                  {job.workMode}
                </span>
                {isApplied && (
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Applied
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                {job.title}
              </h2>
              <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-400 mt-1 flex-wrap">
                <span className="flex items-center gap-1 font-medium text-slate-300">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  {job.company}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {job.location}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
          {/* Key Skills Tags */}
          {job.skills.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Required Key Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-950/60 text-indigo-300 border border-indigo-800/60"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Key Responsibilities */}
          {job.responsibilities.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                Key Responsibilities & Scope
              </h3>
              <ul className="space-y-2">
                {job.responsibilities.map((resp, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Job Requirements / Specifications */}
          {job.requirements.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-purple-400" />
                Job Specifications & Qualifications
              </h3>
              <ul className="space-y-2">
                {job.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Benefits */}
          {job.benefits.length > 0 && (
            <div className="bg-emerald-950/20 border border-emerald-800/40 p-4 rounded-xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
                Rewards & Benefits
              </h3>
              <p className="text-xs sm:text-sm text-emerald-200/90 leading-relaxed">
                {job.benefits.join(' • ')}
              </p>
            </div>
          )}

          {/* Full Raw Description */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Full Description
            </h3>
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line font-sans">
              {job.description}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 sticky bottom-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleBookmark(job.id)}
              className={`p-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                isBookmarked
                  ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-750 border-slate-700'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-indigo-400 text-indigo-400' : ''}`} />
              <span>{isBookmarked ? 'Saved' : 'Save'}</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-slate-400" />}
              <span>{copied ? 'Copied' : 'Share'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenApply(job);
              }}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition cursor-pointer flex items-center gap-2"
            >
              <span>{isApplied ? 'Edit Application' : 'Apply For Position'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
