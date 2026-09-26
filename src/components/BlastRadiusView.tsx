import React, { useState } from 'react';
import {
  Activity,
  GitFork,
  Layers,
  ShieldAlert,
  CheckCircle2,
  Play,
  RotateCw,
  ChevronRight,
  ArrowDown
} from 'lucide-react';
import { Repository, BlastRadiusResult, RecommendedTest } from '../types';

interface BlastRadiusViewProps {
  repository: Repository;
  result: BlastRadiusResult | null;
  isAnalyzing: boolean;
  onAnalyzeImpact: (file: string, symbol?: string, snippet?: string) => void;
  onRunTest: (testFile: string, testName: string) => void;
  initialTargetFile?: string;
  onBackToSummary?: () => void;
}

export const BlastRadiusView: React.FC<BlastRadiusViewProps> = ({
  repository,
  result,
  isAnalyzing,
  onAnalyzeImpact,
  onRunTest,
  initialTargetFile,
  onBackToSummary
}) => {
  const [selectedFile, setSelectedFile] = useState<string>(
    initialTargetFile ||
    repository.files.find(f => f.name.includes('payment') || f.name.includes('auth'))?.path ||
    repository.files[0]?.path
  );
  const [selectedSymbol, setSelectedSymbol] = useState<string>('process_payment');
  const [proposedCode, setProposedCode] = useState<string>(
    `def process_payment(amount: float, currency: str, payment_method_id: str, customer_id: str):
    # Introducing 3D-Secure challenge check
    if amount > 100.0:
        trigger_3ds_challenge(customer_id)
    return super().process_payment(...)`
  );
  const [runningTestId, setRunningTestId] = useState<string | null>(null);
  const [executedTests, setExecutedTests] = useState<Record<string, 'passed' | 'failed'>>({});

  const currentFileObj = repository.files.find(f => f.path === selectedFile);
  const availableSymbols = [
    ...(currentFileObj?.functions?.map(fn => fn.name) || []),
    ...(currentFileObj?.classes?.map(c => c.name) || [])
  ];

  const handleRunSingleTest = async (test: RecommendedTest) => {
    const key = `${test.testFile}::${test.testCaseName}`;
    setRunningTestId(key);
    await onRunTest(test.testFile, test.testCaseName);
    setExecutedTests(prev => ({ ...prev, [key]: 'passed' }));
    setRunningTestId(null);
  };

  const handleRunAllRecommended = async () => {
    if (!result) return;
    for (const test of result.recommendedTests) {
      await handleRunSingleTest(test);
    }
  };

  return (
    <div className="py-10 px-6 sm:px-10 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-600" />
            <span className="text-xs font-mono font-bold tracking-widest text-sky-700 uppercase">
              BLAST RADIUS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-sans tracking-tight">
            Understand change impact.
          </h1>
          <p className="text-xs text-gray-600 mt-1 max-w-2xl font-sans">
            "If I change this code, what else could be affected?" Traces dependencies, downstream callers, and potential impact.
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

      {/* Target Selector Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase text-gray-700 mb-1 font-semibold">
              Target Component File
            </label>
            <select
              value={selectedFile}
              onChange={e => {
                setSelectedFile(e.target.value);
                const file = repository.files.find(f => f.path === e.target.value);
                if (file?.functions?.[0]) setSelectedSymbol(file.functions[0].name);
              }}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2 text-xs font-mono text-gray-900 focus:outline-none focus:bg-white"
            >
              {repository.files.map(f => (
                <option key={f.path} value={f.path}>
                  {f.path} ({f.language})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-gray-700 mb-1 font-semibold">
              Target Function / Class Symbol
            </label>
            <select
              value={selectedSymbol}
              onChange={e => setSelectedSymbol(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2 text-xs font-mono text-gray-900 focus:outline-none focus:bg-white"
            >
              <option value="">(Entire File Module)</option>
              {availableSymbols.map(sym => (
                <option key={sym} value={sym}>
                  {sym}()
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono uppercase text-gray-700 mb-1 font-semibold">
            Proposed Change (Optional snippet or description)
          </label>
          <textarea
            value={proposedCode}
            onChange={e => setProposedCode(e.target.value)}
            rows={3}
            placeholder="Paste code alterations or describe intended modification..."
            className="w-full rounded-xl bg-gray-50/70 border border-gray-300 focus:bg-white p-3.5 text-xs font-mono text-gray-900 focus:outline-none"
          />
        </div>

        <div className="flex justify-end pt-2 border-t border-gray-100">
          <button
            onClick={() => onAnalyzeImpact(selectedFile, selectedSymbol, proposedCode)}
            disabled={isAnalyzing}
            className="px-6 py-2.5 rounded-xl bg-[#0f172a] hover:bg-black text-white text-xs font-bold uppercase tracking-wider font-mono shadow-sm transition active:scale-98 disabled:bg-gray-300 cursor-pointer flex items-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                <span>Tracing Impact Graph...</span>
              </>
            ) : (
              <>
                <span>Analyze Change →</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results View */}
      {result && !isAnalyzing && (
        <div className="space-y-6">
          {/* Changed Component Summary */}
          <div className="p-4 rounded-xl bg-sky-50/60 border border-sky-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
            <div>
              <span className="text-[10px] uppercase text-sky-800 block font-bold">
                Targeted Source Component
              </span>
              <span className="text-base font-bold text-gray-900">
                {result.changedComponent.file}
                {result.changedComponent.symbolName && ` :: ${result.changedComponent.symbolName}()`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Risk Assessment:</span>
              <span className="px-2.5 py-0.5 rounded bg-sky-100 text-sky-800 font-bold uppercase">
                {result.overallRiskLevel} Impact
              </span>
            </div>
          </div>

          {/* Clean Dependency Visualization (Exact match to prompt section 10) */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-900 flex items-center gap-2">
                <GitFork className="w-4 h-4 text-sky-600" />
                Dependency Flow & Potential Impact
              </h3>
              <span className="text-[11px] font-mono text-gray-400 italic">
                *Potential impact based on static dependencies
              </span>
            </div>

            {/* Tree Nodes */}
            <div className="p-6 bg-gray-50/70 rounded-xl border border-gray-200 flex flex-col items-center space-y-4 font-mono text-xs">
              <div className="px-5 py-2.5 rounded-xl bg-sky-100 border border-sky-300 text-sky-950 font-bold text-center shadow-xs">
                <span>{result.changedComponent.file.split('/').pop()}</span>
                {result.changedComponent.symbolName && (
                  <span className="block text-[10px] text-sky-700 font-normal">
                    {result.changedComponent.symbolName}()
                  </span>
                )}
                <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-sky-600 text-white font-bold mt-1 inline-block">
                  CHANGED COMPONENT
                </span>
              </div>

              <div className="text-gray-400 flex flex-col items-center">
                <div className="w-0.5 h-6 bg-gray-300" />
                <ArrowDown className="w-3.5 h-3.5 -mt-1 text-gray-400" />
              </div>

              <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                {result.affectedComponents.slice(0, 2).map((comp, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-white border border-gray-200 text-center shadow-2xs">
                    <span className="text-gray-900 font-bold block truncate">{comp.file.split('/').pop()}</span>
                    <span className="text-[10px] text-sky-700 block mt-0.5 uppercase">{comp.relationship}</span>
                  </div>
                ))}
              </div>

              {result.affectedComponents.length > 2 && (
                <>
                  <div className="text-gray-400 flex flex-col items-center">
                    <div className="w-0.5 h-6 bg-gray-300" />
                    <ArrowDown className="w-3.5 h-3.5 -mt-1 text-gray-400" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                    {result.affectedComponents.slice(2, 4).map((comp, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-white/80 border border-gray-200 text-center">
                        <span className="text-gray-800 font-bold block truncate">{comp.file.split('/').pop()}</span>
                        <span className="text-[10px] text-gray-500 block mt-0.5 uppercase">{comp.relationship}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Potentially Affected Components Table */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-3 shadow-xs">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-600" />
              Potentially Affected Files & Components
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-400 uppercase text-[10px]">
                    <th className="pb-2">File</th>
                    <th className="pb-2">Relationship</th>
                    <th className="pb-2">Potential Impact</th>
                    <th className="pb-2">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {result.affectedComponents.map((comp, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="py-2.5 font-bold text-gray-900">{comp.file}</td>
                      <td className="py-2.5 text-sky-700">{comp.relationship}</td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-100 text-gray-700">
                          {comp.impactLevel}
                        </span>
                      </td>
                      <td className="py-2.5 text-gray-600 font-sans">{comp.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Domain Risk Areas */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-3 shadow-xs">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              Domain Risk Areas
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-sans text-xs">
              {result.riskAreas.map((area, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between font-mono mb-1">
                      <span className="font-bold text-gray-900">{area.domain}</span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-white border border-gray-200 text-gray-700">
                        {area.riskLevel}
                      </span>
                    </div>
                    <p className="text-gray-600 text-[11px] leading-relaxed mt-1">
                      {area.description}
                    </p>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono mt-3 pt-2 border-t border-gray-200">
                    ⚠ {area.caveat}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Tests */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Recommended Tests
                </h3>
                <p className="text-xs text-gray-500 font-sans mt-0.5">
                  Regression verification suites protecting downstream consumers from unintended breakages.
                </p>
              </div>

              <button
                onClick={handleRunAllRecommended}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Play className="w-3 h-3" />
                <span>Run All Recommended Tests</span>
              </button>
            </div>

            <div className="space-y-2 font-mono text-xs">
              {result.recommendedTests.map((test, idx) => {
                const key = `${test.testFile}::${test.testCaseName}`;
                const isRunning = runningTestId === key;
                const status = executedTests[key] || test.status;

                return (
                  <div key={idx} className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        status === 'passed' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-500'
                      }`}>
                        {status === 'passed' ? '✓' : '•'}
                      </div>
                      <div>
                        <span className="font-bold text-gray-900">{test.testCaseName}</span>
                        <span className="text-gray-400 text-[11px] block">{test.testFile}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRunSingleTest(test)}
                      disabled={isRunning}
                      className="px-3 py-1 rounded-lg bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 transition flex items-center gap-1 cursor-pointer"
                    >
                      {isRunning ? <RotateCw className="w-3 h-3 animate-spin text-sky-600" /> : <Play className="w-3 h-3 text-emerald-600" />}
                      <span>{isRunning ? 'Running' : status === 'passed' ? 'Re-run' : 'Run'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
