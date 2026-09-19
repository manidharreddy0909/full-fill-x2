import React, { useState } from 'react';
import {
  TrendingUp,
  Layers,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sliders,
  ShieldCheck,
  Zap,
  RefreshCw,
  Award,
  ChevronDown,
  ChevronRight,
  Sparkles,
  PieChart,
  Target,
} from 'lucide-react';
import {
  PlannerReport,
  PlanEvaluation,
  ParetoFrontier,
  FeasibilityStatus,
  ParetoDominanceStatus,
} from '../../types/planner';

interface PlannerBoardProps {
  report: PlannerReport | null;
  onRunPlanner?: () => void;
  isLoading?: boolean;
}

export const PlannerBoard: React.FC<PlannerBoardProps> = ({
  report,
  onRunPlanner,
  isLoading = false,
}) => {
  const [activeTab, setActiveTab] = useState<'PARETO' | 'FEASIBILITY' | 'ROBUSTNESS' | 'SENSITIVITY' | 'TRADEOFFS'>('PARETO');
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);

  if (!report) {
    return (
      <div className="bg-[#121624]/80 backdrop-blur-md border border-[#2A344A] rounded-xl p-8 text-center">
        <Award className="mx-auto text-blue-400 mb-4 animate-pulse" size={48} />
        <h3 className="text-xl font-bold text-slate-100 mb-2">Multi-Objective Planner & Optimization Engine</h3>
        <p className="text-slate-400 max-w-lg mx-auto mb-6 text-sm">
          Run formal Pareto dominance optimization across Candidate Plans (A/B/C) and Adversary stress reports.
          Evaluates business constraints, baseline & robust Pareto frontiers, and priority sensitivity sweeps.
        </p>
        <button
          onClick={onRunPlanner}
          disabled={isLoading}
          className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-lg shadow-lg shadow-blue-950/50 transition-all flex items-center gap-2 mx-auto disabled:opacity-50"
        >
          {isLoading ? <RefreshCw className="animate-spin" size={18} /> : <Zap size={18} />}
          {isLoading ? 'Computing Multi-Objective Pareto Frontier...' : 'Run Multi-Objective Optimization'}
        </button>
      </div>
    );
  }

  const recommendedCount = report.recommended_candidates.length;
  const feasibleCount = report.plan_evaluations.filter((e) => e.feasibility.status === 'FEASIBLE').length;

  return (
    <div className="space-y-6">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#121624]/80 backdrop-blur-md border border-[#2A344A] p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Pareto Optimal Candidates</span>
            <Award className="text-blue-400" size={18} />
          </div>
          <div className="text-2xl font-bold text-blue-400 mt-1">{recommendedCount} Recommended</div>
          <div className="text-xs text-slate-500 mt-1">Non-Dominated Robust Set</div>
        </div>

        <div className="bg-[#121624]/80 backdrop-blur-md border border-[#2A344A] p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Business Feasibility</span>
            <CheckCircle2 className="text-emerald-400" size={18} />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{feasibleCount} Feasible</div>
          <div className="text-xs text-emerald-500/80 mt-1">Satisfies All Constraints</div>
        </div>

        <div className="bg-[#121624]/80 backdrop-blur-md border border-[#2A344A] p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Evaluated Objectives</span>
            <PieChart className="text-indigo-400" size={18} />
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-1">14 Dimensions</div>
          <div className="text-xs text-slate-500 mt-1">6 Core + 8 Adversarial</div>
        </div>

        <div className="bg-[#121624]/80 backdrop-blur-md border border-[#2A344A] p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Decision Boundary</span>
            <ShieldCheck className="text-purple-400" size={18} />
          </div>
          <div className="text-xs font-semibold text-purple-300 mt-2 flex items-center gap-1.5">
            <Sparkles size={16} /> Human Decision Authority
          </div>
          <div className="text-[11px] text-slate-500 mt-1">No Single-Score Collapse</div>
        </div>
      </div>

      {/* Narrative Summary */}
      {report.summary_narrative && (
        <div className="bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-[#121624]/80 border border-blue-900/40 p-4 rounded-xl">
          <div className="flex items-start gap-3">
            <Sparkles className="text-blue-400 shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="text-sm font-semibold text-blue-200">Multi-Objective Optimization Narrative</h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{report.summary_narrative}</p>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab Navigation */}
      <div className="flex items-center justify-between border-b border-[#2A344A] pb-2">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('PARETO')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'PARETO'
                ? 'bg-blue-600/20 border border-blue-500/40 text-blue-300'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1A2133]'
            }`}
          >
            <Award size={14} /> Robust Pareto Frontier
          </button>
          <button
            onClick={() => setActiveTab('FEASIBILITY')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'FEASIBILITY'
                ? 'bg-emerald-600/20 border border-emerald-500/40 text-emerald-300'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1A2133]'
            }`}
          >
            <CheckCircle2 size={14} /> Feasibility & Constraints
          </button>
          <button
            onClick={() => setActiveTab('ROBUSTNESS')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'ROBUSTNESS'
                ? 'bg-purple-600/20 border border-purple-500/40 text-purple-300'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1A2133]'
            }`}
          >
            <ShieldCheck size={14} /> Adversarial Robustness
          </button>
          <button
            onClick={() => setActiveTab('SENSITIVITY')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'SENSITIVITY'
                ? 'bg-amber-600/20 border border-amber-500/40 text-amber-300'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1A2133]'
            }`}
          >
            <Sliders size={14} /> Sensitivity Analysis
          </button>
          <button
            onClick={() => setActiveTab('TRADEOFFS')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'TRADEOFFS'
                ? 'bg-indigo-600/20 border border-indigo-500/40 text-indigo-300'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1A2133]'
            }`}
          >
            <TrendingUp size={14} /> Trade-off Matrix
          </button>
        </div>

        <button
          onClick={onRunPlanner}
          disabled={isLoading}
          className="px-3 py-1.5 bg-[#1E2638] hover:bg-[#253046] border border-[#2A344A] text-slate-300 text-xs font-medium rounded-md transition-all flex items-center gap-1.5"
        >
          <RefreshCw className={isLoading ? 'animate-spin' : ''} size={14} />
          Re-Run Optimization
        </button>
      </div>

      {/* TAB 1: PARETO FRONTIER BOARD */}
      {activeTab === 'PARETO' && (
        <div className="space-y-6">
          <div className="bg-[#121624]/80 backdrop-blur-md border border-[#2A344A] rounded-xl p-5 overflow-x-auto">
            <h4 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
              <Award size={16} className="text-blue-400" />
              Pareto Optimal Non-Dominated Decision Space
            </h4>

            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#2A344A] text-slate-400 font-semibold bg-[#182032]">
                  <th className="p-3">Candidate Plan</th>
                  <th className="p-3 text-center">Feasibility</th>
                  <th className="p-3 text-center">Baseline Pareto Status</th>
                  <th className="p-3 text-center">Robust Pareto Status</th>
                  <th className="p-3 font-mono">Action Cost ($)</th>
                  <th className="p-3 font-mono">Emissions (kg CO2)</th>
                  <th className="p-3 text-center">Recommendation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2638]">
                {report.plan_evaluations.map((pe) => {
                  const isRecommended = report.recommended_candidates.includes(pe.candidate_id);
                  const isExpanded = expandedPlanId === pe.candidate_id;

                  return (
                    <React.Fragment key={pe.candidate_id}>
                      <tr
                        onClick={() => setExpandedPlanId(isExpanded ? null : pe.candidate_id)}
                        className="hover:bg-[#1A2234] cursor-pointer transition-all"
                      >
                        <td className="p-3 font-semibold text-slate-100 flex items-center gap-2">
                          {isExpanded ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
                          <div>
                            <div>{pe.candidate_name}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{pe.candidate_id}</div>
                          </div>
                        </td>

                        <td className="p-3 text-center">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                              pe.feasibility.status === 'FEASIBLE'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : pe.feasibility.status === 'CONDITIONAL'
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : 'bg-red-950 text-red-300 border border-red-800'
                            }`}
                          >
                            {pe.feasibility.status}
                          </span>
                        </td>

                        <td className="p-3 text-center">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-semibold rounded ${
                              pe.dominance_status === 'NON_DOMINATED'
                                ? 'bg-blue-950 text-blue-300 border border-blue-800'
                                : 'bg-slate-900 text-slate-400 border border-slate-700'
                            }`}
                          >
                            {pe.dominance_status}
                          </span>
                        </td>

                        <td className="p-3 text-center">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-semibold rounded ${
                              pe.robust_dominance_status === 'NON_DOMINATED'
                                ? 'bg-purple-950 text-purple-300 border border-purple-800'
                                : 'bg-slate-900 text-slate-400 border border-slate-700'
                            }`}
                          >
                            {pe.robust_dominance_status}
                          </span>
                        </td>

                        <td className="p-3 text-slate-200 font-mono">
                          ${pe.objective_vector.values.find((v) => v.objective === 'REDUCE_DELAY_AND_COST')?.raw_value.toLocaleString() || '0'}
                        </td>

                        <td className="p-3 text-slate-200 font-mono">
                          {pe.objective_vector.values.find((v) => v.objective === 'REDUCE_EMISSIONS')?.raw_value.toLocaleString() || '0'} kg
                        </td>

                        <td className="p-3 text-center">
                          {isRecommended ? (
                            <span className="px-2.5 py-1 text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-700 rounded-md inline-flex items-center gap-1">
                              <Award size={12} /> RECOMMENDED
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[11px]">Sub-Optimal</span>
                          )}
                        </td>
                      </tr>

                      {/* Expanded Vector Details */}
                      {isExpanded && (
                        <tr className="bg-[#101524]">
                          <td colSpan={7} className="p-4 border-t border-[#1E2638]">
                            <div className="space-y-4">
                              <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                                Multi-Objective Normalized Vector Breakdown
                              </h5>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {pe.objective_vector.values.map((ov) => (
                                  <div key={ov.objective} className="bg-[#161D2E] p-2.5 rounded-lg border border-[#242F44]">
                                    <div className="text-[11px] text-slate-400 font-medium truncate">
                                      {ov.objective.replace('REDUCE_', '').replace('MINIMIZE_', '')}
                                    </div>
                                    <div className="text-sm font-bold text-slate-100 mt-0.5">
                                      {ov.normalized_value} <span className="text-[10px] text-slate-400">({ov.raw_value}{ov.unit})</span>
                                    </div>
                                    <div className="text-[10px] text-slate-500 mt-1 truncate">{ov.explanation}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: FEASIBILITY & CONSTRAINTS */}
      {activeTab === 'FEASIBILITY' && (
        <div className="space-y-4">
          {report.plan_evaluations.map((pe) => (
            <div key={pe.candidate_id} className="bg-[#121624]/80 backdrop-blur-md border border-[#2A344A] p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-100 text-sm">{pe.candidate_name}</span>
                  <span className="text-xs text-slate-400 font-mono">({pe.candidate_id})</span>
                </div>
                <span
                  className={`px-2.5 py-1 text-xs font-bold rounded ${
                    pe.feasibility.status === 'FEASIBLE'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : pe.feasibility.status === 'CONDITIONAL'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-red-950 text-red-300 border border-red-800'
                  }`}
                >
                  {pe.feasibility.status}
                </span>
              </div>

              {pe.feasibility.violations.length > 0 ? (
                <div className="space-y-2">
                  <h5 className="text-xs font-semibold text-red-300">Constraint Breaches Detected:</h5>
                  {pe.feasibility.violations.map((v) => (
                    <div key={v.constraint_id} className="bg-red-950/30 border border-red-900/40 p-2.5 rounded text-xs flex items-center justify-between">
                      <div>
                        <strong className="text-red-200">{v.type}:</strong> Actual measured value{' '}
                        <span className="font-mono text-slate-200">{v.actual_value}</span> exceeded limit threshold{' '}
                        <span className="font-mono text-slate-400">{v.threshold_value}</span>
                      </div>
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-red-900/60 text-red-200 rounded">
                        +{v.delta} Delta ({v.severity})
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-emerald-400 bg-emerald-950/30 p-2.5 rounded border border-emerald-900/40 flex items-center gap-2">
                  <CheckCircle2 size={16} /> Plan meets all cost, delay, service level, carbon emissions, and recovery limits.
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: ADVERSARIAL ROBUSTNESS */}
      {activeTab === 'ROBUSTNESS' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {report.plan_evaluations.map((pe) => (
            <div key={pe.candidate_id} className="bg-[#121624]/80 backdrop-blur-md border border-[#2A344A] p-4 rounded-xl space-y-3">
              <div className="font-bold text-slate-100 text-sm border-b border-[#2A344A] pb-2">
                {pe.candidate_name}
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Baseline Resilience:</span>
                  <strong className="text-slate-200">{pe.robustness_profile.baseline_resilience_score} / 100</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Stressed Resilience:</span>
                  <strong className={pe.robustness_profile.stressed_resilience_score >= 70 ? 'text-emerald-400' : 'text-amber-400'}>
                    {pe.robustness_profile.stressed_resilience_score} / 100
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Stress Degradation:</span>
                  <strong className="text-red-400">-{pe.robustness_profile.degradation_pct}%</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Est. Recovery Time:</span>
                  <strong className="text-slate-200 font-mono">{pe.robustness_profile.recovery_time_days} days</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Critical Vulnerabilities:</span>
                  <strong className="text-amber-400">{pe.robustness_profile.critical_vulnerability_count}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: SENSITIVITY ANALYSIS */}
      {activeTab === 'SENSITIVITY' && (
        <div className="space-y-4">
          {report.sensitivity_analysis.map((item, idx) => (
            <div key={idx} className="bg-[#121624]/80 backdrop-blur-md border border-[#2A344A] p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-300 text-xs uppercase">{item.parameter_name}</span>
                <span
                  className={`px-2 py-0.5 text-[10px] font-semibold rounded ${
                    item.is_frontier_altered ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  {item.is_frontier_altered ? 'FRONTIER SHIFTED' : 'FRONTIER STABLE'}
                </span>
              </div>
              <p className="text-xs text-slate-300">{item.impact_summary}</p>
              <div className="text-[11px] text-slate-400 font-mono">
                Pareto Optimal Set Under Shift: <strong className="text-blue-300">{item.new_non_dominated_ids.join(', ')}</strong>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 5: TRADE-OFFS */}
      {activeTab === 'TRADEOFFS' && (
        <div className="space-y-4">
          {report.plan_evaluations.map((pe) => (
            <div key={pe.candidate_id} className="bg-[#121624]/80 backdrop-blur-md border border-[#2A344A] p-4 rounded-xl space-y-3">
              <h5 className="font-bold text-slate-100 text-sm border-b border-[#2A344A] pb-2">
                {pe.candidate_name} Trade-off Profile
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-emerald-950/30 border border-emerald-900/40 p-3 rounded-lg space-y-1">
                  <h6 className="font-semibold text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 size={14} /> Key Operational Advantages
                  </h6>
                  <ul className="list-disc list-inside text-slate-300 space-y-1">
                    {pe.tradeoff_summary.key_advantages?.map((adv, i) => (
                      <li key={i}>{adv}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-red-950/30 border border-red-900/40 p-3 rounded-lg space-y-1">
                  <h6 className="font-semibold text-red-300 flex items-center gap-1.5">
                    <AlertCircle size={14} /> Key Operational Trade-offs & Drawbacks
                  </h6>
                  <ul className="list-disc list-inside text-slate-300 space-y-1">
                    {pe.tradeoff_summary.key_drawbacks?.map((draw, i) => (
                      <li key={i}>{draw}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
