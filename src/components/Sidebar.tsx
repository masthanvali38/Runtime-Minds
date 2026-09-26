import React from 'react';
import {
  LayoutDashboard,
  Bug,
  Activity,
  Stethoscope,
  FolderGit2,
  CheckCircle2,
  Settings,
  Sparkles,
  GitBranch,
  ShieldCheck
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  repoName: string;
  branch: string;
  healthScore: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  repoName,
  branch,
  healthScore
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: undefined },
    { id: 'bug2fix', label: 'Bug2Fix', icon: Bug, badge: 'AI Fix' },
    { id: 'blastradius', label: 'Blast Radius', icon: Activity, badge: 'Impact' },
    { id: 'repodoctor', label: 'RepoDoctor', icon: Stethoscope, badge: `${healthScore}%` },
    { id: 'repository', label: 'Repository', icon: FolderGit2, badge: undefined },
    { id: 'tests', label: 'Test Results', icon: CheckCircle2, badge: undefined },
    { id: 'settings', label: 'Settings', icon: Settings, badge: undefined }
  ];

  return (
    <aside className="w-64 bg-[#0d131f] border-r border-slate-800/80 flex flex-col h-screen select-none shrink-0">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight text-white flex items-center gap-1.5">
              Runtime Minds
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-400 font-mono border border-indigo-500/20">
                v1.0
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">Developer Workflow Assistant</p>
          </div>
        </div>
      </div>

      {/* Active Repo Badge */}
      <div className="px-3 py-3 border-b border-slate-800/60 bg-slate-900/40">
        <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-1 px-1">
          Active Workspace
        </div>
        <div className="flex items-center justify-between px-2 py-1.5 rounded-md bg-slate-800/50 border border-slate-700/50">
          <div className="flex items-center gap-2 min-w-0">
            <FolderGit2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="text-xs font-mono text-slate-200 truncate">{repoName}</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400 shrink-0">
            <GitBranch className="w-3 h-3 text-slate-400" />
            <span>{branch}</span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-semibold tracking-wider text-slate-400 px-3 py-1 uppercase">
          Core Modules
        </div>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-300'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                    item.id === 'repodoctor'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Health Mini Card */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/30">
        <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-medium text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Repo Health
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400">{healthScore}%</span>
          </div>
          <div className="w-full bg-slate-700/60 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                healthScore >= 80 ? 'bg-emerald-500' : healthScore >= 60 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${healthScore}%` }}
            />
          </div>
          <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between font-mono">
            <span>AST Engine: Active</span>
            <span className="text-indigo-400">Gemini 3.8</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
