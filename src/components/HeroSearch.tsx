import React from 'react';
import { Search, MapPin, Building2, Sparkles, Filter, X } from 'lucide-react';
import { JobFilter } from '../types';

interface HeroSearchProps {
  filters: JobFilter;
  onFilterChange: (newFilters: Partial<JobFilter>) => void;
  categories: string[];
  locations: string[];
  totalResults: number;
  onOpenSheetModal: () => void;
}

export const HeroSearch: React.FC<HeroSearchProps> = ({
  filters,
  onFilterChange,
  categories,
  locations,
  totalResults,
  onOpenSheetModal,
}) => {
  const quickPills = [
    { label: 'All Jobs', category: '' },
    { label: 'Remote / WFH', workMode: 'Remote' },
    { label: 'Software & IT', category: 'Engineering & IT' },
    { label: 'Marketing & SEO', category: 'Marketing & SEO' },
    { label: 'Sales & B2B', category: 'Sales & Business' },
    { label: 'Internships', workMode: 'Internship' },
    { label: 'E-Commerce', category: 'E-Commerce' },
  ];

  return (
    <div className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white pt-8 pb-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800 shadow-lg overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 mb-4">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Real-time Live Synced from Google Sheet</span>
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-3">
          Search Jobs directly from <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400">Google Sheets</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed">
          Search hundreds of active job listings, internships, and remote roles. Synced live with real-time Google Sheet updates.
        </p>

        {/* Search Bar Container */}
        <div className="bg-slate-800/90 backdrop-blur-xl p-3 sm:p-4 rounded-2xl border border-slate-700/80 shadow-2xl text-left">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Search Input */}
            <div className="md:col-span-5 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={filters.searchQuery}
                onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
                placeholder="Job title, company, or skills (e.g. Developer, SEO, Sales)..."
                className="w-full pl-10 pr-4 py-3 bg-slate-900/80 rounded-xl border border-slate-700 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition"
              />
              {filters.searchQuery && (
                <button
                  onClick={() => onFilterChange({ searchQuery: '' })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Location Selector */}
            <div className="md:col-span-4 relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <select
                value={filters.location}
                onChange={(e) => onFilterChange({ location: e.target.value })}
                className="w-full pl-10 pr-8 py-3 bg-slate-900/80 rounded-xl border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition appearance-none cursor-pointer"
              >
                <option value="">All Locations / Remote</option>
                <option value="Remote">Remote / Work From Home</option>
                {locations
                  .filter((loc) => loc !== 'Remote')
                  .map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
              </select>
            </div>

            {/* Search Button & Clear */}
            <div className="md:col-span-3 flex items-center gap-2">
              <button
                type="button"
                className="w-full py-3 px-5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold rounded-xl text-sm shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>Search ({totalResults})</span>
              </button>
            </div>
          </div>

          {/* Category Quick Filter Pills */}
          <div className="mt-4 pt-3 border-t border-slate-700/60 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">
              Popular:
            </span>
            {quickPills.map((pill, idx) => {
              const isActive =
                (pill.category && filters.categories.includes(pill.category)) ||
                (pill.workMode && filters.workModes.includes(pill.workMode)) ||
                (!pill.category && !pill.workMode && filters.categories.length === 0 && filters.workModes.length === 0);

              return (
                <button
                  key={idx}
                  onClick={() => {
                    if (!pill.category && !pill.workMode) {
                      onFilterChange({ categories: [], workModes: [] });
                    } else if (pill.category) {
                      onFilterChange({ categories: [pill.category] });
                    } else if (pill.workMode) {
                      onFilterChange({ workModes: [pill.workMode] });
                    }
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white font-semibold shadow'
                      : 'bg-slate-900/60 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                  }`}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
