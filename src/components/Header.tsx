import React from 'react';
import { Briefcase, RefreshCw, Bookmark, FileCheck, Sparkles, FileSpreadsheet, CheckCircle2, ExternalLink } from 'lucide-react';
import { SheetInfo } from '../types';

interface HeaderProps {
  sheetInfo: SheetInfo;
  onRefreshSheet: () => void;
  onOpenSheetModal: () => void;
  onOpenAIMatcher: () => void;
  bookmarkedCount: number;
  appliedCount: number;
  activeTab: 'all' | 'bookmarks' | 'applied';
  setActiveTab: (tab: 'all' | 'bookmarks' | 'applied') => void;
}

export const Header: React.FC<HeaderProps> = ({
  sheetInfo,
  onRefreshSheet,
  onOpenSheetModal,
  onOpenAIMatcher,
  bookmarkedCount,
  appliedCount,
  activeTab,
  setActiveTab,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
          {/* Logo & Sheet Status */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 ring-1 ring-white/20 shrink-0">
              <Briefcase className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white font-sans">
                  JobSearch<span className="text-indigo-400">Hub</span>
                </h1>
                <button
                  onClick={onOpenSheetModal}
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition cursor-pointer"
                  title="View Google Sheet connection details"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="hidden sm:inline">Synced with Sheet</span>
                  <span className="sm:hidden">Sheet</span>
                  <ExternalLink className="w-3 h-3 text-emerald-400/80" />
                </button>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Live Google Sheet Job Portal • {sheetInfo.totalJobs} Openings Listed
              </p>
            </div>
          </div>

          {/* Navigation & Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Sync Refresh Button */}
            <button
              onClick={onRefreshSheet}
              disabled={sheetInfo.status === 'syncing'}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 transition disabled:opacity-50 cursor-pointer shadow-sm"
              title="Sync latest data from Google Sheet"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${sheetInfo.status === 'syncing' ? 'animate-spin text-indigo-400' : 'text-slate-400'}`} />
              <span className="hidden md:inline">Sync Sheet</span>
            </button>

            {/* AI Resume Matcher */}
            <button
              onClick={onOpenAIMatcher}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-md shadow-indigo-500/20 border border-indigo-400/30 transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span className="hidden sm:inline">AI Resume Match</span>
              <span className="sm:hidden">AI Match</span>
            </button>

            {/* Tabs & Saved Counters */}
            <div className="flex items-center bg-slate-800/80 p-1 rounded-lg border border-slate-700/80">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                Jobs
              </button>
              <button
                onClick={() => setActiveTab('bookmarks')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition cursor-pointer ${
                  activeTab === 'bookmarks'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Saved</span>
                {bookmarkedCount > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-xs bg-indigo-400/30 text-white font-bold">
                    {bookmarkedCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('applied')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition cursor-pointer ${
                  activeTab === 'applied'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Applied</span>
                {appliedCount > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-xs bg-emerald-500/40 text-emerald-200 font-bold">
                    {appliedCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
