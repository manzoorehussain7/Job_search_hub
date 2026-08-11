import React, { useState } from 'react';
import { X, ExternalLink, RefreshCw, FileSpreadsheet, CheckCircle2, Copy, Check } from 'lucide-react';
import { SheetInfo } from '../types';

interface SheetConfigModalProps {
  sheetInfo: SheetInfo;
  isOpen: boolean;
  onClose: () => void;
  onUpdateSheetId: (newSheetId: string) => void;
  onForceSync: () => void;
}

export const SheetConfigModal: React.FC<SheetConfigModalProps> = ({
  sheetInfo,
  isOpen,
  onClose,
  onUpdateSheetId,
  onForceSync,
}) => {
  const [customInput, setCustomInput] = useState(sheetInfo.sheetId);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const fullSheetUrl = `https://docs.google.com/spreadsheets/d/${sheetInfo.sheetId}/edit?usp=sharing`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullSheetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Extract ID from full URL if user pasted a full URL
    let extractedId = customInput.trim();
    const match = customInput.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      extractedId = match[1];
    }

    if (extractedId) {
      onUpdateSheetId(extractedId);
      onClose();
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

        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Google Sheet Connection</h2>
            <p className="text-xs text-slate-400">
              Live data integration for job listings
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Active Sheet Card */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Connected Sheet URL
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Live Sync Active
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 break-all">
              {fullSheetUrl}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <a
                href={fullSheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Google Sheet in New Tab</span>
              </a>

              <button
                onClick={handleCopy}
                className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs flex items-center gap-1 transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Sync Metadata */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block mb-1">Total Jobs Loaded</span>
              <span className="text-lg font-bold text-white">{sheetInfo.totalJobs} Openings</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block mb-1">Last Synced</span>
              <span className="text-xs font-bold text-slate-200">
                {sheetInfo.lastSynced ? new Date(sheetInfo.lastSynced).toLocaleTimeString() : 'Just now'}
              </span>
            </div>
          </div>

          {/* Change Sheet ID Form */}
          <form onSubmit={handleSave} className="space-y-3 pt-2 border-t border-slate-800">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Change Google Sheet URL or ID
            </label>
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Paste Google Sheet URL or Sheet ID..."
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  onForceSync();
                  onClose();
                }}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
                <span>Force Re-sync Now</span>
              </button>

              <button
                type="submit"
                className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
              >
                Update Sheet Source
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
