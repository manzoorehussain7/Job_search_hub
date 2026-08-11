import React from 'react';
import { MapPin, Building2, Bookmark, CheckCircle2, ChevronRight, Sparkles, Wifi, Calendar } from 'lucide-react';
import { Job } from '../types';

interface JobCardProps {
  job: Job;
  isBookmarked: boolean;
  isApplied: boolean;
  onToggleBookmark: (jobId: string) => void;
  onSelectJob: (job: Job) => void;
  onOpenApply: (job: Job) => void;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  isBookmarked,
  isApplied,
  onToggleBookmark,
  onSelectJob,
  onOpenApply,
}) => {
  // Generate consistent initial & colors for company avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'CO';
  };

  const getWorkModeBadge = (mode: Job['workMode']) => {
    switch (mode) {
      case 'Remote':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'Internship':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'Part-time':
        return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
      case 'Contract':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      default:
        return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
    }
  };

  return (
    <div className="group relative bg-slate-900/90 hover:bg-slate-850 rounded-2xl border border-slate-800 hover:border-indigo-500/40 p-5 sm:p-6 transition-all duration-200 shadow-md hover:shadow-xl hover:shadow-indigo-500/5 flex flex-col justify-between">
      <div>
        {/* Card Header: Avatar + Title + Bookmark */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3.5">
            {/* Company Avatar */}
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-700/80 flex items-center justify-center font-bold text-slate-200 text-sm shadow-inner shrink-0 group-hover:border-indigo-500/30 transition">
              {getInitials(job.company)}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-xs font-semibold text-indigo-400 tracking-wide uppercase">
                  {job.category}
                </span>
                {isApplied && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Applied
                  </span>
                )}
              </div>

              <h3
                onClick={() => onSelectJob(job)}
                className="text-base sm:text-lg font-bold text-white group-hover:text-indigo-300 transition cursor-pointer leading-snug line-clamp-2"
              >
                {job.title}
              </h3>

              <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 flex-wrap">
                <span className="font-medium text-slate-300 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {job.company}
                </span>
                <span className="text-slate-600">•</span>
                <span className="flex items-center gap-1 text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {job.location}
                </span>
              </div>
            </div>
          </div>

          {/* Bookmark Button */}
          <button
            onClick={() => onToggleBookmark(job.id)}
            className={`p-2 rounded-xl transition cursor-pointer border ${
              isBookmarked
                ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50'
                : 'bg-slate-800/80 text-slate-400 hover:text-white border-slate-700 hover:bg-slate-750'
            }`}
            title={isBookmarked ? 'Remove from saved' : 'Save job'}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-indigo-400 text-indigo-400' : ''}`} />
          </button>
        </div>

        {/* Badges: Work Mode & Location */}
        <div className="flex flex-wrap items-center gap-2 my-3">
          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${getWorkModeBadge(job.workMode)}`}>
            {job.workMode === 'Remote' && <Wifi className="w-3 h-3 inline mr-1" />}
            {job.workMode}
          </span>

          {job.skills.slice(0, 3).map((skill, idx) => (
            <span
              key={idx}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700/60"
            >
              {skill}
            </span>
          ))}

          {job.skills.length > 3 && (
            <span className="text-xs text-slate-400 pl-1">
              +{job.skills.length - 3} more
            </span>
          )}
        </div>

        {/* Short Summary / Snippet */}
        <p className="text-xs sm:text-sm text-slate-300/90 line-clamp-3 mb-4 leading-relaxed font-sans">
          {job.summary.replace(/^Job Description\s*:\s*/i, '')}
        </p>
      </div>

      {/* Card Footer Actions */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 mt-2">
        <button
          onClick={() => onSelectJob(job)}
          className="text-xs font-semibold text-slate-300 hover:text-indigo-400 transition flex items-center gap-1 cursor-pointer py-1"
        >
          <span>View Details & Specs</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onOpenApply(job)}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md ${
            isApplied
              ? 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
          }`}
        >
          <span>{isApplied ? 'Update Application' : 'Quick Apply'}</span>
        </button>
      </div>
    </div>
  );
};
