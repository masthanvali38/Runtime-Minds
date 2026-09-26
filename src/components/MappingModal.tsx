import React, { useEffect, useState } from 'react';
import { Check, RotateCw } from 'lucide-react';

interface MappingModalProps {
  repoName: string;
  onComplete: () => void;
}

export const MappingModal: React.FC<MappingModalProps> = ({ repoName, onComplete }) => {
  const steps = [
    'Reading files',
    'Detecting languages',
    'Building code structure',
    'Finding dependencies',
    'Indexing functions and classes',
    'Preparing Runtime Minds'
  ];

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStepIndex(prev => {
        if (prev < steps.length) {
          return prev + 1;
        } else {
          clearInterval(timer);
          setTimeout(onComplete, 400);
          return prev;
        }
      });
    }, 350);

    return () => clearInterval(timer);
  }, [onComplete, steps.length]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl bg-white border border-gray-200 p-7 shadow-xl relative overflow-hidden select-none">
        <div className="mb-5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-mono font-semibold uppercase text-blue-600 tracking-wider">
              Repository Indexer
            </span>
            <span className="text-xs font-mono text-gray-400">
              {Math.min(100, Math.round((currentStepIndex / steps.length) * 100))}%
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 font-sans">
            Analyzing your repository...
          </h3>
          <p className="text-xs text-gray-500 font-mono mt-0.5">
            Target: {repoName}
          </p>
        </div>

        {/* Clean Checklist */}
        <div className="space-y-2.5 my-6">
          {steps.map((step, idx) => {
            const isFinished = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div
                key={step}
                className="flex items-center justify-between text-xs font-mono transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  {isFinished ? (
                    <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                  ) : isCurrent ? (
                    <div className="w-4 h-4 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                      <RotateCw className="w-2.5 h-2.5 animate-spin" />
                    </div>
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-gray-200" />
                  )}
                  <span className={isFinished ? 'text-gray-900 font-medium' : isCurrent ? 'text-blue-600 font-medium' : 'text-gray-400'}>
                    {step}
                  </span>
                </div>

                <span className="text-[10px] uppercase font-mono text-gray-400">
                  {isFinished ? '✓' : isCurrent ? 'running' : 'queued'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Minimal Progress Bar */}
        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-blue-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, (currentStepIndex / steps.length) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};
