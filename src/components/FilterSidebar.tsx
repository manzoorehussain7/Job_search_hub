import React from 'react';
import { Filter, Layers, MapPin, Briefcase, Building, RotateCcw, Check } from 'lucide-react';
import { JobFilter, Job } from '../types';

interface FilterSidebarProps {
  filters: JobFilter;
  onFilterChange: (newFilters: Partial<JobFilter>) => void;
  onResetFilters: () => void;
  allJobs: Job[];
  categories: string[];
  locations: string[];
  companies: string[];
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  allJobs,
  categories,
  locations,
  companies,
}) => {
  const workModes = ['Remote', 'Full-time', 'Internship', 'Part-time', 'Contract'];

  const toggleCategory = (cat: string) => {
    const exists = filters.categories.includes(cat);
    const updated = exists
      ? filters.categories.filter((c) => c !== cat)
      : [...filters.categories, cat];
    onFilterChange({ categories: updated });
  };

  const toggleWorkMode = (wm: string) => {
    const exists = filters.workModes.includes(wm);
    const updated = exists
      ? filters.workModes.filter((m) => m !== wm)
      : [...filters.workModes, wm];
    onFilterChange({ workModes: updated });
  };

  // Count helper
  const getCategoryCount = (cat: string) => allJobs.filter((j) => j.category === cat).length;
  const getWorkModeCount = (wm: string) => allJobs.filter((j) => j.workMode === wm).length;

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl text-slate-200 sticky top-24 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2 font-bold text-white text-base">
          <Filter className="w-4 h-4 text-indigo-400" />
          <span>Filter Job Listings</span>
        </div>
        <button
          onClick={onResetFilters}
          className="text-xs text-slate-400 hover:text-indigo-400 flex items-center gap-1 transition"
          title="Reset all filters"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Work Mode Filter */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
          <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
          Employment & Work Mode
        </h3>
        <div className="space-y-2">
          {workModes.map((wm) => {
            const isChecked = filters.workModes.includes(wm);
            const count = getWorkModeCount(wm);
            return (
              <label
                key={wm}
                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition text-xs font-medium ${
                  isChecked
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                    : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleWorkMode(wm)}
                    className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4 bg-slate-950"
                  />
                  <span>{wm}</span>
                </div>
                <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                  {count}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Categories Filter */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-purple-400" />
          Job Categories
        </h3>
        <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
          {categories.map((cat) => {
            const isChecked = filters.categories.includes(cat);
            const count = getCategoryCount(cat);
            return (
              <label
                key={cat}
                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition text-xs font-medium ${
                  isChecked
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                    : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 truncate mr-2">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleCategory(cat)}
                    className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4 bg-slate-950"
                  />
                  <span className="truncate">{cat}</span>
                </div>
                <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 shrink-0">
                  {count}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Company Dropdown */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
          <Building className="w-3.5 h-3.5 text-emerald-400" />
          Filter by Employer
        </h3>
        <select
          value={filters.companyFilter}
          onChange={(e) => onFilterChange({ companyFilter: e.target.value })}
          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Employers ({companies.length})</option>
          {companies.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Location Selector */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
          Location
        </h3>
        <select
          value={filters.location}
          onChange={(e) => onFilterChange({ location: e.target.value })}
          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Locations</option>
          <option value="Remote">Remote / Work From Home</option>
          {locations
            .filter((l) => l !== 'Remote')
            .map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
        </select>
      </div>
    </div>
  );
};
