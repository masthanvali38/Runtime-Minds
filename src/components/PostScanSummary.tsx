import React from 'react';
import { Bug, Activity, Stethoscope, ArrowRight, CheckCircle2, FileCode, Layers, GitBranch } from 'lucide-react';
import { Repository, RepositoryWideBugReport } from '../types';

interface PostScanSummaryProps {
  repository: Repository;
  bugReport?: RepositoryWideBugReport;
  onNavigateToModule: (module: 'bug2fix' | 'blastradius' | 'repodoctor' | 'explorer') => void;
  onReMap: () => void;
}

export const PostScanSummary: React.FC<PostScanSummaryProps> = ({
  repository,
  bugReport,
  onNavigateToModule,
  onReMap
}) => {
  return (
    <div className="py-12 px-6 sm:px-10 max-w-7xl mx-auto space-y-12">
      {/* Repository Analyzed Header */}
      <div className="border-b border-gray-200 pb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-gray-500">
              Repository analyzed
            </span>
          </div>

          <h1 className="text-3xl font-bold font-mono text-gray-900 tracking-tight">
            {repository.name}
          </h1>

          {/* Clean stats line matching prompt */}
          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-mono text-gray-600">
            <span>{repository.totalFiles} files</span>
            <span>•</span>
            <span>{repository.totalLines.toLocaleString()} lines</span>
            <span>•</span>
            <span>{repository.totalFunctions} functions</span>
            <span>•</span>
            <span>{repository.totalClasses} classes</span>
            <span>•</span>
            <span className="text-gray-900 font-semibold">{Object.keys(repository.languages)[0] || 'Python'}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigateToModule('explorer')}
            className="px-4 py-2 rounded-xl bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 text-xs font-mono font-medium transition shadow-2xs cursor-pointer"
          >
            View Codebase Map →
          </button>
          <button
            onClick={onReMap}
            className="px-3.5 py-2 rounded-xl text-gray-500 hover:text-gray-900 text-xs font-mono transition cursor-pointer"
          >
            Change Repository
          </button>
        </div>
      </div>

      {/* Three Main Capabilities Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CARD 1 — BUG2FIX */}
        <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-xs hover:border-purple-300 hover:shadow-sm transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center mb-5">
              <Bug className="w-5 h-5" />
            </div>

            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xl font-bold text-gray-900 font-sans">
                Bug2Fix
              </h2>
              {bugReport && (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                  {bugReport.issuesSummary.critical} Critical • {bugReport.bugs.length} Findings
                </span>
              )}
            </div>

            <p className="text-xs font-mono text-purple-700 font-semibold mt-0.5 mb-3">
              Full Repository Bug Audit & Fix.
            </p>

            <p className="text-xs text-gray-600 leading-relaxed font-sans mb-8">
              Scans all {repository.totalFiles} files across AST, control flow, and security rules. Traces root causes, generates fixes, and runs verification tests.
            </p>
          </div>

          <button
            onClick={() => onNavigateToModule('bug2fix')}
            className="w-full py-2.5 px-4 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-mono font-bold tracking-wide border border-purple-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Scan & Fix All Bugs →</span>
          </button>
        </div>

        {/* CARD 2 — BLAST RADIUS */}
        <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-xs hover:border-sky-300 hover:shadow-sm transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center mb-5">
              <Activity className="w-5 h-5" />
            </div>

            <h2 className="text-xl font-bold text-gray-900 font-sans">
              Blast Radius
            </h2>

            <p className="text-xs font-mono text-sky-700 font-semibold mt-0.5 mb-3">
              Understand change impact.
            </p>

            <p className="text-xs text-gray-600 leading-relaxed font-sans mb-8">
              See which files, functions, and components could be affected before changing your code.
            </p>
          </div>

          <button
            onClick={() => onNavigateToModule('blastradius')}
            className="w-full py-2.5 px-4 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-mono font-bold tracking-wide border border-sky-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Analyze Change →</span>
          </button>
        </div>

        {/* CARD 3 — REPO DOCTOR */}
        <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-xs hover:border-emerald-300 hover:shadow-sm transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center mb-5">
              <Stethoscope className="w-5 h-5" />
            </div>

            <h2 className="text-xl font-bold text-gray-900 font-sans">
              RepoDoctor
            </h2>

            <p className="text-xs font-mono text-emerald-700 font-semibold mt-0.5 mb-3">
              Check repository health.
            </p>

            <p className="text-xs text-gray-600 leading-relaxed font-sans mb-8">
              Find code-quality, testing, documentation, dependency, and maintainability issues.
            </p>
          </div>

          <button
            onClick={() => onNavigateToModule('repodoctor')}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-mono font-bold tracking-wide border border-emerald-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Run Health Check →</span>
          </button>
        </div>
      </div>

      {/* Workflow Explanation Section (Exact match to Section 19 of prompt) */}
      <div className="pt-8 border-t border-gray-200">
        <h3 className="text-base font-bold text-gray-900 font-sans mb-6">
          One repository. Three ways to understand it.
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 font-mono text-xs">
          <div className="space-y-1">
            <span className="font-bold text-gray-900 uppercase block tracking-wider">
              MAP
            </span>
            <p className="text-gray-500 font-sans text-xs">
              Understand the structure.
            </p>
          </div>

          <div className="space-y-1">
            <span className="font-bold text-purple-700 uppercase block tracking-wider">
              DETECT
            </span>
            <p className="text-gray-500 font-sans text-xs">
              Find problems and root causes.
            </p>
          </div>

          <div className="space-y-1">
            <span className="font-bold text-blue-700 uppercase block tracking-wider">
              IMPACT
            </span>
            <p className="text-gray-500 font-sans text-xs">
              Understand what changes could affect.
            </p>
          </div>

          <div className="space-y-1">
            <span className="font-bold text-emerald-700 uppercase block tracking-wider">
              VERIFY
            </span>
            <p className="text-gray-500 font-sans text-xs">
              Test before shipping.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
