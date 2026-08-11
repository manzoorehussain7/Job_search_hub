import React from 'react';
import { Briefcase, Wifi, Building, Layers, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { JobFilter } from '../types';

interface StatsBannerProps {
  totalJobs: number;
  remoteJobsCount: number;
  companiesCount: number;
  categoriesCount: number;
  filters: JobFilter;
  onFilterChange: (newFilters: Partial<JobFilter>) => void;
  onResetFilters: () => void;
}

export const StatsBanner: React.FC<StatsBannerProps> = ({
  totalJobs,
  remoteJobsCount,
  companiesCount,
  categoriesCount,
  filters,
  onFilterChange,
  onResetFilters,
}) => {
  const hasActiveFilters =
    filters.searchQuery ||
    filters.location ||
    filters.categories.length > 0 ||
    filters.workModes.length > 0 ||
    filters.onlyRemote ||
    filters.companyFilter;

  return (
    <div className="bg-slate-900/60 border-b border-slate-800 text-slate-300 py-3 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm">
        {/* Metric Badges */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 font-medium">
          <div className="flex items-center gap-1.5 text-slate-200">
            <Briefcase className="w-4 h-4 text-indigo-400" />
            <span>
              <strong className="text-white font-bold">{totalJobs}</strong> Jobs Listed
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-200">
            <Wifi className="w-4 h-4 text-cyan-400" />
            <span>
              <strong className="text-white font-bold">{remoteJobsCount}</strong> Remote Roles
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-200 hidden md:flex">
            <Building className="w-4 h-4 text-purple-400" />
            <span>
              <strong className="text-white font-bold">{companiesCount}</strong> Employers
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-200 hidden lg:flex">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>
              <strong className="text-white font-bold">{categoriesCount}</strong> Categories
            </span>
          </div>
        </div>

        {/* Sort & Quick Filter Controls */}
        <div className="flex items-center gap-3">
          {/* Remote Toggle Checkbox */}
          <label className="flex items-center gap-2 cursor-pointer bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-750 transition">
            <input
              type="checkbox"
              checked={filters.onlyRemote}
              onChange={(e) => onFilterChange({ onlyRemote: e.target.checked })}
              className="rounded border-slate-600 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 bg-slate-900"
            />
            <span className="text-xs font-medium text-slate-200">Remote Only</span>
          </label>

          {/* Sort Selector */}
          <div className="flex items-center gap-1 bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-700">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filters.sortBy}
              onChange={(e) => onFilterChange({ sortBy: e.target.value as any })}
              className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none cursor-pointer"
            >
              <option value="recent" className="bg-slate-900">Sort: Most Recent</option>
              <option value="title" className="bg-slate-900">Sort: Title A-Z</option>
              <option value="company" className="bg-slate-900">Sort: Company A-Z</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium underline underline-offset-2 transition"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
