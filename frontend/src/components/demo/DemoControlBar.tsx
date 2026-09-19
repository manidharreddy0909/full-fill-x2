import React from 'react';
import { DemoModeType, DemoStatus } from '../../types/demo';
import { Play, SkipForward, Pause, RotateCcw, CheckCircle, XCircle, Zap } from 'lucide-react';

interface DemoControlBarProps {
  status: DemoStatus;
  mode: DemoModeType;
  onStart: () => void;
  onStep: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onApprove: () => void;
  onReject: () => void;
  onModeToggle: (mode: DemoModeType) => void;
  loading?: boolean;
}

export const DemoControlBar: React.FC<DemoControlBarProps> = ({
  status,
  mode,
  onStart,
  onStep,
  onPause,
  onResume,
  onReset,
  onApprove,
  onReject,
  onModeToggle,
  loading = false,
}) => {
  const isIdle = status === DemoStatus.IDLE || status === DemoStatus.RESET;
  const isAwaitingApproval = status === DemoStatus.AWAITING_APPROVAL;
  const isPaused = status === DemoStatus.PAUSED;
  const isCompleted = status === DemoStatus.COMPLETED || status === DemoStatus.APPROVED || status === DemoStatus.REJECTED;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Mode Selector */}
      <div className="flex items-center space-x-2 bg-slate-950/60 p-1 rounded-lg border border-slate-800">
        <button
          onClick={() => onModeToggle(DemoModeType.STEP)}
          disabled={!isIdle}
          className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
            mode === DemoModeType.STEP
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          } ${!isIdle ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          Manual Step Mode
        </button>
        <button
          onClick={() => onModeToggle(DemoModeType.FAST)}
          disabled={!isIdle}
          className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center space-x-1 transition-all ${
            mode === DemoModeType.FAST
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          } ${!isIdle ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Fast Run Mode</span>
        </button>
      </div>

      {/* Main Controls */}
      <div className="flex items-center space-x-3">
        {isIdle && (
          <button
            onClick={onStart}
            disabled={loading}
            className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4" />
            <span>Launch Presentation Demo</span>
          </button>
        )}

        {!isIdle && !isCompleted && !isAwaitingApproval && (
          <>
            {isPaused ? (
              <button
                onClick={onResume}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Resume</span>
              </button>
            ) : (
              <button
                onClick={onPause}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-amber-600/30 hover:bg-amber-600/40 text-amber-300 border border-amber-500/40 font-bold text-xs flex items-center space-x-1.5 cursor-pointer"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </button>
            )}

            <button
              onClick={onStep}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-indigo-950/50 transition-all cursor-pointer"
            >
              <SkipForward className="w-3.5 h-3.5" />
              <span>Execute Next Stage</span>
            </button>
          </>
        )}

        {isAwaitingApproval && (
          <div className="flex items-center space-x-2 animate-bounce">
            <button
              onClick={onApprove}
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-emerald-950/50 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Approve Candidate Plan C</span>
            </button>
            <button
              onClick={onReject}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 border border-rose-500/40 font-bold text-xs flex items-center space-x-1.5 cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Reject Plan</span>
            </button>
          </div>
        )}

        <button
          onClick={onReset}
          disabled={loading}
          className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center space-x-1 border border-slate-700 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
};
