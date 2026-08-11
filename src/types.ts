export interface Job {
  id: string;
  title: string;
  rawTitle: string;
  company: string;
  location: string;
  workMode: 'Remote' | 'Full-time' | 'Part-time' | 'Internship' | 'Contract';
  category: string;
  description: string;
  summary: string;
  sourceUrl?: string;
  enclosure?: string;
  postedDate?: string;
  skills: string[];
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
}

export interface JobFilter {
  searchQuery: string;
  location: string;
  categories: string[];
  workModes: string[];
  sortBy: 'recent' | 'title' | 'company';
  onlyRemote: boolean;
  companyFilter: string;
}

export interface SheetInfo {
  sheetId: string;
  sheetUrl: string;
  lastSynced: string;
  totalJobs: number;
  status: 'connected' | 'syncing' | 'error';
  errorMessage?: string;
}

export interface JobApplication {
  jobId: string;
  jobTitle: string;
  company: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  linkedInOrPortfolio?: string;
  coverLetter?: string;
  resumeFileName?: string;
  appliedAt: string;
}

export interface AIMatchResult {
  jobId: string;
  matchScore: number; // 0 - 100
  matchReason: string;
  keyMatchingSkills: string[];
}
