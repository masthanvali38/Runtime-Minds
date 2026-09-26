import React, { useState, useRef } from 'react';
import { ArrowRight, Upload, Check, Sparkles, FolderGit2 } from 'lucide-react';
import { Repository, RepoFile } from '../types';
import { IsometricCodebaseCity } from './IsometricCodebaseCity';

interface LandingHeroProps {
  currentRepo: Repository;
  repositories: Repository[];
  onSelectRepo: (repo: Repository) => void;
  onAnalyzeRepository: (urlOrName: string) => void;
  onUploadZip: (file: File) => void;
  onSelectFile: (file: RepoFile) => void;
  onQuickModuleAction: (action: 'bug' | 'blast' | 'view', filePath: string) => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  currentRepo,
  repositories,
  onSelectRepo,
  onAnalyzeRepository,
  onUploadZip,
  onSelectFile,
  onQuickModuleAction
}) => {
  const [repoInput, setRepoInput] = useState<string>('https://github.com/runtime-minds/novashop-checkout-api');
  const [selectedZipName, setSelectedZipName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleZipSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedZipName(file.name);
      onUploadZip(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyzeRepository(repoInput);
  };

  return (
    <section className="pt-10 sm:pt-14 pb-16 px-6 sm:px-12 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        {/* Left Column: Hero Text & Repository Input */}
        <div className="lg:col-span-6 space-y-6">
          {/* Top Pill (Exact match to screenshot's top badge) */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 bg-white text-xs font-sans text-gray-600 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span className="text-[11px] font-medium">Runtime Minds — AI Developer Workflow Assistant</span>
          </div>

          {/* Large Editorial Headline (Crisp, pure black, tight leading) */}
          <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold tracking-tight text-[#0f172a] leading-[1.08] font-sans">
            Understand any<br />
            codebase.<br />
            Fix what matters.
          </h1>

          {/* Paragraph */}
          <p className="text-sm sm:text-base text-gray-600 max-w-lg leading-relaxed font-sans">
            Runtime Minds turns your repository into an engineering map that helps you find bugs, understand change impact, and improve codebase health.
          </p>

          <p className="text-xs text-gray-500 font-sans">
            Interactive multi-district analysis with real AST symbol extraction, automated root-cause isolation, and regression verification.
          </p>

          {/* Repository Input Section (Exact styling from screenshot) */}
          <div className="pt-1 space-y-2.5 max-w-xl">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                value={repoInput}
                onChange={e => {
                  setRepoInput(e.target.value);
                  setSelectedZipName(null);
                }}
                placeholder="owner/repo, or paste a GitHub URL"
                className="flex-1 h-11 bg-white border border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg px-3.5 text-xs font-mono text-gray-900 placeholder-gray-400 transition shadow-2xs outline-none"
              />

              <div className="flex items-center gap-2">
                {/* Periwinkle Map Button from screenshot */}
                <button
                  type="submit"
                  className="h-11 px-5 rounded-lg bg-[#7a9df8] hover:bg-[#688ff7] text-white text-xs font-semibold font-mono tracking-wide transition shadow-xs flex items-center justify-center gap-1.5 active:scale-98 cursor-pointer shrink-0"
                >
                  <span>Map it</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".zip"
                  className="hidden"
                  onChange={handleZipSelection}
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-11 px-4 rounded-lg bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 text-xs font-medium font-mono transition shadow-2xs flex items-center gap-1.5 cursor-pointer shrink-0"
                  title="Upload ZIP repository archive"
                >
                  <Upload className="w-3.5 h-3.5 text-gray-500" />
                  <span>Upload ZIP</span>
                </button>
              </div>
            </form>

            {/* ZIP selection note */}
            {selectedZipName && (
              <div className="text-xs font-mono text-emerald-700 flex items-center gap-1.5 pt-0.5">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>✓ {selectedZipName} selected</span>
              </div>
            )}

            {/* Subtle caption */}
            <p className="text-[11px] text-gray-500 font-sans">
              Any public repository or ZIP archive. Large ones take a little longer.
            </p>
          </div>
        </div>

        {/* Right Column: 3D Isometric City (Matches screenshot palette and geometry) */}
        <div className="lg:col-span-6 flex items-center justify-center">
          <IsometricCodebaseCity
            repository={currentRepo}
            selectedFile={null}
            onSelectFile={onSelectFile}
            onAction={onQuickModuleAction}
          />
        </div>
      </div>

      {/* PREBUILT SAMPLES (Exact structure and layout from screenshot) */}
      <div className="mt-14 pt-8 border-t border-gray-200/80">
        <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-1.5">
          <span>⚡</span>
          <span>PREBUILT, NO ANALYSIS STEP</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {repositories.map(repo => {
            const isSelected = currentRepo.id === repo.id;
            return (
              <div
                key={repo.id}
                onClick={() => {
                  onSelectRepo(repo);
                  setRepoInput(`https://github.com/runtime-minds/${repo.name}`);
                }}
                className={`p-5 rounded-xl border bg-white cursor-pointer transition-all duration-150 relative ${
                  isSelected
                    ? 'border-blue-500 ring-1 ring-blue-500 shadow-sm'
                    : 'border-gray-200/90 hover:border-gray-300 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-bold font-mono text-gray-900 truncate">
                    {repo.name}
                  </h3>
                  {isSelected && (
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 font-bold uppercase">
                      ACTIVE
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-500 font-sans mb-3 line-clamp-1">
                  {repo.description}
                </p>

                <p className="text-[11px] text-gray-600 font-mono leading-relaxed line-clamp-2">
                  {repo.id === 'repo-novashop'
                    ? 'Auth, checkout and payment districts. Reproducible session dropout bug on checkout reload.'
                    : repo.id === 'repo-taskflow'
                    ? 'Dispatcher queue and worker loop with concurrency race condition on task polling.'
                    : 'FastAPI financial settlement engine with webhook timing attack vulnerability.'}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
