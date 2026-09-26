import React, { useState } from 'react';
import {
  Stethoscope,
  ShieldCheck,
  RotateCw,
  FileCode,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { Repository, RepoDoctorReport, RepoDoctorIssue } from '../types';

interface RepoDoctorViewProps {
  repository: Repository;
  report: RepoDoctorReport;
  isScanning: boolean;
  onRescan: () => void;
  onApplyIssueFix: (issue: RepoDoctorIssue) => void;
  onBackToSummary?: () => void;
}

export const RepoDoctorView: React.FC<RepoDoctorViewProps> = ({
  repository,
  report,
  isScanning,
  onRescan,
  onApplyIssueFix,
  onBackToSummary
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [appliedFixes, setAppliedFixes] = useState<Record<string, boolean>>({});

  const filteredIssues = report.issues.filter(issue => {
    if (selectedSeverity !== 'all' && issue.severity !== selectedSeverity) return false;
    if (selectedCategory !== 'all' && issue.category !== selectedCategory) return false;
    return true;
  });

  const handleFixClick = (issue: RepoDoctorIssue) => {
    onApplyIssueFix(issue);
    setAppliedFixes(prev => ({ ...prev, [issue.id]: true }));
  };

  const categories = [
    { id: 'all', label: 'All Issues', count: report.issues.length, score: report.overallScore },
    { id: 'codeQuality', label: 'Code Quality', count: report.issues.filter(i => i.category === 'codeQuality').length, score: report.categoryScores.codeQuality },
    { id: 'testCoverage', label: 'Testing', count: report.issues.filter(i => i.category === 'testCoverage').length, score: report.categoryScores.testCoverage },
    { id: 'dependencies', label: 'Dependencies', count: report.issues.filter(i => i.category === 'dependencies').length, score: report.categoryScores.dependencies },
    { id: 'documentation', label: 'Documentation', count: report.issues.filter(i => i.category === 'documentation').length, score: report.categoryScores.documentation },
    { id: 'maintainability', label: 'Maintainability', count: report.issues.filter(i => i.category === 'maintainability').length, score: report.categoryScores.maintainability }
  ];

  return (
    <div className="py-10 px-6 sm:px-10 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span className="text-xs font-mono font-bold tracking-widest text-emerald-700 uppercase">
              REPO DOCTOR
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-sans tracking-tight">
            Check repository health.
          </h1>
          <p className="text-xs text-gray-600 mt-1 max-w-2xl font-sans">
            Find maintainability, testing, dependency, and code-quality issues with automated remediation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onBackToSummary && (
            <button
              onClick={onBackToSummary}
              className="text-xs font-mono text-gray-500 hover:text-gray-900 cursor-pointer"
            >
              ← Overview
            </button>
          )}

          <button
            onClick={onRescan}
            disabled={isScanning}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold shadow-xs transition active:scale-98 disabled:bg-gray-300 flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Auditing...' : 'Run Health Check'}</span>
          </button>
        </div>
      </div>

      {/* Main Score Hero Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <span className="text-xs font-mono font-bold uppercase text-gray-400">
              Repository Health Score
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-5xl font-black font-mono text-emerald-700">
                {report.overallScore}
              </span>
              <span className="text-gray-400 font-mono text-2xl">/ 100</span>
              <span className="ml-3 px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-mono font-bold">
                Grade {report.grade}
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-2 max-w-xl font-sans leading-relaxed">
              {report.summary}
            </p>
          </div>

          <div className="flex items-center gap-5 border-t sm:border-t-0 sm:border-l border-gray-100 pt-4 sm:pt-0 sm:pl-8 font-mono text-xs">
            <div>
              <span className="text-gray-400 text-[10px] block uppercase">Coverage</span>
              <span className="text-xl font-bold text-gray-900">{report.metrics.testCoveragePct}%</span>
            </div>
            <div>
              <span className="text-gray-400 text-[10px] block uppercase">Complexity</span>
              <span className="text-xl font-bold text-blue-700">{report.metrics.cyclomaticComplexityAvg}</span>
            </div>
            <div>
              <span className="text-gray-400 text-[10px] block uppercase">Issues</span>
              <span className="text-xl font-bold text-amber-700">{report.issues.length}</span>
            </div>
          </div>
        </div>

        {/* Category Breakdown Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-8 pt-6 border-t border-gray-100 font-mono text-xs">
          {categories.map(cat => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/60 shadow-2xs'
                    : 'border-gray-200 bg-gray-50/60 hover:bg-white hover:border-gray-300'
                }`}
              >
                <span className="text-[10px] text-gray-500 block uppercase truncate">
                  {cat.label}
                </span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-base font-bold text-gray-900">
                    {cat.score}%
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {cat.count}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Issues Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-gray-900">
            Detected Issues ({filteredIssues.length})
          </h2>

          <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
            <span>Severity:</span>
            <select
              value={selectedSeverity}
              onChange={e => setSelectedSeverity(e.target.value)}
              className="bg-white border border-gray-200 rounded-lg px-2.5 py-1 text-xs text-gray-800 focus:outline-none"
            >
              <option value="all">All</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Issue Cards */}
        <div className="space-y-3 font-sans">
          {filteredIssues.map(issue => {
            const isFixed = appliedFixes[issue.id];

            return (
              <div
                key={issue.id}
                className="p-5 rounded-2xl bg-white border border-gray-200 hover:border-gray-300 transition space-y-3 shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                        issue.severity === 'critical' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        issue.severity === 'high' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-sky-50 text-sky-700 border-sky-200'
                      }`}>
                        {issue.severity}
                      </span>
                      <h3 className="text-base font-bold text-gray-900">
                        {issue.title}
                      </h3>
                    </div>

                    {issue.file && (
                      <p className="text-xs font-mono text-purple-700 mt-1 flex items-center gap-1.5">
                        <FileCode className="w-3.5 h-3.5" />
                        <span>{issue.file}</span>
                        {issue.line && <span>(line {issue.line})</span>}
                      </p>
                    )}
                  </div>

                  {issue.autoFixAvailable && (
                    <button
                      onClick={() => handleFixClick(issue)}
                      disabled={isFixed}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                        isFixed
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                      }`}
                    >
                      {isFixed ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Remediated</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5" />
                          <span>Quick Fix</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                <p className="text-xs text-gray-600 leading-relaxed">
                  {issue.description}
                </p>

                {/* Suggestion box */}
                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs">
                  <span className="font-mono text-emerald-700 font-bold uppercase text-[10px] block mb-1">
                    Suggested Solution
                  </span>
                  <p className="text-gray-700 leading-relaxed font-sans">
                    {issue.recommendation}
                  </p>
                  {issue.suggestedPatch && (
                    <div className="mt-2 font-mono text-[11px] p-2 bg-white rounded-lg border border-gray-200 text-emerald-900">
                      <code>{issue.suggestedPatch.replacement}</code>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
