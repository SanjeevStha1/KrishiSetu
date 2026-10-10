import React, { useState } from 'react';
import {
  Code2,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  FileCode,
  Flame,
  Bug,
  ShieldCheck,
} from 'lucide-react';
import { DETECTED_PYTHON_BUGS } from '../data/agriData';
import { BugItem } from '../types/krishi';

export const BugReviewPanel: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedBugId, setSelectedBugId] = useState<string>(DETECTED_PYTHON_BUGS[0].id);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const selectedBug = DETECTED_PYTHON_BUGS.find((b) => b.id === selectedBugId) || DETECTED_PYTHON_BUGS[0];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-950/80 border border-rose-800/80 flex items-center justify-center">
              <Bug className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white font-mono">Python Codebase Bug Audit & Fixes</h2>
                <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-400 text-xs font-mono border border-rose-800">
                  {DETECTED_PYTHON_BUGS.length} Bugs Identified & Resolved
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Detailed Static & Runtime Diagnostic Report for KrishiSetu Pro v2.4.1 Backend Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded bg-rose-950/80 text-rose-300 border border-rose-800/60 font-bold">
              2 Critical Syntax/Runtime Crashes
            </span>
            <span className="px-2.5 py-1 rounded bg-amber-950/80 text-amber-300 border border-amber-800/60 font-bold">
              2 High Priority Logic Bugs
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Bug List + Interactive Code Diff Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Bug List */}
        <div className="space-y-3">
          {DETECTED_PYTHON_BUGS.map((bug) => {
            const isSelected = bug.id === selectedBugId;
            return (
              <div
                key={bug.id}
                id={`bug-tab-${bug.id}`}
                onClick={() => setSelectedBugId(bug.id)}
                className={`bg-slate-900 border rounded-xl p-4 transition cursor-pointer hover:border-slate-700 ${
                  isSelected ? 'border-rose-500 ring-1 ring-rose-500/40 bg-slate-900/90' : 'border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-mono text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5 text-slate-500" />
                    {bug.file}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
                      bug.severity === 'critical'
                        ? 'bg-rose-600 text-white'
                        : bug.severity === 'high'
                        ? 'bg-amber-600 text-white'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    {bug.severity}
                  </span>
                </div>

                <h3 className="font-bold text-white text-sm leading-snug mb-1">{bug.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2">{bug.description}</p>
              </div>
            );
          })}
        </div>

        {/* Right: Detailed Diff & One-Click Fix */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                    selectedBug.severity === 'critical'
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : selectedBug.severity === 'high'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-blue-950 text-blue-300 border border-blue-800'
                  }`}
                >
                  {selectedBug.severity.toUpperCase()}
                </span>
                <span className="font-mono text-xs text-slate-400">{selectedBug.file}</span>
              </div>
              <h3 className="text-base font-bold text-white mt-1">{selectedBug.title}</h3>
            </div>

            <button
              onClick={() => handleCopy(selectedBug.id, selectedBug.codeSnippetFixed)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold font-mono transition active:scale-95 shrink-0"
            >
              {copiedId === selectedBug.id ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Copied Fix!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy Fix Code
                </>
              )}
            </button>
          </div>

          <div className="text-xs text-slate-300 space-y-2">
            <p className="leading-relaxed">{selectedBug.description}</p>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px] text-rose-300 font-mono">
              <strong>Runtime Impact:</strong> {selectedBug.impact}
            </div>
          </div>

          {/* Side-by-Side or Stacked Code Comparison */}
          <div className="space-y-3 font-mono text-xs">
            {/* Bad snippet */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-rose-400 font-bold">
                <span className="flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Problematic Code (Original)
                </span>
              </div>
              <pre className="bg-slate-950 border border-rose-900/60 p-3 rounded-lg text-rose-300 overflow-x-auto text-[11px] leading-relaxed">
                <code>{selectedBug.codeSnippetBad}</code>
              </pre>
            </div>

            {/* Fixed snippet */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-emerald-400 font-bold">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Corrected Code (Fixed)
                </span>
              </div>
              <pre className="bg-slate-950 border border-emerald-900/60 p-3 rounded-lg text-emerald-300 overflow-x-auto text-[11px] leading-relaxed">
                <code>{selectedBug.codeSnippetFixed}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
