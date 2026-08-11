import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { HeroSearch } from './components/HeroSearch';
import { StatsBanner } from './components/StatsBanner';
import { FilterSidebar } from './components/FilterSidebar';
import { JobCard } from './components/JobCard';
import { JobDetailModal } from './components/JobDetailModal';
import { ApplyModal } from './components/ApplyModal';
import { AIMatcherModal } from './components/AIMatcherModal';
import { SheetConfigModal } from './components/SheetConfigModal';
import { Job, JobFilter, SheetInfo, JobApplication } from './types';
import { Briefcase, RefreshCw, AlertTriangle, Bookmark, FileCheck, SearchX, SlidersHorizontal, ExternalLink } from 'lucide-react';

const DEFAULT_SHEET_ID = '15We6ItLp14oyoqTjboXlXEGIrEnYyENAWreNuhin45o';

export default function App() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [sheetInfo, setSheetInfo] = useState<SheetInfo>({
    sheetId: DEFAULT_SHEET_ID,
    sheetUrl: `https://docs.google.com/spreadsheets/d/${DEFAULT_SHEET_ID}/edit?usp=sharing`,
    lastSynced: '',
    totalJobs: 0,
    status: 'syncing',
  });

  const [filters, setFilters] = useState<JobFilter>({
    searchQuery: '',
    location: '',
    categories: [],
    workModes: [],
    sortBy: 'recent',
    onlyRemote: false,
    companyFilter: '',
  });

  const [activeTab, setActiveTab] = useState<'all' | 'bookmarks' | 'applied'>('all');

  // Bookmarks & Applications stored in LocalStorage
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('job_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [applications, setApplications] = useState<Record<string, JobApplication>>(() => {
    try {
      const saved = localStorage.getItem('job_applications');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Modal States
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applyJob, setApplyJob] = useState<Job | null>(null);
  const [isAIMatcherOpen, setIsAIMatcherOpen] = useState(false);
  const [isSheetModalOpen, setIsSheetModalOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Persist bookmarks & applications
  useEffect(() => {
    localStorage.setItem('job_bookmarks', JSON.stringify(bookmarkedIds));
  }, [bookmarkedIds]);

  useEffect(() => {
    localStorage.setItem('job_applications', JSON.stringify(applications));
  }, [applications]);

  // Load jobs from server endpoint
  const loadJobs = async (sheetId: string = sheetInfo.sheetId, forceSync: boolean = false) => {
    setLoading(true);
    setError(null);
    setSheetInfo((prev) => ({ ...prev, status: 'syncing' }));

    try {
      const url = `/api/jobs?sheetId=${encodeURIComponent(sheetId)}${forceSync ? '&force=true' : ''}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch jobs from Google Sheet');
      }

      setJobs(data.jobs || []);
      setSheetInfo({
        sheetId: data.sheetId || sheetId,
        sheetUrl: `https://docs.google.com/spreadsheets/d/${data.sheetId || sheetId}/edit?usp=sharing`,
        lastSynced: data.lastSynced || new Date().toISOString(),
        totalJobs: (data.jobs || []).length,
        status: 'connected',
      });

      if (forceSync) {
        showToast(`Successfully synced ${data.total} jobs live from Google Sheet!`);
      }
    } catch (err: any) {
      console.error('Error loading jobs:', err);
      setError(err.message || 'Error connecting to Google Sheet.');
      setSheetInfo((prev) => ({
        ...prev,
        status: 'error',
        errorMessage: err.message,
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs(DEFAULT_SHEET_ID);
  }, []);

  const handleUpdateSheetId = (newSheetId: string) => {
    loadJobs(newSheetId, true);
  };

  const handleToggleBookmark = (jobId: string) => {
    if (bookmarkedIds.includes(jobId)) {
      setBookmarkedIds(bookmarkedIds.filter((id) => id !== jobId));
      showToast('Removed job from saved items.');
    } else {
      setBookmarkedIds([...bookmarkedIds, jobId]);
      showToast('Job saved to your bookmarks!');
    }
  };

  const handleApplicationSubmit = (app: JobApplication) => {
    setApplications((prev) => ({
      ...prev,
      [app.jobId]: app,
    }));
    showToast(`Application logged for ${app.jobTitle}!`);
  };

  const handleFilterChange = (newFilters: Partial<JobFilter>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      location: '',
      categories: [],
      workModes: [],
      sortBy: 'recent',
      onlyRemote: false,
      companyFilter: '',
    });
  };

  // Derive filter options
  const categories = useMemo(() => {
    const set = new Set<string>();
    jobs.forEach((j) => {
      if (j.category) set.add(j.category);
    });
    return Array.from(set).sort();
  }, [jobs]);

  const locations = useMemo(() => {
    const set = new Set<string>();
    jobs.forEach((j) => {
      if (j.location) set.add(j.location);
    });
    return Array.from(set).sort();
  }, [jobs]);

  const companies = useMemo(() => {
    const set = new Set<string>();
    jobs.forEach((j) => {
      if (j.company) set.add(j.company);
    });
    return Array.from(set).sort();
  }, [jobs]);

  const remoteJobsCount = useMemo(() => {
    return jobs.filter((j) => j.workMode === 'Remote').length;
  }, [jobs]);

  // Filter & Sort jobs
  const filteredJobs = useMemo(() => {
    let result = jobs;

    // Filter by Tab
    if (activeTab === 'bookmarks') {
      result = result.filter((j) => bookmarkedIds.includes(j.id));
    } else if (activeTab === 'applied') {
      result = result.filter((j) => !!applications[j.id]);
    }

    // Search Query (Title, Company, Description, Skills)
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      result = result.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          j.category.toLowerCase().includes(q) ||
          j.description.toLowerCase().includes(q) ||
          j.skills.some((sk) => sk.toLowerCase().includes(q))
      );
    }

    // Location
    if (filters.location) {
      if (filters.location === 'Remote') {
        result = result.filter((j) => j.workMode === 'Remote' || j.location.toLowerCase().includes('remote'));
      } else {
        result = result.filter((j) => j.location === filters.location);
      }
    }

    // Remote Only Toggle
    if (filters.onlyRemote) {
      result = result.filter((j) => j.workMode === 'Remote' || j.location.toLowerCase().includes('remote'));
    }

    // Categories
    if (filters.categories.length > 0) {
      result = result.filter((j) => filters.categories.includes(j.category));
    }

    // Work Modes
    if (filters.workModes.length > 0) {
      result = result.filter((j) => filters.workModes.includes(j.workMode));
    }

    // Company Filter
    if (filters.companyFilter) {
      result = result.filter((j) => j.company === filters.companyFilter);
    }

    // Sorting
    return [...result].sort((a, b) => {
      if (filters.sortBy === 'title') {
        return a.title.localeCompare(b.title);
      } else if (filters.sortBy === 'company') {
        return a.company.localeCompare(b.company);
      }
      return 0; // Default order from sheet
    });
  }, [jobs, filters, activeTab, bookmarkedIds, applications]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-indigo-600 text-white px-4 py-3 rounded-xl shadow-2xl border border-indigo-400/30 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <Briefcase className="w-4 h-4 text-amber-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Header */}
      <Header
        sheetInfo={sheetInfo}
        onRefreshSheet={() => loadJobs(sheetInfo.sheetId, true)}
        onOpenSheetModal={() => setIsSheetModalOpen(true)}
        onOpenAIMatcher={() => setIsAIMatcherOpen(true)}
        bookmarkedCount={bookmarkedIds.length}
        appliedCount={Object.keys(applications).length}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Hero Search Bar */}
      <HeroSearch
        filters={filters}
        onFilterChange={handleFilterChange}
        categories={categories}
        locations={locations}
        totalResults={filteredJobs.length}
        onOpenSheetModal={() => setIsSheetModalOpen(true)}
      />

      {/* Quick Metrics Bar */}
      <StatsBanner
        totalJobs={jobs.length}
        remoteJobsCount={remoteJobsCount}
        companiesCount={companies.length}
        categoriesCount={categories.length}
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
      />

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Mobile Filter Toggle Button */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="w-full py-2.5 px-4 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-slate-200 flex items-center justify-center gap-2"
          >
            <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
            <span>{mobileFilterOpen ? 'Hide Filters' : 'Show Advanced Filters'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Sidebar Filters */}
          <div className={`lg:col-span-3 ${mobileFilterOpen ? 'block' : 'hidden lg:block'}`}>
            <FilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
              allJobs={jobs}
              categories={categories}
              locations={locations}
              companies={companies}
            />
          </div>

          {/* Job Listing Grid */}
          <div className="lg:col-span-9 space-y-6">
            {/* Tab Title Indicator */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {activeTab === 'all' && <span>All Job Listings</span>}
                {activeTab === 'bookmarks' && (
                  <span className="flex items-center gap-2">
                    <Bookmark className="w-4 h-4 text-indigo-400" /> Saved Jobs
                  </span>
                )}
                {activeTab === 'applied' && (
                  <span className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-400" /> Applied Positions
                  </span>
                )}
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {filteredJobs.length} Results
                </span>
              </h2>

              {sheetInfo.lastSynced && (
                <span className="text-xs text-slate-400 hidden sm:block">
                  Synced: {new Date(sheetInfo.lastSynced).toLocaleTimeString()}
                </span>
              )}
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800 p-8 space-y-4">
                <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
                <h3 className="text-lg font-bold text-white">Fetching Live Jobs from Google Sheet...</h3>
                <p className="text-xs text-slate-400">Parsing positions, requirements, and remote roles...</p>
              </div>
            )}

            {/* Error State */}
            {!loading && error && (
              <div className="p-6 bg-rose-950/30 border border-rose-800/50 rounded-2xl text-center space-y-3">
                <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
                <h3 className="text-base font-bold text-rose-200">Could Not Connect to Google Sheet</h3>
                <p className="text-xs text-rose-300/80 max-w-md mx-auto">{error}</p>
                <button
                  onClick={() => loadJobs(sheetInfo.sheetId, true)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition"
                >
                  Retry Connection
                </button>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && filteredJobs.length === 0 && (
              <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800 p-8 space-y-4">
                <SearchX className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-xl font-bold text-white">No Matching Jobs Found</h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                  {activeTab === 'bookmarks'
                    ? "You haven't saved any job listings yet. Click the bookmark icon on any job card to save it here."
                    : activeTab === 'applied'
                    ? "You haven't submitted any job applications yet. Click 'Quick Apply' on any listing to track applications."
                    : 'Try clearing search keywords or adjusting your filter categories.'}
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md"
                >
                  Reset Search & Filters
                </button>
              </div>
            )}

            {/* Job Grid */}
            {!loading && !error && filteredJobs.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    isBookmarked={bookmarkedIds.includes(job.id)}
                    isApplied={!!applications[job.id]}
                    onToggleBookmark={handleToggleBookmark}
                    onSelectJob={setSelectedJob}
                    onOpenApply={setApplyJob}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <JobDetailModal
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
        isBookmarked={selectedJob ? bookmarkedIds.includes(selectedJob.id) : false}
        isApplied={selectedJob ? !!applications[selectedJob.id] : false}
        onToggleBookmark={handleToggleBookmark}
        onOpenApply={setApplyJob}
      />

      <ApplyModal
        job={applyJob}
        onClose={() => setApplyJob(null)}
        onSubmitApplication={handleApplicationSubmit}
        existingApp={applyJob ? applications[applyJob.id] : undefined}
      />

      <AIMatcherModal
        isOpen={isAIMatcherOpen}
        onClose={() => setIsAIMatcherOpen(false)}
        availableJobs={jobs}
        onSelectJob={setSelectedJob}
      />

      <SheetConfigModal
        sheetInfo={sheetInfo}
        isOpen={isSheetModalOpen}
        onClose={() => setIsSheetModalOpen(false)}
        onUpdateSheetId={handleUpdateSheetId}
        onForceSync={() => loadJobs(sheetInfo.sheetId, true)}
      />

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-8 px-4 sm:px-6 lg:px-8 text-slate-400 text-xs text-center mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
              J
            </div>
            <span className="font-bold text-slate-200">JobSearchHub</span>
            <span>• Synced live with Google Sheet</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <a
              href={`https://docs.google.com/spreadsheets/d/${sheetInfo.sheetId}/edit?usp=sharing`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-indigo-400 flex items-center gap-1 transition"
            >
              <span>View Source Google Sheet</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              onClick={() => loadJobs(sheetInfo.sheetId, true)}
              className="hover:text-indigo-400 flex items-center gap-1 transition cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Refresh Data</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
