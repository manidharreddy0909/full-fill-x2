import React from 'react';
import { DemoScenario, DemoScenarioId } from '../../types/demo';
import { ShieldAlert, Zap, Layers, Award } from 'lucide-react';

interface DemoScenarioSelectorProps {
  scenarios: DemoScenario[];
  selectedId: DemoScenarioId;
  onSelect: (scenarioId: DemoScenarioId) => void;
  disabled?: boolean;
}

export const DemoScenarioSelector: React.FC<DemoScenarioSelectorProps> = ({
  scenarios,
  selectedId,
  onSelect,
  disabled = false,
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg border border-indigo-500/30">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-wide">Competition Scenarios</h3>
            <p className="text-xs text-slate-400">Select a deterministic scenario for judge presentation</p>
          </div>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-medium">
          100% Deterministic (Seed 42)
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {scenarios.map((sc) => {
          const isSelected = sc.scenario_id === selectedId;
          const isPrimary = sc.scenario_id === DemoScenarioId.DEMO_05;

          return (
            <button
              key={sc.scenario_id}
              onClick={() => onSelect(sc.scenario_id)}
              disabled={disabled}
              className={`text-left p-3.5 rounded-lg border transition-all duration-200 relative ${
                isSelected
                  ? 'bg-indigo-950/60 border-indigo-500 shadow-lg shadow-indigo-950/50'
                  : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {isPrimary && (
                <span className="absolute -top-2 -right-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500 text-slate-950 shadow">
                  SHOWCASE
                </span>
              )}
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-xs font-mono font-bold ${isSelected ? 'text-indigo-400' : 'text-slate-400'}`}>
                  {sc.scenario_id}
                </span>
                {isSelected && <Zap className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />}
              </div>

              <h4 className="text-xs font-bold text-slate-200 line-clamp-1 mb-1">{sc.title}</h4>
              <p className="text-[11px] text-slate-400 line-clamp-2">{sc.subtitle}</p>

              <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
                <span className="flex items-center space-x-1">
                  <ShieldAlert className="w-3 h-3 text-amber-400" />
                  <span>{sc.disruption_type}</span>
                </span>
                <span className="font-mono">{sc.expected_duration_seconds}s</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
