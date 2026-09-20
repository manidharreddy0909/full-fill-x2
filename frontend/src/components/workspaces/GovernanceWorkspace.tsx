import React, { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { evaluatePolicy, fetchModelCard } from '../../api/enterpriseApi';
import { useVisualEnvironmentStore } from '../../store/visualEnvironmentStore';
import {
  Activity, Lock, ShieldCheck, BookOpen, Zap,
  CheckCircle2, AlertTriangle, RefreshCw, Star,
} from 'lucide-react';

const MODEL_NAMES = ['DemandForecastModel', 'RiskScoreModel', 'InventoryOptimizer'];

export const GovernanceWorkspace: React.FC = () => {
  const { setEnvironmentMode } = useVisualEnvironmentStore();
  const [selectedModel, setSelectedModel] = useState<string>(MODEL_NAMES[0]);

  useEffect(() => {
    setEnvironmentMode('INTELLIGENCE');
  }, [setEnvironmentMode]);

  const { data: modelCard, isLoading: isCardLoading, refetch: refetchCard } = useQuery({
    queryKey: ['modelCard', selectedModel],
    queryFn: () => fetchModelCard(selectedModel),
  });

  const policyMutation = useMutation({
    mutationFn: () =>
      evaluatePolicy(
        `EVAL-${Date.now()}`,
        {
          candidate_id: 'DEMO-PLAN',
          name: 'Demo Governance Evaluation',
          estimated_total_cost: 50000,
          estimated_max_delay_hours: 24,
          actions: [],
          violations: [],
        },
        { overall_service_level: 0.92, risk_delta: -0.15 }
      ),
  });

  const card = modelCard as any;
  const policyResult = policyMutation.data as any;

  return (
    <div className="relative min-h-[calc(100vh-60px)] p-6 text-slate-100 flex flex-col gap-6 bg-[#040813]">
      {/* Header */}
      <div className="p-5 rounded-xl bg-slate-900/85 border border-slate-800 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-800/80 flex items-center justify-center text-cyan-400">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white">Governance — Model Cards & Policy Evaluation</h1>
            <p className="text-xs text-slate-400">AI model governance, bias auditing, and execution policy validation</p>
          </div>
        </div>

        <button
          onClick={() => refetchCard()}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model Card Viewer */}
        <div className="p-5 rounded-xl bg-slate-900/85 border border-slate-800 backdrop-blur-md shadow-xl flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm text-slate-200 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Model Card</span>
            </h2>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-slate-900 text-cyan-300 font-mono text-xs font-bold px-2.5 py-1 rounded border border-slate-700 outline-none"
            >
              {MODEL_NAMES.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          {isCardLoading && (
            <div className="flex items-center justify-center py-8 gap-2 text-slate-400 font-mono text-xs">
              <Activity className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Loading model card...</span>
            </div>
          )}

          {card && (
            <div className="space-y-3">
              {/* Model Identity */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-lg font-bold text-white">{card.model_name}</div>
                    <div className="text-xs text-slate-400 font-mono">v{card.version} · {card.model_type}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                    card.governance_status === 'APPROVED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                    card.governance_status === 'UNDER_REVIEW' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                    'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>{card.governance_status}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{card.description}</p>
              </div>

              {/* Performance Metrics */}
              {card.performance_metrics && (
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400 uppercase mb-2">Performance Metrics</div>
                  <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                    {Object.entries(card.performance_metrics as Record<string, number>).map(([key, val]) => (
                      <div key={key} className="flex justify-between items-center p-1.5 rounded bg-slate-900 border border-slate-800">
                        <span className="text-slate-400 text-[10px]">{key.replace(/_/g, ' ').toUpperCase()}</span>
                        <span className="font-bold text-cyan-400">{typeof val === 'number' ? val.toFixed(4) : String(val)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bias Metrics */}
              {card.bias_metrics && (
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400 uppercase mb-2">Bias & Fairness Audit</div>
                  <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                    {Object.entries(card.bias_metrics as Record<string, any>).map(([key, val]) => {
                      const isGood = typeof val === 'number' ? val < 0.1 : true;
                      return (
                        <div key={key} className="flex justify-between items-center p-1.5 rounded bg-slate-900 border border-slate-800">
                          <span className="text-slate-400 text-[10px]">{key.replace(/_/g, ' ')}</span>
                          <span className={`font-bold text-[11px] ${isGood ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {typeof val === 'number' ? val.toFixed(4) : String(val)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Intended Use & Limitations */}
              {card.intended_use && (
                <div className="p-3 rounded-lg bg-blue-950/20 border border-blue-900/40 font-mono text-xs">
                  <div className="text-[10px] text-blue-300 uppercase font-bold mb-1">Intended Use</div>
                  <p className="text-slate-300 font-sans text-[11px]">{card.intended_use}</p>
                </div>
              )}

              {card.limitations && (
                <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-900/40 font-mono text-xs">
                  <div className="text-[10px] text-amber-300 uppercase font-bold mb-1">Known Limitations</div>
                  <p className="text-slate-300 font-sans text-[11px]">{card.limitations}</p>
                </div>
              )}

              {/* Approval */}
              {card.approved_by && (
                <div className="flex items-center gap-2 font-mono text-[11px] text-emerald-300">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Approved by: <strong>{card.approved_by}</strong></span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Policy Evaluation Panel */}
        <div className="p-5 rounded-xl bg-slate-900/85 border border-slate-800 backdrop-blur-md shadow-xl flex flex-col gap-4">
          <h2 className="font-semibold text-sm border-b border-slate-800 pb-2 text-slate-200 flex items-center gap-2">
            <Zap className="w-4 h-4 text-violet-400" />
            <span>Policy Evaluation Engine</span>
          </h2>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-xs space-y-2">
            <div className="text-[10px] text-slate-400 uppercase">Demo Evaluation Parameters</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <div className="text-slate-500 text-[9px]">Candidate Plan</div>
                <div className="text-slate-200 font-bold">DEMO-PLAN</div>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <div className="text-slate-500 text-[9px]">Est. Cost</div>
                <div className="text-emerald-400 font-bold">$50,000</div>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <div className="text-slate-500 text-[9px]">Service Level</div>
                <div className="text-cyan-400 font-bold">92.0%</div>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <div className="text-slate-500 text-[9px]">Risk Delta</div>
                <div className="text-emerald-400 font-bold">-15.0%</div>
              </div>
            </div>
          </div>

          <button
            onClick={() => policyMutation.mutate()}
            disabled={policyMutation.isPending}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:bg-violet-900 text-white text-xs font-mono font-semibold transition-all shadow-lg shadow-violet-600/30"
          >
            {policyMutation.isPending ? <Activity className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            <span>EVALUATE POLICY</span>
          </button>

          {policyResult && (
            <div className="flex flex-col gap-3">
              {/* Recommendation Badge */}
              <div
                className={`p-4 rounded-xl border text-center`}
                style={{
                  background: policyResult.recommendation === 'APPROVE'
                    ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
                  borderColor: policyResult.recommendation === 'APPROVE'
                    ? 'rgba(52,211,153,0.4)' : 'rgba(248,113,113,0.4)',
                }}
              >
                <div className="font-mono text-2xl font-black mb-1" style={{
                  color: policyResult.recommendation === 'APPROVE' ? '#34d399' : '#f87171',
                }}>
                  {policyResult.recommendation || 'EVALUATED'}
                </div>
                <div className="text-xs text-slate-300">{policyResult.rationale || 'Policy evaluation complete'}</div>
              </div>

              {/* Policy Result Details */}
              <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                {policyResult.evaluation_id && (
                  <div className="p-2 rounded bg-slate-950 border border-slate-800 col-span-2">
                    <div className="text-slate-500 text-[9px]">Evaluation ID</div>
                    <div className="text-violet-300 font-bold text-[11px]">{policyResult.evaluation_id}</div>
                  </div>
                )}
                {policyResult.policy_violations && policyResult.policy_violations.length > 0 && (
                  <div className="col-span-2 space-y-1">
                    <div className="text-[10px] text-red-400 uppercase font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Policy Violations
                    </div>
                    {policyResult.policy_violations.map((v: string, i: number) => (
                      <div key={i} className="text-[10px] text-slate-400 pl-4">• {v}</div>
                    ))}
                  </div>
                )}
                {policyResult.satisfied_policies && policyResult.satisfied_policies.length > 0 && (
                  <div className="col-span-2 space-y-1">
                    <div className="text-[10px] text-emerald-400 uppercase font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Satisfied Policies ({policyResult.satisfied_policies.length})
                    </div>
                    {policyResult.satisfied_policies.slice(0, 5).map((p: string, i: number) => (
                      <div key={i} className="text-[10px] text-slate-400 pl-4">✓ {p}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {!policyResult && !policyMutation.isPending && (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-slate-500 font-mono text-sm">
              <Lock className="w-10 h-10 text-slate-700" />
              <span className="text-xs text-center">Click "Evaluate Policy" to validate the demo plan against all governance rules.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
