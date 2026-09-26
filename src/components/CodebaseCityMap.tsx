import React, { useState, useMemo } from 'react';
import { Repository, RepoFile } from '../types';
import { Layers, Activity, Bug, ArrowRight, ShieldCheck, Zap, Database, Terminal, FileCode } from 'lucide-react';

interface CodebaseCityMapProps {
  repository: Repository;
  selectedFile: RepoFile | null;
  onSelectFile: (file: RepoFile) => void;
  onTriggerBugFix?: (filePath: string) => void;
  onTriggerBlastRadius?: (filePath: string) => void;
  interactive?: boolean;
}

interface District {
  id: string;
  name: string;
  badge: string;
  color: string;
  borderColor: string;
  bgColor: string;
  textColor: string;
  files: RepoFile[];
}

export const CodebaseCityMap: React.FC<CodebaseCityMapProps> = ({
  repository,
  selectedFile,
  onSelectFile,
  onTriggerBugFix,
  onTriggerBlastRadius,
  interactive = true
}) => {
  const [hoveredFile, setHoveredFile] = useState<RepoFile | null>(null);

  // Group files into logical architecture districts based on path and purpose
  const districts: District[] = useMemo(() => {
    const authFiles: RepoFile[] = [];
    const paymentFiles: RepoFile[] = [];
    const coreFiles: RepoFile[] = [];
    const testFiles: RepoFile[] = [];
    const configFiles: RepoFile[] = [];

    repository.files.forEach(f => {
      const lower = f.path.toLowerCase();
      if (lower.includes('test')) {
        testFiles.push(f);
      } else if (lower.includes('auth') || lower.includes('security') || lower.includes('token') || lower.includes('session')) {
        authFiles.push(f);
      } else if (lower.includes('payment') || lower.includes('checkout') || lower.includes('ledger') || lower.includes('order')) {
        paymentFiles.push(f);
      } else if (lower.endsWith('.md') || lower.endsWith('.txt') || lower.endsWith('.json')) {
        configFiles.push(f);
      } else {
        coreFiles.push(f);
      }
    });

    const groups: District[] = [];

    if (authFiles.length > 0) {
      groups.push({
        id: 'auth',
        name: 'AUTH & IDENTITY DISTRICT',
        badge: 'SECURITY',
        color: 'from-purple-500 to-indigo-600',
        borderColor: 'border-indigo-500/40',
        bgColor: 'bg-indigo-950/20',
        textColor: 'text-indigo-400',
        files: authFiles
      });
    }

    if (paymentFiles.length > 0) {
      groups.push({
        id: 'payment',
        name: 'TRANSACTION & CHECKOUT DISTRICT',
        badge: 'FINANCIAL',
        color: 'from-cyan-500 to-blue-600',
        borderColor: 'border-cyan-500/40',
        bgColor: 'bg-cyan-950/20',
        textColor: 'text-cyan-400',
        files: paymentFiles
      });
    }

    if (coreFiles.length > 0) {
      groups.push({
        id: 'core',
        name: 'CORE SERVICES & DATA STORE',
        badge: 'SERVICES',
        color: 'from-emerald-500 to-teal-600',
        borderColor: 'border-emerald-500/40',
        bgColor: 'bg-emerald-950/20',
        textColor: 'text-emerald-400',
        files: coreFiles
      });
    }

    if (testFiles.length > 0) {
      groups.push({
        id: 'tests',
        name: 'VERIFICATION & TEST HARNESS',
        badge: 'TEST SUITES',
        color: 'from-amber-500 to-orange-600',
        borderColor: 'border-amber-500/40',
        bgColor: 'bg-amber-950/20',
        textColor: 'text-amber-400',
        files: testFiles
      });
    }

    if (configFiles.length > 0) {
      groups.push({
        id: 'config',
        name: 'MANIFEST & SPECIFICATIONS',
        badge: 'CONFIG',
        color: 'from-slate-400 to-slate-600',
        borderColor: 'border-slate-700/60',
        bgColor: 'bg-slate-900/30',
        textColor: 'text-slate-400',
        files: configFiles
      });
    }

    return groups;
  }, [repository.files]);

  // Check if a file has dependency links with the selected/hovered file
  const activeFocusFile = hoveredFile || selectedFile;
  const isLinked = (filePath: string) => {
    if (!activeFocusFile) return false;
    if (activeFocusFile.path === filePath) return true;
    
    // Check if active focus imports target, or target imports active focus
    const focusImports = activeFocusFile.imports || [];
    const baseName = filePath.split('/').pop()?.replace(/\.[^/.]+$/, '') || '';
    if (focusImports.some(imp => imp.includes(baseName))) return true;

    // Check dependency graph if available
    const depNode = repository.dependencyGraph?.find(n => n.path === activeFocusFile.path);
    if (depNode?.importedBy.includes(filePath) || depNode?.imports.some(imp => imp.includes(baseName))) {
      return true;
    }

    return false;
  };

  return (
    <div className="relative w-full rounded-2xl bg-[#070b13] border border-slate-800/80 p-5 shadow-2xl overflow-hidden select-none">
      {/* Subtle grid background pattern */}
      <div
        className="absolute inset-0 opacity-[0.12] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #94a3b8 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* Top Map Status Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800/70 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-300 font-semibold uppercase tracking-wider">
            Interactive Codebase Engineering Map
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">{repository.name}</span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded bg-indigo-500" />
            <span>Auth</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded bg-cyan-500" />
            <span>Payments</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded bg-emerald-500" />
            <span>Services</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded bg-amber-500" />
            <span>Tests</span>
          </div>
        </div>
      </div>

      {/* District Layout Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {districts.map(district => (
          <div
            key={district.id}
            className={`rounded-xl border ${district.borderColor} ${district.bgColor} p-4 backdrop-blur-sm transition-all duration-200 hover:border-slate-600/60`}
          >
            {/* District Header */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800/60">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono font-bold tracking-wider ${district.textColor}`}>
                  {district.name}
                </span>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                {district.badge}
              </span>
            </div>

            {/* Buildings Grid (Files represented as 3D-styled architectural blocks) */}
            <div className="grid grid-cols-2 gap-2.5">
              {district.files.map(file => {
                const isSelected = selectedFile?.path === file.path;
                const isHovered = hoveredFile?.path === file.path;
                const isDependencyLinked = isLinked(file.path);
                const funcCount = file.functions?.length || 0;
                const lines = file.lines || 50;

                // Scale building visual height based on lines of code
                const heightLevel = lines > 100 ? 'h-24' : lines > 60 ? 'h-20' : 'h-16';

                return (
                  <div
                    key={file.path}
                    onClick={() => onSelectFile(file)}
                    onMouseEnter={() => setHoveredFile(file)}
                    onMouseLeave={() => setHoveredFile(null)}
                    className={`group relative cursor-pointer rounded-lg border transition-all duration-200 p-2.5 flex flex-col justify-between ${heightLevel} ${
                      isSelected
                        ? 'border-indigo-400 bg-indigo-950/60 shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-400'
                        : isHovered
                        ? 'border-cyan-400 bg-slate-900 shadow-md'
                        : isDependencyLinked && activeFocusFile?.path !== file.path
                        ? 'border-cyan-500/70 bg-cyan-950/30'
                        : 'border-slate-800/80 bg-slate-950/70 hover:border-slate-700 hover:bg-slate-900/90'
                    }`}
                  >
                    {/* Isometric 3D top edge simulation */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-white/10 to-transparent rounded-t" />

                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono font-bold text-slate-200 group-hover:text-white truncate">
                          {file.name}
                        </span>
                        {file.path.includes('auth.py') && (
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" title="Bug detected here" />
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 mt-1 text-[10px] font-mono text-slate-400">
                        <span>{lines}L</span>
                        <span>•</span>
                        <span>{funcCount} fn</span>
                      </div>
                    </div>

                    {/* Isometric building stories representation bar */}
                    <div className="mt-auto pt-1.5 border-t border-slate-800/60 flex items-center justify-between">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: Math.min(5, Math.max(1, Math.ceil(lines / 25))) }).map((_, i) => (
                          <span
                            key={i}
                            className={`w-1.5 h-2.5 rounded-xs ${
                              isSelected
                                ? 'bg-indigo-400'
                                : isDependencyLinked
                                ? 'bg-cyan-400'
                                : 'bg-slate-700 group-hover:bg-slate-500'
                            }`}
                          />
                        ))}
                      </div>

                      <span className="text-[9px] font-mono text-slate-400 uppercase">
                        {file.language}
                      </span>
                    </div>

                    {/* Link badge if related to active focus */}
                    {isDependencyLinked && activeFocusFile?.path !== file.path && (
                      <span className="absolute -top-2 -right-1 text-[8px] font-mono px-1 py-0.2 rounded bg-cyan-500 text-black font-bold uppercase shadow">
                        Link
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Dependency Flow Footnote / Active Inspector Preview */}
      {selectedFile && (
        <div className="relative z-10 mt-4 p-3.5 rounded-xl bg-slate-900/90 border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-white">{selectedFile.path}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                  {selectedFile.lines} lines • {selectedFile.functions?.length || 0} symbols
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Imports: {selectedFile.imports?.slice(0, 4).join(', ') || 'None'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onTriggerBugFix && (
              <button
                onClick={() => onTriggerBugFix(selectedFile.path)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-mono transition"
              >
                <Bug className="w-3.5 h-3.5 text-rose-400" />
                <span>Find Bugs</span>
              </button>
            )}

            {onTriggerBlastRadius && (
              <button
                onClick={() => onTriggerBlastRadius(selectedFile.path)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-xs font-mono transition"
              >
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span>Analyze Impact</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
