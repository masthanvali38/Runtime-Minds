import React from 'react';
import {
  FolderGit2,
  FileCode,
  Layers,
  Clock,
  Bug,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Activity,
  Stethoscope,
  Terminal,
  Zap,
  Play
} from 'lucide-react';
import { Repository, RepoDoctorReport, ActivityItem } from '../types';

interface DashboardViewProps {
  repository: Repository;
  doctorReport: RepoDoctorReport;
  activities: ActivityItem[];
  onNavigateTab: (tab: string) => void;
  onQuickAnalyzeBug: (description?: string) => void;
  onQuickRunBlastRadius: () => void;
  onQuickRunDoctor: () => void;
  onRunAllTests: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  repository,
  doctorReport,
  activities,
  onNavigateTab,
  onQuickAnalyzeBug,
  onQuickRunBlastRadius,
  onQuickRunDoctor,
  onRunAllTests
}) => {
  const criticalIssuesCount = doctorReport.issues.filter(i => i.severity === 'critical').length;
  const highIssuesCount = doctorReport.issues.filter(i => i.severity === 'high').length;
  const potentialRisksCount = criticalIssuesCount + highIssuesCount;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner / Overview */}
      <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 p-6 shadow-xl">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                AI-Powered Code Copilot
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Last scan: {repository.lastAnalyzedAt}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {repository.name}
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              {repository.description}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-2.5 shrink-0">
            <button
              onClick={() => onQuickAnalyzeBug('Users are logged out when they refresh the checkout page.')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition active:scale-95"
            >
              <Bug className="w-4 h-4" />
              <span>Detect & Fix Bug</span>
            </button>
            <button
              onClick={onQuickRunBlastRadius}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition"
            >
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Analyze Change</span>
            </button>
            <button
              onClick={onQuickRunDoctor}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition"
            >
              <Stethoscope className="w-4 h-4 text-emerald-400" />
              <span>Run Health Check</span>
            </button>
          </div>
        </div>

        {/* Repository Metadata Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-800/80 flex items-center justify-center text-indigo-400 border border-slate-700/60">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 uppercase font-mono tracking-wider">Total Files</p>
              <p className="text-lg font-bold text-white font-mono">{repository.totalFiles}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-800/80 flex items-center justify-center text-cyan-400 border border-slate-700/60">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 uppercase font-mono tracking-wider">Symbols & AST</p>
              <p className="text-lg font-bold text-white font-mono">
                {repository.totalFunctions} <span className="text-xs font-normal text-slate-400">funcs</span> / {repository.totalClasses} <span className="text-xs font-normal text-slate-400">classes</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-800/80 flex items-center justify-center text-emerald-400 border border-slate-700/60">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 uppercase font-mono tracking-wider">Lines of Code</p>
              <p className="text-lg font-bold text-white font-mono">{repository.totalLines.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-800/80 flex items-center justify-center text-amber-400 border border-slate-700/60">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 uppercase font-mono tracking-wider">Languages</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                {Object.entries(repository.languages).slice(0, 2).map(([lang, pct]) => (
                  <span key={lang} className="text-xs font-mono font-medium text-slate-300">
                    {lang} <span className="text-[10px] text-slate-400">{pct}%</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Health Overview Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 font-mono">
            Repository Health Overview
          </h2>
          <button
            onClick={() => onNavigateTab('repodoctor')}
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
          >
            <span>Full Diagnostic Report</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Card 1: Bugs Detected */}
          <div
            onClick={() => onNavigateTab('bug2fix')}
            className="group cursor-pointer rounded-xl bg-slate-900/80 border border-slate-800/80 p-4 hover:border-indigo-500/50 hover:bg-slate-900 transition shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Bugs Detected</span>
              <div className="w-7 h-7 rounded-md bg-rose-500/10 text-rose-400 flex items-center justify-center">
                <Bug className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold font-mono text-white">1</span>
              <span className="text-xs text-rose-400 ml-2 font-mono font-medium">Critical</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
              Checkout page refresh session drop
            </p>
          </div>

          {/* Card 2: Potential Risks */}
          <div
            onClick={() => onNavigateTab('blastradius')}
            className="group cursor-pointer rounded-xl bg-slate-900/80 border border-slate-800/80 p-4 hover:border-amber-500/50 hover:bg-slate-900 transition shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Potential Risks</span>
              <div className="w-7 h-7 rounded-md bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold font-mono text-white">{potentialRisksCount}</span>
              <span className="text-xs text-amber-400 ml-2 font-mono font-medium">Impact Areas</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
              Auth, Payment & DB dependencies
            </p>
          </div>

          {/* Card 3: Code Quality Issues */}
          <div
            onClick={() => onNavigateTab('repodoctor')}
            className="group cursor-pointer rounded-xl bg-slate-900/80 border border-slate-800/80 p-4 hover:border-cyan-500/50 hover:bg-slate-900 transition shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Quality Issues</span>
              <div className="w-7 h-7 rounded-md bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold font-mono text-white">{doctorReport.issues.length}</span>
              <span className="text-xs text-cyan-400 ml-2 font-mono font-medium">Total</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
              {doctorReport.issues.filter(i => i.autoFixAvailable).length} auto-fixable
            </p>
          </div>

          {/* Card 4: Test Status */}
          <div
            onClick={() => onNavigateTab('tests')}
            className="group cursor-pointer rounded-xl bg-slate-900/80 border border-slate-800/80 p-4 hover:border-emerald-500/50 hover:bg-slate-900 transition shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Test Status</span>
              <div className="w-7 h-7 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold font-mono text-white">9 / 10</span>
              <span className="text-xs text-emerald-400 ml-2 font-mono font-medium">Passing</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
              1 failing regression test
            </p>
          </div>

          {/* Card 5: Repository Health Score */}
          <div
            onClick={() => onNavigateTab('repodoctor')}
            className="group cursor-pointer rounded-xl bg-slate-900/80 border border-slate-800/80 p-4 hover:border-indigo-500/50 hover:bg-slate-900 transition shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Health Score</span>
              <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Grade {doctorReport.grade}
              </span>
            </div>
            <div className="mt-3 flex items-baseline">
              <span className="text-2xl font-bold font-mono text-white">{doctorReport.overallScore}</span>
              <span className="text-xs text-slate-400 font-mono ml-1">/ 100</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2">
              <div
                className="bg-emerald-500 h-1.5 rounded-full"
                style={{ width: `${doctorReport.overallScore}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column Grid: Quick Workflows + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Workflow Walkthrough */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white">End-to-End Workflow Demonstration</h3>
                <p className="text-xs text-slate-400">
                  Experience the full developer cycle: <strong>Detect Bug → Root Cause → Fix → Test → Verification</strong>
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                Primary Demo
              </span>
            </div>

            {/* Stepper demonstration card */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-lg bg-slate-800/40 border border-slate-700/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-indigo-400 font-mono mb-1.5">
                    <span>STEP 01</span>
                    <Bug className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="text-xs font-semibold text-slate-200">Bug Detection</h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Describe bug or select symptom: checkout refresh forces logout.
                  </p>
                </div>
                <button
                  onClick={() => onQuickAnalyzeBug('Users are logged out when they refresh the checkout page.')}
                  className="mt-3 w-full py-1 text-[11px] font-medium rounded bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 transition text-center"
                >
                  Analyze Bug →
                </button>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-800/40 border border-slate-700/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-cyan-400 font-mono mb-1.5">
                    <span>STEP 02</span>
                    <Activity className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="text-xs font-semibold text-slate-200">Blast Radius</h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Evaluate ripple impact on checkout.py, payment.py and tests.
                  </p>
                </div>
                <button
                  onClick={onQuickRunBlastRadius}
                  className="mt-3 w-full py-1 text-[11px] font-medium rounded bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/30 transition text-center"
                >
                  Inspect Impact →
                </button>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-800/40 border border-slate-700/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-emerald-400 font-mono mb-1.5">
                    <span>STEP 03</span>
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="text-xs font-semibold text-slate-200">Suggested Fix</h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Review side-by-side diff and apply patch to auth.py.
                  </p>
                </div>
                <button
                  onClick={() => onNavigateTab('bug2fix')}
                  className="mt-3 w-full py-1 text-[11px] font-medium rounded bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/30 transition text-center"
                >
                  Review Diff →
                </button>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-800/40 border border-slate-700/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-amber-400 font-mono mb-1.5">
                    <span>STEP 04</span>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="text-xs font-semibold text-slate-200">Verification</h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Run regression tests and verify assertion log output.
                  </p>
                </div>
                <button
                  onClick={onRunAllTests}
                  className="mt-3 w-full py-1 text-[11px] font-medium rounded bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 border border-amber-500/30 transition text-center"
                >
                  Run Suites →
                </button>
              </div>
            </div>
          </div>

          {/* Language Breakdown & File Stats */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Repository Composition</h3>
            
            {/* Multi-color language bar */}
            <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-800 mb-3">
              {Object.entries(repository.languages).map(([lang, pct], idx) => {
                const colors = ['bg-indigo-500', 'bg-cyan-500', 'bg-amber-500', 'bg-emerald-500', 'bg-rose-500'];
                const color = colors[idx % colors.length];
                return (
                  <div
                    key={lang}
                    className={`${color} h-full transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                    title={`${lang}: ${pct}%`}
                  />
                );
              })}
            </div>

            <div className="flex flex-wrap gap-4 text-xs font-mono">
              {Object.entries(repository.languages).map(([lang, pct], idx) => {
                const dotColors = ['bg-indigo-400', 'bg-cyan-400', 'bg-amber-400', 'bg-emerald-400', 'bg-rose-400'];
                return (
                  <div key={lang} className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${dotColors[idx % dotColors.length]}`} />
                    <span className="text-slate-300">{lang}</span>
                    <span className="text-slate-400">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Recent Activity Timeline */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Recent Activity</h3>
            <span className="text-[10px] font-mono text-slate-400">{activities.length} events</span>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto max-h-[420px] pr-1">
            {activities.map((item, idx) => (
              <div key={item.id || idx} className="relative pl-5 pb-1 border-l border-slate-800 last:border-l-transparent">
                {/* Dot */}
                <div className={`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full ${
                  item.badgeColor === 'emerald' ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' :
                  item.badgeColor === 'rose' ? 'bg-rose-500 shadow-sm shadow-rose-500/50' :
                  item.badgeColor === 'amber' ? 'bg-amber-500' :
                  'bg-indigo-500 shadow-sm shadow-indigo-500/50'
                }`} />

                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-200">{item.title}</span>
                  <span className="text-[10px] font-mono text-slate-400">{item.timestamp}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  {item.description}
                </p>
                {item.badge && (
                  <span className="inline-block mt-1 text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {item.badge}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
