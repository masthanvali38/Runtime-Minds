import React, { useState, useMemo } from 'react';
import { Repository, RepoFile } from '../types';
import { Layers, Activity, Bug, ArrowRight, ShieldCheck, FileCode, CheckCircle2 } from 'lucide-react';

interface CleanCodebaseMapProps {
  repository: Repository;
  selectedFile: RepoFile | null;
  onSelectFile: (file: RepoFile) => void;
  onQuickAction?: (action: 'bug' | 'blast' | 'view', filePath: string) => void;
}

interface DistrictGroup {
  id: string;
  title: string;
  category: string;
  pastelBg: string;
  borderColor: string;
  textColor: string;
  badgeBg: string;
  files: RepoFile[];
}

export const CleanCodebaseMap: React.FC<CleanCodebaseMapProps> = ({
  repository,
  selectedFile,
  onSelectFile,
  onQuickAction
}) => {
  const [hoveredFile, setHoveredFile] = useState<RepoFile | null>(null);

  // Group files into logical districts based on real repo files
  const groups: DistrictGroup[] = useMemo(() => {
    const authFiles: RepoFile[] = [];
    const paymentFiles: RepoFile[] = [];
    const coreFiles: RepoFile[] = [];
    const testFiles: RepoFile[] = [];

    repository.files.forEach(f => {
      const lower = f.path.toLowerCase();
      if (lower.includes('test')) {
        testFiles.push(f);
      } else if (lower.includes('auth') || lower.includes('security') || lower.includes('session')) {
        authFiles.push(f);
      } else if (lower.includes('payment') || lower.includes('checkout') || lower.includes('order') || lower.includes('ledger')) {
        paymentFiles.push(f);
      } else {
        coreFiles.push(f);
      }
    });

    const list: DistrictGroup[] = [];

    if (authFiles.length > 0) {
      list.push({
        id: 'auth',
        title: 'Auth & Session Cluster',
        category: 'Identity',
        pastelBg: 'bg-[#faf5ff]',
        borderColor: 'border-[#e9d5ff]',
        textColor: 'text-[#6b21a8]',
        badgeBg: 'bg-[#f3e8ff] text-[#7e22ce]',
        files: authFiles
      });
    }

    if (paymentFiles.length > 0) {
      list.push({
        id: 'payment',
        title: 'Transactions & Checkout',
        category: 'Payments',
        pastelBg: 'bg-[#f0f9ff]',
        borderColor: 'border-[#bae6fd]',
        textColor: 'text-[#0369a1]',
        badgeBg: 'bg-[#e0f2fe] text-[#0284c7]',
        files: paymentFiles
      });
    }

    if (coreFiles.length > 0) {
      list.push({
        id: 'core',
        title: 'Core Engine & Models',
        category: 'Services',
        pastelBg: 'bg-[#f0fdf4]',
        borderColor: 'border-[#bbf7d0]',
        textColor: 'text-[#15803d]',
        badgeBg: 'bg-[#dcfce7] text-[#16a34a]',
        files: coreFiles
      });
    }

    if (testFiles.length > 0) {
      list.push({
        id: 'tests',
        title: 'Verification Harness',
        category: 'Suites',
        pastelBg: 'bg-[#fffbeb]',
        borderColor: 'border-[#fde68a]',
        textColor: 'text-[#b45309]',
        badgeBg: 'bg-[#fef3c7] text-[#d97706]',
        files: testFiles
      });
    }

    return list;
  }, [repository.files]);

  const activeFocus = hoveredFile || selectedFile;

  // Determine if target file is connected to active focus
  const isConnected = (filePath: string) => {
    if (!activeFocus) return false;
    if (activeFocus.path === filePath) return true;

    const baseName = filePath.split('/').pop()?.replace(/\.[^/.]+$/, '') || '';
    if (activeFocus.imports?.some(imp => imp.includes(baseName))) return true;

    const depNode = repository.dependencyGraph?.find(n => n.path === activeFocus.path);
    if (depNode?.importedBy?.includes(filePath) || depNode?.imports?.some(imp => imp.includes(baseName))) {
      return true;
    }
    return false;
  };

  return (
    <div className="relative rounded-2xl bg-white border border-gray-200/90 p-5 shadow-xs overflow-hidden select-none">
      {/* Subtle blueprint dot grid */}
      <div
        className="absolute inset-0 opacity-[0.4] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #cbd5e1 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }}
      />

      {/* Top Map Header */}
      <div className="relative z-10 flex items-center justify-between pb-3.5 mb-3.5 border-b border-gray-100 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="font-mono text-gray-500 uppercase tracking-wider text-[11px]">
            Engineering Map
          </span>
          <span className="text-gray-300">/</span>
          <span className="font-mono font-medium text-gray-800">{repository.name}</span>
        </div>

        <span className="font-mono text-[11px] text-gray-400">
          {repository.totalFiles} files • {repository.totalFunctions} functions
        </span>
      </div>

      {/* Abstract Codebase Map Grid */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {groups.map(group => (
          <div
            key={group.id}
            className={`rounded-xl border ${group.borderColor} ${group.pastelBg} p-3.5 transition-all`}
          >
            {/* Group Header */}
            <div className="flex items-center justify-between mb-2.5 pb-1.5 border-b border-black/5">
              <span className={`text-[11px] font-mono font-semibold tracking-wide ${group.textColor}`}>
                {group.title}
              </span>
              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md font-medium ${group.badgeBg}`}>
                {group.category}
              </span>
            </div>

            {/* File Blocks */}
            <div className="grid grid-cols-2 gap-2">
              {group.files.map(file => {
                const isSelected = selectedFile?.path === file.path;
                const isHovered = hoveredFile?.path === file.path;
                const connected = isConnected(file.path);
                const isLandmark = file.name === 'auth.py' || file.name === 'payment.py' || file.name === 'checkout.py';
                const lines = file.lines || 60;

                return (
                  <div
                    key={file.path}
                    onClick={() => onSelectFile(file)}
                    onMouseEnter={() => setHoveredFile(file)}
                    onMouseLeave={() => setHoveredFile(null)}
                    className={`cursor-pointer rounded-lg border p-2.5 transition-all duration-150 relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-white border-blue-600 shadow-sm ring-1 ring-blue-500'
                        : isHovered
                        ? 'bg-white border-blue-400 shadow-xs'
                        : connected && activeFocus?.path !== file.path
                        ? 'bg-white/90 border-blue-300'
                        : isLandmark
                        ? 'bg-white border-gray-300 shadow-2xs'
                        : 'bg-white/70 border-gray-200/90 hover:bg-white hover:border-gray-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[11px] font-mono font-bold truncate ${
                          isSelected ? 'text-blue-900' : 'text-gray-900'
                        }`}>
                          {file.name}
                        </span>

                        {file.path.includes('auth.py') && (
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" title="Bug detected here" />
                        )}
                      </div>

                      <div className="text-[10px] font-mono text-gray-500 flex items-center gap-1.5">
                        <span>{lines}L</span>
                        <span>•</span>
                        <span>{file.functions?.length || 0} fn</span>
                      </div>
                    </div>

                    {/* Landmark building indicator bar */}
                    <div className="mt-2 pt-1 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: Math.min(4, Math.max(1, Math.ceil(lines / 30))) }).map((_, i) => (
                          <span
                            key={i}
                            className={`w-1.5 h-2 rounded-xs ${
                              isSelected
                                ? 'bg-blue-600'
                                : connected
                                ? 'bg-blue-400'
                                : 'bg-gray-300'
                            }`}
                          />
                        ))}
                      </div>

                      <span className="text-[9px] font-mono text-gray-400 uppercase">
                        {file.language.slice(0, 2)}
                      </span>
                    </div>

                    {connected && activeFocus?.path !== file.path && (
                      <span className="absolute -top-1.5 -right-1 text-[8px] font-mono font-bold px-1 py-0.2 rounded bg-blue-600 text-white uppercase shadow-xs">
                        LINK
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Active Inspector Footer */}
      {selectedFile && (
        <div className="relative z-10 mt-3.5 p-3 rounded-xl bg-gray-50 border border-gray-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-white border border-gray-200 flex items-center justify-center text-blue-600 shadow-2xs font-mono font-bold text-[10px]">
              {selectedFile.language.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <span className="font-mono font-semibold text-gray-900">
                {selectedFile.path}
              </span>
              <span className="text-gray-400 ml-2 font-mono text-[11px]">
                {selectedFile.lines} lines
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px]">
            {onQuickAction && (
              <>
                <button
                  onClick={() => onQuickAction('bug', selectedFile.path)}
                  className="px-2.5 py-1 rounded-md bg-white hover:bg-gray-100 text-purple-700 border border-purple-200 font-medium transition"
                >
                  Find Bugs
                </button>
                <button
                  onClick={() => onQuickAction('blast', selectedFile.path)}
                  className="px-2.5 py-1 rounded-md bg-white hover:bg-gray-100 text-blue-700 border border-blue-200 font-medium transition"
                >
                  Analyze Impact
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
