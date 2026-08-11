import React, { useState } from 'react';
import { X, Send, CheckCircle2, User, Mail, Phone, Link, FileText, Upload } from 'lucide-react';
import { Job, JobApplication } from '../types';

interface ApplyModalProps {
  job: Job | null;
  onClose: () => void;
  onSubmitApplication: (app: JobApplication) => void;
  existingApp?: JobApplication;
}

export const ApplyModal: React.FC<ApplyModalProps> = ({
  job,
  onClose,
  onSubmitApplication,
  existingApp,
}) => {
  const [candidateName, setCandidateName] = useState(existingApp?.candidateName || '');
  const [candidateEmail, setCandidateEmail] = useState(existingApp?.candidateEmail || '');
  const [candidatePhone, setCandidatePhone] = useState(existingApp?.candidatePhone || '');
  const [linkedInOrPortfolio, setLinkedInOrPortfolio] = useState(existingApp?.linkedInOrPortfolio || '');
  const [coverLetter, setCoverLetter] = useState(existingApp?.coverLetter || '');
  const [resumeFileName, setResumeFileName] = useState(existingApp?.resumeFileName || '');
  const [submitted, setSubmitted] = useState(false);

  if (!job) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateName.trim() || !candidateEmail.trim()) return;

    const newApp: JobApplication = {
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      candidateName,
      candidateEmail,
      candidatePhone,
      linkedInOrPortfolio,
      coverLetter,
      resumeFileName: resumeFileName || 'Candidate_Resume.pdf',
      appliedAt: new Date().toISOString(),
    };

    onSubmitApplication(newApp);
    setSubmitted(true);
  };

  const handleFileSimulate = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFileName(e.target.files[0].name);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-xl bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl text-slate-100 overflow-hidden my-8 p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-white">Application Submitted!</h3>
            <p className="text-slate-300 text-sm max-w-md mx-auto">
              Your application for <strong className="text-white">{job.title}</strong> at{' '}
              <strong className="text-white">{job.company}</strong> has been logged. We saved your records for instant reference.
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition cursor-pointer"
            >
              Back to Job Search
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                Quick Job Application
              </span>
              <h2 className="text-xl font-bold text-white mt-1">{job.title}</h2>
              <p className="text-xs text-slate-400">{job.company} • {job.location}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={candidateEmail}
                      onChange={(e) => setCandidateEmail(e.target.value)}
                      placeholder="john@example.com"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="tel"
                      value={candidatePhone}
                      onChange={(e) => setCandidatePhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* LinkedIn or Portfolio */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">LinkedIn / Portfolio Link</label>
                <div className="relative">
                  <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="url"
                    value={linkedInOrPortfolio}
                    onChange={(e) => setLinkedInOrPortfolio(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Resume File Attachment */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Attach Resume / CV</label>
                <div className="relative border-2 border-dashed border-slate-800 hover:border-indigo-500/50 bg-slate-950 rounded-xl p-3 text-center transition cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileSimulate}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                    <Upload className="w-4 h-4 text-indigo-400" />
                    <span>{resumeFileName ? `Uploaded: ${resumeFileName}` : 'Click or drop PDF / Word resume file'}</span>
                  </div>
                </div>
              </div>

              {/* Cover Letter */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Cover Note / Summary</label>
                <textarea
                  rows={3}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Briefly describe why you are a great fit for this position..."
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Job Application</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
