import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Play,
  RotateCw,
  Terminal,
  FileCode,
  Layers,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { Repository } from '../types';

interface TestResultsViewProps {
  repository: Repository;
  onExecuteSuite: (testFile?: string, testName?: string) => Promise<any>;
}

export const TestResultsView: React.FC<TestResultsViewProps> = ({
  repository,
  onExecuteSuite
}) => {
  const [isRunningAll, setIsRunningAll] = useState<boolean>(false);
  const [runningTestKey, setRunningTestKey] = useState<string | null>(null);
  const [terminalLogs, setTerminalLogs] = useState<string>(
`============================= test session starts ==============================
platform linux -- Python 3.11.8, pytest-8.1.1, pluggy-1.4.0
rootdir: /workspace/${repository.name}
collected 10 items

tests/test_auth.py::test_token_creation PASSED                           [ 10%]
tests/test_auth.py::test_valid_session_decode PASSED                    [ 20%]
tests/test_auth.py::test_session_preservation_on_page_refresh PASSED    [ 30%]
tests/test_auth.py::test_session_revocation PASSED                      [ 40%]
tests/test_checkout.py::test_checkout_initiation PASSED                 [ 50%]
tests/test_checkout.py::test_checkout_on_page_refresh PASSED            [ 60%]
tests/test_checkout.py::test_apply_discount_voucher PASSED             [ 70%]
tests/test_payment.py::test_process_valid_payment PASSED                [ 80%]
tests/test_payment.py::test_reject_negative_amount PASSED               [ 90%]
tests/test_payment.py::test_refund_flow PASSED                          [100%]

============================== 10 passed in 0.54s ==============================`
  );

  const testFiles = repository.files.filter(f => f.path.includes('test'));

  const handleRunAll = async () => {
    setIsRunningAll(true);
    setTerminalLogs('Running all repository test suites...\n');
    const res = await onExecuteSuite(undefined, 'All Test Suites');
    setTerminalLogs(res.output || 'All 10 tests passed successfully in 0.54s.');
    setIsRunningAll(false);
  };

  const handleRunSingle = async (filePath: string, funcName: string) => {
    const key = `${filePath}::${funcName}`;
    setRunningTestKey(key);
    const res = await onExecuteSuite(filePath, funcName);
    setTerminalLogs(prev => `[RUN] ${key}\n${res.output || 'PASSED'}\n\n` + prev);
    setRunningTestKey(null);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            Test Runner & Results
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Automated test harnesses, assertion verification logs, and regression tracking.
          </p>
        </div>

        <button
          onClick={handleRunAll}
          disabled={isRunningAll}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition active:scale-95 disabled:bg-slate-800"
        >
          <Play className={`w-3.5 h-3.5 ${isRunningAll ? 'animate-spin' : ''}`} />
          <span>{isRunningAll ? 'Running All Suites...' : 'Run All Test Suites'}</span>
        </button>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400">Total Test Cases</span>
          <p className="text-2xl font-bold font-mono text-white mt-1">10</p>
          <span className="text-[11px] text-slate-400 font-mono">across {testFiles.length} suites</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400">Passing Tests</span>
          <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">10</p>
          <span className="text-[11px] text-emerald-400/80 font-mono">100% pass rate</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400">Failed / Regressions</span>
          <p className="text-2xl font-bold font-mono text-slate-400 mt-1">0</p>
          <span className="text-[11px] text-slate-400 font-mono">No regressions</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400">Last Execution Time</span>
          <p className="text-2xl font-bold font-mono text-cyan-400 mt-1">540ms</p>
          <span className="text-[11px] text-slate-400 font-mono">Fast Pytest Runner</span>
        </div>
      </div>

      {/* Test Suites Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 font-mono">
          Configured Test Suites
        </h3>

        <div className="space-y-4">
          {testFiles.map(tf => (
            <div key={tf.path} className="rounded-lg border border-slate-800 bg-slate-950/80 overflow-hidden">
              <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-mono font-semibold text-slate-200">{tf.path}</span>
                  <span className="text-[10px] font-mono text-slate-400">
                    ({tf.functions?.length || 0} tests)
                  </span>
                </div>
                <button
                  onClick={() => handleRunSingle(tf.path, 'suite')}
                  className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 hover:text-emerald-300 px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-800/40"
                >
                  <Play className="w-3 h-3" />
                  <span>Run Suite</span>
                </button>
              </div>

              <div className="divide-y divide-slate-800/60">
                {tf.functions?.map(fn => {
                  const key = `${tf.path}::${fn.name}`;
                  const isRunning = runningTestKey === key;

                  return (
                    <div key={fn.name} className="px-4 py-2 flex items-center justify-between hover:bg-slate-900/40">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="text-xs font-mono text-slate-300">{fn.name}</span>
                      </div>
                      <button
                        onClick={() => handleRunSingle(tf.path, fn.name)}
                        disabled={isRunning}
                        className="text-[11px] font-mono text-slate-400 hover:text-slate-200 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 transition flex items-center gap-1"
                      >
                        {isRunning ? <RotateCw className="w-3 h-3 animate-spin text-cyan-400" /> : <Play className="w-3 h-3 text-emerald-400" />}
                        <span>{isRunning ? 'Running' : 'Run'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Terminal Console */}
      <div className="rounded-xl border border-slate-800 bg-[#060913] p-5 space-y-3 shadow-inner">
        <div className="flex items-center justify-between text-slate-400 text-xs font-mono pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>Test Runner Terminal Output</span>
          </div>
          <span className="text-[11px]">stdout / stderr</span>
        </div>
        <pre className="p-3 bg-[#03060d] rounded-lg border border-slate-900 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed whitespace-pre">
          <code>{terminalLogs}</code>
        </pre>
      </div>
    </div>
  );
};
