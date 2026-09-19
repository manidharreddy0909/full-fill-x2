import React, { useState } from 'react';
import {
  ShieldAlert,
  Zap,
  AlertTriangle,
  Flame,
  Activity,
  CheckCircle2,
  XCircle,
  Crosshair,
  ShieldCheck,
  RefreshCw,
  FileText,
  Clock,
  TrendingDown,
  ChevronDown,
  ChevronRight,
  Target,
} from 'lucide-react';
import {
  AdversaryReport,
  PlanStressResult,
  Vulnerability,
  DefensiveRecommendation,
  AdversaryAttack,
} from '../../types/adversary';

interface AdversaryBoardProps {
  report: AdversaryReport | null;
  onRunAdversary?: () => void;
  isLoading?: boolean;
}

export const AdversaryBoard: React.FC<AdversaryBoardProps> = ({
  report,
  onRunAdversary,
  isLoading = false,
}) => {
  const [activeTab, setActiveTab] = useState<'MATRIX' | 'VULNERABILITIES' | 'ATTACKS' | 'DEFENSE'>('MATRIX');
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);

  if (!report) {
    return (
      <div className="bg-[#121624]/80 backdrop-blur-md border border-[#2A344A] rounded-xl p-8 text-center">
        <ShieldAlert className="mx-auto text-red-400 mb-4 animate-pulse" size={48} />
        <h3 className="text-xl font-bold text-slate-100 mb-2">Adversary Red-Team Engine Ready</h3>
        <p className="text-slate-400 max-w-lg mx-auto mb-6 text-sm">
          Run the computational red-team adversary to challenge Candidate Plan assumptions, inject multi-vector disruptions,
          measure resilience degradation on isolated snapshots, and surface hidden vulnerabilities.
        </p>
        <button
          onClick={onRunAdversary}
          disabled={isLoading}
          className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-semibold rounded-lg shadow-lg shadow-red-950/50 transition-all flex items-center gap-2 mx-auto disabled:opacity-50"
        >
          {isLoading ? <RefreshCw className="animate-spin" size={18} /> : <Zap size={18} />}
          {isLoading ? 'Executing Red-Team Stress Test...' : 'Run Adversary Analysis'}
        </button>
      </div>
    );
  }

  const criticalVulns = report.overall_vulnerabilities.filter((v) => v.severity === 'CRITICAL').length;

  return (
    <div className="space-y-6">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#121624]/80 backdrop-blur-md border border-[#2A344A] p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Scenarios Evaluated</span>
            <Crosshair className="text-red-400" size={18} />
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-1">{report.scenarios_tested}</div>
          <div className="text-xs text-slate-500 mt-1">Controlled Attack Suite</div>
        </div>

        <div className="bg-[#121624]/80 backdrop-blur-md border border-[#2A344A] p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Network Vulnerabilities</span>
            <AlertTriangle className="text-amber-400" size={18} />
          </div>
          <div className="text-2xl font-bold text-amber-400 mt-1">{report.overall_vulnerabilities.length}</div>
          <div className="text-xs text-amber-500/80 mt-1">{criticalVulns} Critical Fragilities</div>
        </div>

        <div className="bg-[#121624]/80 backdrop-blur-md border border-[#2A344A] p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Defensive Countermeasures</span>
            <ShieldCheck className="text-emerald-400" size={18} />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{report.defensive_recommendations.length}</div>
          <div className="text-xs text-emerald-500/80 mt-1">Recommended Mitigations</div>
        </div>

        <div className="bg-[#121624]/80 backdrop-blur-md border border-[#2A344A] p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Simulation Isolation</span>
            <Activity className="text-blue-400" size={18} />
          </div>
          <div className="text-sm font-semibold text-emerald-400 mt-2 flex items-center gap-1.5">
            <CheckCircle2 size={16} /> Zero State Mutation
          </div>
          <div className="text-xs text-slate-500 mt-1">Snapshot Copy Discarded</div>
        </div>
      </div>

      {/* Narrative Card */}
      {report.summary_narrative && (
        <div className="bg-gradient-to-r from-red-950/40 via-amber-950/30 to-[#121624]/80 border border-red-900/40 p-4 rounded-xl">
          <div className="flex items-start gap-3">
            <Flame className="text-red-400 shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="text-sm font-semibold text-red-200">Red-Team Executive Narrative</h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{report.summary_narrative}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center justify-between border-b border-[#2A344A] pb-2">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('MATRIX')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'MATRIX'
                ? 'bg-red-600/20 border border-red-500/40 text-red-300'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1A2133]'
            }`}
          >
            <Activity size={14} /> Plan Stress Comparison
          </button>
          <button
            onClick={() => setActiveTab('VULNERABILITIES')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'VULNERABILITIES'
                ? 'bg-amber-600/20 border border-amber-500/40 text-amber-300'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1A2133]'
            }`}
          >
            <AlertTriangle size={14} /> Red-Team Vulnerabilities ({report.overall_vulnerabilities.length})
          </button>
          <button
            onClick={() => setActiveTab('ATTACKS')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'ATTACKS'
                ? 'bg-blue-600/20 border border-blue-500/40 text-blue-300'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1A2133]'
            }`}
          >
            <Crosshair size={14} /> Attack Suite ({report.attack_suite.length})
          </button>
          <button
            onClick={() => setActiveTab('DEFENSE')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'DEFENSE'
                ? 'bg-emerald-600/20 border border-emerald-500/40 text-emerald-300'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1A2133]'
            }`}
          >
            <ShieldCheck size={14} /> Defensive Recommendations ({report.defensive_recommendations.length})
          </button>
        </div>

        <button
          onClick={onRunAdversary}
          disabled={isLoading}
          className="px-3 py-1.5 bg-[#1E2638] hover:bg-[#253046] border border-[#2A344A] text-slate-300 text-xs font-medium rounded-md transition-all flex items-center gap-1.5"
        >
          <RefreshCw className={isLoading ? 'animate-spin' : ''} size={14} />
          Re-Run Stress Suite
        </button>
      </div>

      {/* TAB 1: PLAN STRESS COMPARISON MATRIX */}
      {activeTab === 'MATRIX' && (
        <div className="space-y-6">
          <div className="bg-[#121624]/80 backdrop-blur-md border border-[#2A344A] rounded-xl p-5 overflow-x-auto">
            <h4 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
              <Target size={16} className="text-red-400" />
              Candidate Plan Resilience & Stress Matrix (Standardized Disruption Suite)
            </h4>

            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#2A344A] text-slate-400 font-semibold bg-[#182032]">
                  <th className="p-3">Candidate Plan</th>
                  <th className="p-3 text-center">Resilience Score</th>
                  <th className="p-3">Stressed Service Level</th>
                  <th className="p-3">Cost Delta</th>
                  <th className="p-3">Transit Delay</th>
                  <th className="p-3">Est. Recovery Time</th>
                  <th className="p-3">Assumptions Invalidated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2638]">
                {report.plan_stress_results.map((res) => {
                  const isExpanded = expandedPlanId === res.candidate_id;
                  const serviceMetric = res.degradation_metrics.find((m) => m.metric_name === 'Service Level');
                  const costMetric = res.degradation_metrics.find((m) => m.metric_name === 'Total Logistics Cost');
                  const delayMetric = res.degradation_metrics.find((m) => m.metric_name === 'Average Transit Delay');

                  return (
                    <React.Fragment key={res.candidate_id}>
                      <tr
                        onClick={() => setExpandedPlanId(isExpanded ? null : res.candidate_id)}
                        className="hover:bg-[#1A2234] cursor-pointer transition-all"
                      >
                        <td className="p-3 font-semibold text-slate-100 flex items-center gap-2">
                          {isExpanded ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
                          <div>
                            <div>{res.candidate_name}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{res.candidate_id}</div>
                          </div>
                        </td>
                        <td className="p-3 text-center font-bold">
                          <span
                            className={`px-2.5 py-1 rounded-md text-xs ${
                              res.overall_resilience_score >= 80
                                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/40'
                                : res.overall_resilience_score >= 60
                                ? 'bg-amber-950/80 text-amber-300 border border-amber-800/40'
                                : 'bg-red-950/80 text-red-300 border border-red-800/40'
                            }`}
                          >
                            {res.overall_resilience_score} / 100
                          </span>
                        </td>
                        <td className="p-3 text-slate-200">
                          {serviceMetric ? `${serviceMetric.stressed_val}% (${serviceMetric.delta_pct}%)` : 'N/A'}
                        </td>
                        <td className="p-3 text-slate-200 font-mono">
                          {costMetric ? `+$${(costMetric.stressed_val - costMetric.baseline_val).toLocaleString()} (+${costMetric.delta_pct}%)` : 'N/A'}
                        </td>
                        <td className="p-3 text-slate-200 font-mono">
                          {delayMetric ? `+${delayMetric.stressed_val} hrs` : 'N/A'}
                        </td>
                        <td className="p-3 text-slate-200 font-mono">
                          {res.recovery_time_days} days
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                              res.invalidated_assumptions.length > 0
                                ? 'bg-red-900/40 text-red-300 border border-red-800/40'
                                : 'bg-emerald-900/40 text-emerald-300 border border-emerald-800/40'
                            }`}
                          >
                            {res.invalidated_assumptions.length} Invalidated
                          </span>
                        </td>
                      </tr>

                      {/* Expanded Plan Details */}
                      {isExpanded && (
                        <tr className="bg-[#101524]">
                          <td colSpan={7} className="p-4 border-t border-[#1E2638]">
                            <div className="space-y-4">
                              <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                                8-Dimension Resilience Breakdown
                              </h5>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {res.resilience_dimensions.map((dim) => (
                                  <div key={dim.dimension} className="bg-[#161D2E] p-2.5 rounded-lg border border-[#242F44]">
                                    <div className="text-[11px] text-slate-400 font-medium truncate">
                                      {dim.dimension.replace('_RESILIENCE', '')}
                                    </div>
                                    <div className="text-sm font-bold text-slate-100 mt-0.5">{dim.score} / 100</div>
                                    <div className="text-[10px] text-slate-500 mt-1 truncate">{dim.explanation}</div>
                                  </div>
                                ))}
                              </div>

                              {res.invalidated_assumptions.length > 0 && (
                                <div>
                                  <h5 className="text-xs font-bold text-red-300 uppercase tracking-wider mb-2">
                                    Invalidated Operational Assumptions
                                  </h5>
                                  <div className="space-y-1.5">
                                    {res.invalidated_assumptions.map((assump) => (
                                      <div key={assump.assumption_id} className="bg-red-950/30 border border-red-900/40 p-2 rounded text-xs">
                                        <div className="font-semibold text-red-200">{assump.description}</div>
                                        <div className="text-[11px] text-red-300/80 mt-0.5">
                                          <strong>Evidence:</strong> {assump.evidence}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
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

      {/* TAB 2: VULNERABILITIES */}
      {activeTab === 'VULNERABILITIES' && (
        <div className="space-y-4">
          {report.overall_vulnerabilities.map((vuln) => (
            <div
              key={vuln.vulnerability_id}
              className="bg-[#121624]/80 backdrop-blur-md border border-[#2A344A] p-4 rounded-xl space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className={vuln.severity === 'CRITICAL' ? 'text-red-400' : 'text-amber-400'} size={18} />
                  <span className="font-bold text-slate-100 text-sm">{vuln.title}</span>
                </div>
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                    vuln.severity === 'CRITICAL'
                      ? 'bg-red-950 text-red-300 border border-red-800'
                      : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}
                >
                  {vuln.severity}
                </span>
              </div>
              <p className="text-xs text-slate-300">{vuln.description}</p>
              <div className="text-xs text-slate-400 bg-[#182032] p-2.5 rounded border border-[#242F44] font-mono">
                <strong className="text-slate-300">Empirical Evidence:</strong> {vuln.evidence}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: ATTACK SUITE */}
      {activeTab === 'ATTACKS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.attack_suite.map((atk) => (
            <div key={atk.attack_id} className="bg-[#121624]/80 backdrop-blur-md border border-[#2A344A] p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-red-300 text-xs uppercase font-mono">{atk.attack_type}</span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-red-950/60 text-red-300 rounded">
                  {atk.severity}
                </span>
              </div>
              <p className="text-xs text-slate-200 font-medium">{atk.description}</p>
              <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-400 bg-[#161E2E] p-2 rounded border border-[#222C3E]">
                <div>Duration: <strong className="text-slate-200">{atk.duration_days}d</strong></div>
                <div>Cap Loss: <strong className="text-red-400">{atk.capacity_loss_pct}%</strong></div>
                <div>Delay: <strong className="text-amber-400">+{atk.delay_hours}h</strong></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: DEFENSIVE RECOMMENDATIONS */}
      {activeTab === 'DEFENSE' && (
        <div className="space-y-4">
          {report.defensive_recommendations.map((rec) => (
            <div key={rec.recommendation_id} className="bg-[#121624]/80 backdrop-blur-md border border-emerald-900/40 p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="text-emerald-400" size={18} />
                  <span className="font-bold text-emerald-200 text-sm">{rec.title}</span>
                </div>
                <span className="px-2.5 py-1 text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/60 rounded-md">
                  +{rec.estimated_mitigation_pct}% Mitigation
                </span>
              </div>
              <p className="text-xs text-slate-300">{rec.description}</p>
              <div className="text-[11px] text-slate-400 font-mono">
                Suggested Action Type: <strong className="text-emerald-300">{rec.suggested_action_type}</strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
