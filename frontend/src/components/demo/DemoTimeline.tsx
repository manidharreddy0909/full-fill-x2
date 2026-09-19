import React from 'react';
import { DemoStepRecord } from '../../types/demo';
import { CheckCircle2, Clock, Play, AlertCircle, CircleDashed } from 'lucide-react';

interface DemoTimelineProps {
  timeline: DemoStepRecord[];
  currentStepIndex: number;
  onStepClick?: (stepIndex: number) => void;
}

export const DemoTimeline: React.FC<DemoTimelineProps> = ({
  timeline,
  currentStepIndex,
  onStepClick,
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-white tracking-wide flex items-center space-x-2">
          <Clock className="w-4 h-4 text-indigo-400" />
          <span>12-Stage Intelligence Storyboard</span>
        </h3>
        <span className="text-xs font-mono text-slate-400">
          Step <strong className="text-indigo-400">{currentStepIndex + 1}</strong> of {timeline.length}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {timeline.map((step, idx) => {
          const isActive = idx === currentStepIndex;
          const isCompleted = step.status === 'COMPLETED';
          const isInProgress = step.status === 'IN_PROGRESS';
          const isFailed = step.status === 'FAILED';

          let statusIcon = <CircleDashed className="w-4 h-4 text-slate-600" />;
          let statusBg = 'bg-slate-950/40 border-slate-800 text-slate-400';

          if (isCompleted) {
            statusIcon = <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
            statusBg = 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300';
          } else if (isInProgress || isActive) {
            statusIcon = <Play className="w-4 h-4 text-indigo-400 animate-pulse" />;
            statusBg = 'bg-indigo-950/60 border-indigo-500 text-indigo-200 shadow-md shadow-indigo-950/50';
          } else if (isFailed) {
            statusIcon = <AlertCircle className="w-4 h-4 text-rose-400" />;
            statusBg = 'bg-rose-950/30 border-rose-500/40 text-rose-300';
          }

          return (
            <div
              key={idx}
              onClick={() => onStepClick && onStepClick(idx)}
              className={`p-3 rounded-lg border transition-all duration-200 relative cursor-pointer ${statusBg}`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 font-bold">
                    #{idx + 1}
                  </span>
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400">
                    {step.stage}
                  </span>
                </div>
                {statusIcon}
              </div>

              <h4 className="text-xs font-bold truncate mb-1">{step.title}</h4>
              <p className="text-[11px] text-slate-400 line-clamp-2 mb-2">{step.summary}</p>

              {step.duration_ms > 0 && (
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1.5 border-t border-slate-800/50">
                  <span>Execution Time</span>
                  <span className="text-slate-300 font-semibold">{step.duration_ms.toFixed(1)} ms</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
