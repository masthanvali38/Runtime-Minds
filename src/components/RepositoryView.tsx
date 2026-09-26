import React, { useState } from 'react';
import {
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  Search,
  ChevronRight,
  ChevronDown,
  Layers,
  Bug,
  Activity,
  Copy,
  Check,
  Upload,
  Code,
  Sparkles
} from 'lucide-react';
import { Repository, RepoFile } from '../types';

interface RepositoryViewProps {
  repository: Repository;
  onSelectFileForBug: (filePath: string) => void;
  onSelectFileForBlast: (filePath: string) => void;
  onUploadZip: (file: File) => void;
}

export const RepositoryView: React.FC<RepositoryViewProps> = ({
  repository,
  onSelectFileForBug,
  onSelectFileForBlast,
  onUploadZip
}) => {
  const [selectedFile, setSelectedFile] = useState<RepoFile>(repository.files[0] || null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    src: true,
    tests: true,
    app: true
  });

  const filteredFiles = repository.files.filter(f =>
    f.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFolder = (folder: string) => {
    setExpandedFolders(prev => ({ ...prev, [folder]: !prev[folder] }));
  };

  const handleCopyCode = () => {
    if (!selectedFile) return;
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Group files by root directory
  const directories: Record<string, RepoFile[]> = {};
  const rootFiles: RepoFile[] = [];

  repository.files.forEach(file => {
    const parts = file.path.split('/');
    if (parts.length > 1) {
      const dir = parts[0];
      if (!directories[dir]) directories[dir] = [];
      directories[dir].push(file);
    } else {
      rootFiles.push(file);
    }
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            Repository Explorer
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono border border-slate-700">
              {repository.totalFiles} files
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse AST symbols, examine imports, inspect source code, or dispatch files directly into Bug2Fix and Blast Radius.
          </p>
        </div>

        {/* Quick actions on active file */}
        {selectedFile && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectFileForBug(selectedFile.path)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-mono transition"
            >
              <Bug className="w-3.5 h-3.5 text-indigo-400" />
              <span>Analyze Bugs in File</span>
            </button>
            <button
              onClick={() => onSelectFileForBlast(selectedFile.path)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-xs font-mono transition"
            >
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Blast Radius of File</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Split: File Tree (Left) and Code Viewer (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
        {/* File Tree Column */}
        <div className="lg:col-span-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col space-y-3">
          {/* File Search input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search files or code..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
            />
          </div>

          {/* Directory Hierarchy */}
          <div className="flex-1 overflow-y-auto space-y-1 pr-1 font-mono text-xs">
            {Object.entries(directories).map(([dirName, filesInDir]) => {
              const isExpanded = expandedFolders[dirName] ?? true;
              return (
                <div key={dirName} className="space-y-0.5">
                  <button
                    onClick={() => toggleFolder(dirName)}
                    className="w-full flex items-center gap-1.5 px-2 py-1 text-slate-300 hover:bg-slate-800/60 rounded text-left font-semibold text-xs"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    {isExpanded ? (
                      <FolderOpen className="w-3.5 h-3.5 text-indigo-400" />
                    ) : (
                      <Folder className="w-3.5 h-3.5 text-indigo-400" />
                    )}
                    <span>{dirName}/</span>
                    <span className="text-[10px] text-slate-500 ml-auto font-normal">
                      ({filesInDir.length})
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="pl-4 space-y-0.5 border-l border-slate-800 ml-2">
                      {filesInDir.map(file => {
                        const isSelected = selectedFile?.path === file.path;
                        return (
                          <button
                            key={file.path}
                            onClick={() => setSelectedFile(file)}
                            className={`w-full flex items-center justify-between px-2 py-1 rounded text-left transition ${
                              isSelected
                                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              <FileCode className="w-3 h-3 text-cyan-400 shrink-0" />
                              <span className="truncate">{file.name}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 shrink-0 ml-1">
                              {file.lines}L
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Root Files */}
            <div className="pt-1 space-y-0.5">
              {rootFiles.map(file => {
                const isSelected = selectedFile?.path === file.path;
                return (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full flex items-center justify-between px-2 py-1 rounded text-left transition ${
                      isSelected
                        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <FileText className="w-3 h-3 text-amber-400 shrink-0" />
                      <span className="truncate">{file.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0 ml-1">
                      {file.lines}L
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* AST Symbols breakdown for selected file */}
          {selectedFile && (
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold flex items-center gap-1">
                <Layers className="w-3 h-3 text-cyan-400" />
                Parsed Symbols in File
              </span>
              <div className="max-h-36 overflow-y-auto space-y-1 pr-1 font-mono text-[11px]">
                {selectedFile.functions && selectedFile.functions.length > 0 ? (
                  selectedFile.functions.map(fn => (
                    <div
                      key={fn.name}
                      className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800/80 text-slate-300 flex items-center justify-between"
                    >
                      <span className="text-indigo-300 truncate">def {fn.name}()</span>
                      <span className="text-[10px] text-slate-400">L{fn.lineStart}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-slate-400 italic">No exported functions found.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Code Viewer Column */}
        <div className="lg:col-span-8 rounded-xl border border-slate-800 bg-[#070b14] flex flex-col overflow-hidden">
          {/* File Tab Header */}
          <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono font-semibold text-slate-200">
                {selectedFile?.path}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                {selectedFile?.language}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-slate-200 px-2 py-1 rounded bg-slate-900 border border-slate-800"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Code Viewer with Line Numbers */}
          <div className="flex-1 overflow-auto p-4 font-mono text-xs text-slate-300 bg-[#080c16]">
            {selectedFile ? (
              <table className="w-full border-collapse">
                <tbody>
                  {selectedFile.content.split('\n').map((line, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30">
                      <td className="w-10 pr-4 text-right select-none text-slate-600 text-[11px]">
                        {idx + 1}
                      </td>
                      <td className="whitespace-pre font-mono text-slate-300 select-text">
                        {line}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">
                Select a file from the tree to view its content.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
