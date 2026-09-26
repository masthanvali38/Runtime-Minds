import React, { useState } from 'react';
import {
  Settings,
  Cpu,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Sliders,
  CheckCircle2,
  Terminal,
  Database
} from 'lucide-react';
import { Repository } from '../types';

interface SettingsViewProps {
  currentRepo: Repository;
  isAiEnabled: boolean;
  modelName: string;
  onResetRepo: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentRepo,
  isAiEnabled,
  modelName,
  onResetRepo
}) => {
  const [deepAnalysis, setDeepAnalysis] = useState<boolean>(true);
  const [autoRunTests, setAutoRunTests] = useState<boolean>(true);
  const [strictRiskScoring, setStrictRiskScoring] = useState<boolean>(true);
  const [resetDone, setResetDone] = useState<boolean>(false);

  const handleReset = () => {
    onResetRepo();
    setResetDone(true);
    setTimeout(() => setResetDone(false), 2500);
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-400" />
          Runtime Minds Settings
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure AI intelligence providers, analysis thresholds, and repository testing environments.
        </p>
      </div>

      {/* Model & AI Configuration */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
          <Cpu className="w-4 h-4 text-indigo-400" />
          AI Intelligence Engine
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono uppercase">Primary Model</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                ACTIVE
              </span>
            </div>
            <p className="text-base font-bold font-mono text-white">
              {modelName}
            </p>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Google GenAI TypeScript SDK v2.4 server-side proxy integration. Provides deep code reasoning, root cause synthesis, and test generation.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono uppercase">AST Heuristic Engine</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                ENABLED
              </span>
            </div>
            <p className="text-base font-bold font-mono text-white">
              Dual-Engine Fallback
            </p>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Provides instant local static parsing, AST symbol extraction, and deterministic blast-radius calculations even if offline.
            </p>
          </div>
        </div>
      </div>

      {/* Analysis Preferences */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          Analysis & Safety Controls
        </h2>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/70 border border-slate-800">
            <div>
              <span className="text-xs font-semibold text-slate-200">Deep Multi-Pass Semantic Analysis</span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Inspects both upstream callers and downstream callee ripple effects in Blast Radius.
              </p>
            </div>
            <input
              type="checkbox"
              checked={deepAnalysis}
              onChange={e => setDeepAnalysis(e.target.checked)}
              className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/70 border border-slate-800">
            <div>
              <span className="text-xs font-semibold text-slate-200">Automated Test Execution on Fix Application</span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Automatically verify fixes in Bug2Fix by executing generated test cases immediately.
              </p>
            </div>
            <input
              type="checkbox"
              checked={autoRunTests}
              onChange={e => setAutoRunTests(e.target.checked)}
              className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/70 border border-slate-800">
            <div>
              <span className="text-xs font-semibold text-slate-200">Strict Blast Radius Risk Scoring</span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Elevate risk ratings when changes touch Authentication, Payment, or Database transactions.
              </p>
            </div>
            <input
              type="checkbox"
              checked={strictRiskScoring}
              onChange={e => setStrictRiskScoring(e.target.checked)}
              className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Reset Workspace */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-rose-400" />
              Reset Repository Files
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Reverts all applied patches, restoring original repository files so you can run the primary demo again.
            </p>
          </div>

          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-semibold transition active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{resetDone ? 'Reset Complete!' : 'Restore Original Codebase'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
