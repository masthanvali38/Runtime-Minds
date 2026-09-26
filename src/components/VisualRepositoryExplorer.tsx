import React, { useState } from 'react';
import {
  FolderGit2,
  GitBranch,
  FileCode,
  Search,
  Bug,
  Activity,
  Code
} from 'lucide-react';
import { Repository, RepoFile } from '../types';
import { CleanCodebaseMap } from './CleanCodebaseMap';

interface VisualRepositoryExplorerProps {
  repository: Repository;
  onNavigateToModule: (module: 'bug2fix' | 'blastradius' | 'repodoctor' | 'tests' | 'code_viewer', file?: string) => void;
  onSelectFileDetail: (file: RepoFile) => void;
  onBackToSummary?: () => void;
}

export const VisualRepositoryExplorer: React.FC<VisualRepositoryExplorerProps> = ({
  repository,
  onNavigateToModule,
  onSelectFileDetail,
  onBackToSummary
}) => {
  const [selectedFile, setSelectedFile] = useState<RepoFile>(
    repository.files.find(f => f.path.includes('auth.py')) || repository.files[0]
  );
  const [fileFilter, setFileFilter] = useState<string>('');

  const fileDependencies = React.useMemo(() => {
    if (!selectedFile) return [];
    const directImports = selectedFile.imports || [];
    return repository.files.filter(f => {
      const base = f.name.replace(/\.[^/.]+$/, '');
      return directImports.some(imp => imp.includes(base)) && f.path !== selectedFile.path;
    });
  }, [selectedFile, repository.files]);

  const fileDependents = React.useMemo(() => {
    if (!selectedFile) return [];
    const baseName = selectedFile.name.replace(/\.[^/.]+$/, '');
    return repository.files.filter(f => {
      const imports = f.imports || [];
      return imports.some(imp => imp.includes(baseName)) && f.path !== selectedFile.path;
    });
  }, [selectedFile, repository.files]);

  const filteredTreeFiles = repository.files.filter(f =>
    f.path.toLowerCase().includes(fileFilter.toLowerCase())
  );

  return (
    <div className="py-10 px-6 sm:px-10 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span className="text-xs font-mono font-bold tracking-widest text-blue-700 uppercase">
              CODEBASE MAP
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-mono text-gray-900 tracking-tight">
            {repository.name}
          </h1>
          <p className="text-xs text-gray-500 font-sans mt-0.5">
            {repository.totalFiles} files • {repository.totalLines.toLocaleString()} lines • {repository.totalFunctions} functions
          </p>
        </div>

        {onBackToSummary && (
          <button
            onClick={onBackToSummary}
            className="text-xs font-mono text-gray-500 hover:text-gray-900 cursor-pointer self-start sm:self-center"
          >
            ← Overview
          </button>
        )}
      </div>

      {/* Grid: Left Tree + Center Map + Right Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Tree (3 cols) */}
        <div className="lg:col-span-3 rounded-2xl border border-gray-200 bg-white p-4 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-gray-500">
              Files
            </span>
            <span className="text-[10px] font-mono text-gray-400">
              {filteredTreeFiles.length}
            </span>
          </div>

          <div className="relative">
            <Search className="w-3 h-3 text-gray-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={fileFilter}
              onChange={e => setFileFilter(e.target.value)}
              placeholder="Search files..."
              className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-7 pr-3 py-1.5 text-xs text-gray-900 placeholder-gray-400 font-mono focus:outline-none focus:bg-white focus:border-blue-500"
            />
          </div>

          <div className="space-y-1 max-h-[460px] overflow-y-auto pr-1 font-mono text-xs">
            {filteredTreeFiles.map(file => {
              const isSelected = selectedFile?.path === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => {
                    setSelectedFile(file);
                    onSelectFileDetail(file);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 text-blue-900 font-semibold border border-blue-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="truncate">{file.name}</span>
                  <span className="text-[10px] text-gray-400 ml-1">{file.lines}L</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center: Clean Codebase Map (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <CleanCodebaseMap
            repository={repository}
            selectedFile={selectedFile}
            onSelectFile={file => {
              setSelectedFile(file);
              onSelectFileDetail(file);
            }}
            onQuickAction={(action, filePath) => {
              if (action === 'bug') onNavigateToModule('bug2fix', filePath);
              else if (action === 'blast') onNavigateToModule('blastradius', filePath);
            }}
          />
        </div>

        {/* Right: Component Inspector (3 cols) */}
        <div className="lg:col-span-3 rounded-2xl border border-gray-200 bg-white p-5 space-y-4 shadow-2xs">
          <div className="pb-3 border-b border-gray-100">
            <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400">
              Component Details
            </span>
            <h3 className="text-base font-bold font-mono text-gray-900 mt-0.5 truncate">
              {selectedFile?.name}
            </h3>
            <p className="text-[11px] font-mono text-blue-600 truncate">
              {selectedFile?.path}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100">
              <span className="text-gray-400 text-[10px] block uppercase">Language</span>
              <span className="text-gray-900 font-medium">{selectedFile?.language}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100">
              <span className="text-gray-400 text-[10px] block uppercase">Lines</span>
              <span className="text-gray-900 font-medium">{selectedFile?.lines} lines</span>
            </div>
          </div>

          {/* Functions in file */}
          <div>
            <span className="text-xs font-mono font-semibold text-gray-700 block mb-1 uppercase">
              Functions ({selectedFile?.functions?.length || 0})
            </span>
            <div className="space-y-1 max-h-32 overflow-y-auto pr-1 font-mono text-xs">
              {selectedFile?.functions && selectedFile.functions.length > 0 ? (
                selectedFile.functions.map(fn => (
                  <div key={fn.name} className="px-2 py-1 rounded bg-gray-50 border border-gray-100 text-gray-800 flex items-center justify-between">
                    <span>{fn.name}()</span>
                    <span className="text-[10px] text-gray-400">L{fn.lineStart}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 italic">No functions found.</p>
              )}
            </div>
          </div>

          {/* Dependencies */}
          <div>
            <span className="text-xs font-mono font-semibold text-gray-700 block mb-1 uppercase">
              Dependencies ({fileDependencies.length})
            </span>
            <div className="space-y-1 font-mono text-xs">
              {fileDependencies.length > 0 ? (
                fileDependencies.map(dep => (
                  <div key={dep.path} className="px-2 py-1 rounded bg-gray-50 border border-gray-100 text-gray-800">
                    {dep.name}
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 italic">No local file dependencies.</p>
              )}
            </div>
          </div>

          {/* Used By */}
          <div>
            <span className="text-xs font-mono font-semibold text-gray-700 block mb-1 uppercase">
              Used By ({fileDependents.length})
            </span>
            <div className="space-y-1 font-mono text-xs">
              {fileDependents.length > 0 ? (
                fileDependents.map(dep => (
                  <div key={dep.path} className="px-2 py-1 rounded bg-gray-50 border border-gray-100 text-gray-800">
                    {dep.name}
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 italic">No downstream callers.</p>
              )}
            </div>
          </div>

          {/* Action Triggers */}
          <div className="pt-2 border-t border-gray-100 space-y-2">
            <button
              onClick={() => onNavigateToModule('bug2fix', selectedFile?.path)}
              className="w-full py-2 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Bug className="w-3.5 h-3.5" />
              <span>Find Bugs</span>
            </button>

            <button
              onClick={() => onNavigateToModule('blastradius', selectedFile?.path)}
              className="w-full py-2 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Analyze Impact</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
