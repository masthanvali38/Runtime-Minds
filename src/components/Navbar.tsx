import React from 'react';
import {
  FolderGit2,
  Bug,
  Activity,
  Stethoscope,
  ChevronDown,
  Moon,
  Sun,
  Layers
} from 'lucide-react';
import { Repository } from '../types';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  currentRepo: Repository;
  repositories: Repository[];
  onSelectRepo: (repo: Repository) => void;
  onGoHome: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  currentRepo,
  repositories,
  onSelectRepo,
  onGoHome
}) => {
  return (
    <header className="h-16 bg-[#fafafa]/95 backdrop-blur-sm border-b border-gray-200/80 px-6 sm:px-10 flex items-center justify-between sticky top-0 z-40 select-none">
      {/* Left: Minimal Runtime Minds Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onGoHome}
          className="flex items-center gap-2.5 text-left group transition"
        >
          <div className="w-7 h-7 rounded-md bg-[#0f172a] text-white flex items-center justify-center font-mono font-bold text-xs shadow-sm">
            RM
          </div>
          <span className="text-sm font-bold tracking-tight text-[#0f172a] group-hover:text-blue-600 transition">
            Runtime Minds
          </span>
        </button>
      </div>

      {/* Right: Minimal Navigation */}
      <div className="flex items-center gap-6">
        <nav className="hidden md:flex items-center gap-5 text-xs font-medium text-gray-600">
          <button
            onClick={() => onSelectTab('explorer')}
            className={`transition ${
              currentTab === 'explorer' || currentTab === 'code_viewer'
                ? 'text-[#0f172a] font-semibold'
                : 'hover:text-[#0f172a]'
            }`}
          >
            Repository
          </button>
          <button
            onClick={() => onSelectTab('bug2fix')}
            className={`transition ${
              currentTab === 'bug2fix' ? 'text-purple-700 font-semibold' : 'hover:text-[#0f172a]'
            }`}
          >
            Bug2Fix
          </button>
          <button
            onClick={() => onSelectTab('blastradius')}
            className={`transition ${
              currentTab === 'blastradius' ? 'text-blue-700 font-semibold' : 'hover:text-[#0f172a]'
            }`}
          >
            Blast Radius
          </button>
          <button
            onClick={() => onSelectTab('repodoctor')}
            className={`transition ${
              currentTab === 'repodoctor' ? 'text-emerald-700 font-semibold' : 'hover:text-[#0f172a]'
            }`}
          >
            RepoDoctor
          </button>
        </nav>

        {/* Subtle Repo Dropdown */}
        <div className="relative flex items-center">
          <select
            value={currentRepo.id}
            onChange={e => {
              const found = repositories.find(r => r.id === e.target.value);
              if (found) onSelectRepo(found);
            }}
            className="appearance-none bg-white border border-gray-200 hover:border-gray-300 rounded-lg pl-3 pr-7 py-1.5 text-xs font-mono text-gray-700 focus:outline-none cursor-pointer shadow-xs transition"
          >
            {repositories.map(r => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 text-gray-400 absolute right-2 pointer-events-none" />
        </div>

        {/* Subtle Theme/Status icon */}
        <div className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 bg-white shadow-2xs" title="Light theme active">
          <Sun className="w-3.5 h-3.5 text-gray-500" />
        </div>
      </div>
    </header>
  );
};
