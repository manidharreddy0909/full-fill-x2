import React, { useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { verificationApi } from '../../api/verificationApi';
import { useVisualEnvironmentStore } from '../../store/visualEnvironmentStore';
import { useAgentStore } from '../../store/agentStore';
import {
  Activity, ShieldCheck, CheckCircle2, XCircle, AlertTriangle,
  ClipboardCheck, Zap, Info,
} from 'lucide-react';
import { ValidationCheck, VerificationReport } from '../../types/verification';

const checkStatusIcon = (status: string) => {
  switch (status) {
    case 'PASSED': return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
    case 'FAILED': return <XCircle className="w-4 h-4 text-red-400 shrink-0" />;
    default: return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
  }
};

const checkStatusColor = (status: string) => {
  switch (status) {
    case 'PASSED': return 'text-emerald-400';
    case 'FAILED': return 'text-red-400';
    default: return 'text-amber-400';
  }
};

export const VerificationWorkspace: React.FC = () => {
  const { setEnvironmentMode } = useVisualEnvironmentStore();
  const { coordinatorResult } = useAgentStore();

  useEffect(() => {
    setEnvironmentMode('DECISION');
  }, [setEnvironmentMode]);

  const { data: status } = useQuery({
    queryKey: ['verificationStatus'],
    queryFn: () => verificationApi.getStatus(),
  });

  const { data: latestReport, refetch: refetchReport } = useQuery({
    queryKey: ['verificationReport'],
    queryFn: () => verificationApi.getLatestReport(),
    retry: false,
  });

  const runVerificationMutation = useMutation({
    mutationFn: (candidatePlan: any) => verificationApi.runVerification(candidatePlan),
    onSuccess: () => refetchReport(),
  });

  const report: VerificationReport | undefined = runVerificationMutation.data || latestReport;

  const firstPlan = coordinatorResult?.candidate_plans?.[0];

  const overallColor = report
    ? report.status === 'VERIFIED' ? '#34d399'
    : report.status === 'CONDITIONAL' ? '#fbbf24'
    : '#f87171'
    : '#94a3b8';

  return (
    <div className="relative min-h-[calc(100vh-60px)] p-6 text-slate-100 flex flex-col gap-6 bg-[#040813]">
      {/* Header */}
      <div className="p-5 rounded-xl bg-slate-900/85 border border-slate-800 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-800/80 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white">Verification Sandbox — Plan Safety & Feasibility Engine</h1>
            <p className="text-xs text-slate-400">
              v{status?.engine_version || '—'} · {status?.supported_rules_count ?? 0} safety rules ·{' '}
              {status?.immutability_guarantee || 'Immutability guaranteed'}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              if (firstPlan) {
                runVerificationMutation.mutate(firstPlan);
              } else {
                // Run verification on a minimal synthetic plan if no coordinator result available
                runVerificationMutation.mutate({
                  candidate_id: 'VERIFY-DEMO',
                  name: 'Demo Verification Run',
                  description: 'Verification sandbox run',
                  actions: [],
                  supporting_agents: [],
                  objectives_addressed: [],
                  agreements: [],
                  conflicts_involved: [],
                  estimated_total_cost: 0,
                  estimated_max_delay_hours: 0,
                  estimated_total_emissions_co2_kg: 0,
                  status: 'PENDING',
                  violations: [],
                });
              }
            }}
            disabled={runVerificationMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-900 text-white text-xs font-mono font-semibold transition-all shadow-lg shadow-emerald-600/30"
          >
            {runVerificationMutation.isPending
              ? <Activity className="w-3.5 h-3.5 animate-spin" />
              : <Zap className="w-3.5 h-3.5" />}
            <span>{firstPlan ? `VERIFY "${firstPlan.name.slice(0, 20)}..."` : 'RUN VERIFICATION SANDBOX'}</span>
          </button>

          <button
            onClick={() => refetchReport()}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
          >
            <ClipboardCheck className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Status Banner */}
      {report && (
        <div
          className="p-5 rounded-xl border backdrop-blur-md flex flex-wrap items-center justify-between gap-4"
          style={{
            background: `${overallColor}0d`,
            borderColor: `${overallColor}44`,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center font-mono text-lg font-black"
              style={{ background: `${overallColor}20`, color: overallColor }}
            >
              {(report.overall_score * 100).toFixed(0)}%
            </div>
            <div>
              <div className="font-bold text-white">{report.summary_headline}</div>
              <div className="text-xs text-slate-400 mt-0.5">{report.narrative_explanation.slice(0, 120)}...</div>
            </div>
          </div>

          <div className="flex gap-4 font-mono text-xs">
            {[
              { label: 'Passed', value: report.passed_checks_count, color: '#34d399' },
              { label: 'Warnings', value: report.warning_checks_count, color: '#fbbf24' },
              { label: 'Failed', value: report.failed_checks_count, color: '#f87171' },
              { label: 'Total Checks', value: report.total_checks_count, color: '#94a3b8' },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center">
                <span className="text-lg font-black" style={{ color: stat.color }}>{stat.value}</span>
                <span className="text-[10px] text-slate-400">{stat.label}</span>
              </div>
            ))}
          </div>

          <span
            className="font-mono text-sm font-black px-4 py-1.5 rounded-lg"
            style={{
              color: overallColor,
              background: `${overallColor}20`,
              border: `2px solid ${overallColor}50`,
            }}
          >
            {report.status}
          </span>
        </div>
      )}

      {runVerificationMutation.isPending && (
        <div className="flex items-center justify-center py-16 gap-3 text-slate-400 font-mono text-sm">
          <Activity className="w-6 h-6 animate-spin text-emerald-400" />
          <span>Running plan verification against {status?.supported_rules_count} safety rules...</span>
        </div>
      )}

      {/* Check Tables */}
      {report && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Validation Checks */}
          <div className="p-5 rounded-xl bg-slate-900/85 border border-slate-800 backdrop-blur-md shadow-xl flex flex-col gap-3">
            <h2 className="font-semibold text-sm border-b border-slate-800 pb-2 text-slate-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Validation Checks ({report.validation_checks.length})</span>
            </h2>

            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {report.validation_checks.map((check: ValidationCheck) => (
                <div key={check.check_id} className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 flex items-start gap-2 font-mono text-xs">
                  {checkStatusIcon(check.status)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-200 truncate">{check.name}</span>
                      <span className={`text-[10px] font-bold shrink-0 ${checkStatusColor(check.status)}`}>{check.status}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{check.message}</div>
                    <div className="text-[9px] text-slate-500">{check.category} · {check.severity}</div>
                  </div>
                </div>
              ))}

              {report.validation_checks.length === 0 && (
                <div className="text-slate-500 font-mono text-xs text-center py-4">No validation checks recorded.</div>
              )}
            </div>
          </div>

          {/* Constraint Checks */}
          <div className="p-5 rounded-xl bg-slate-900/85 border border-slate-800 backdrop-blur-md shadow-xl flex flex-col gap-3">
            <h2 className="font-semibold text-sm border-b border-slate-800 pb-2 text-slate-200 flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-blue-400" />
              <span>Constraint Checks ({report.constraint_checks.length})</span>
            </h2>

            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {report.constraint_checks.map((c: any) => (
                <div key={c.constraint_id} className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 flex items-start gap-2 font-mono text-xs">
                  {c.is_satisfied
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    : <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-200 truncate">{c.name}</span>
                      <span className={`text-[10px] font-bold shrink-0 ${c.constraint_type === 'HARD' ? 'text-red-400' : 'text-amber-400'}`}>
                        {c.constraint_type}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {c.metric_name}: {c.actual_simulated_value?.toFixed(3)} (threshold: {c.threshold})
                    </div>
                    <div className="text-[10px] text-slate-500">{c.message}</div>
                  </div>
                </div>
              ))}

              {report.constraint_checks.length === 0 && (
                <div className="text-slate-500 font-mono text-xs text-center py-4">No constraint checks recorded.</div>
              )}
            </div>
          </div>

          {/* Simulation Result */}
          {report.simulation_result && (
            <div className="lg:col-span-2 p-5 rounded-xl bg-slate-900/85 border border-slate-800 backdrop-blur-md shadow-xl">
              <h2 className="font-semibold text-sm border-b border-slate-800 pb-2 text-slate-200 flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span>Sandbox Simulation Result — State Delta</span>
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 font-mono text-xs">
                {[
                  { label: 'Service Level', before: report.simulation_result.state_diff.service_level_before, after: report.simulation_result.state_diff.service_level_after, pct: true, positive: true },
                  { label: 'Total Cost', before: report.simulation_result.state_diff.total_cost_before, after: report.simulation_result.state_diff.total_cost_after, positive: false },
                  { label: 'Delay Hours', before: report.simulation_result.state_diff.delay_hours_before, after: report.simulation_result.state_diff.delay_hours_after, positive: false },
                  { label: 'Emissions', before: report.simulation_result.state_diff.emissions_co2_before, after: report.simulation_result.state_diff.emissions_co2_after, positive: false },
                  { label: 'Agg. Risk', before: report.simulation_result.state_diff.aggregate_risk_before, after: report.simulation_result.state_diff.aggregate_risk_after, pct: true, positive: false },
                ].map((metric) => {
                  const delta = metric.after - metric.before;
                  const improved = metric.positive ? delta > 0 : delta < 0;
                  return (
                    <div key={metric.label} className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase mb-1">{metric.label}</div>
                      <div className="text-slate-400 text-[10px]">Before: {metric.pct ? `${(metric.before * 100).toFixed(1)}%` : metric.before?.toFixed(1)}</div>
                      <div className="text-slate-200 font-bold">After: {metric.pct ? `${(metric.after * 100).toFixed(1)}%` : metric.after?.toFixed(1)}</div>
                      <div className={`text-[10px] font-bold mt-1 ${improved ? 'text-emerald-400' : 'text-red-400'}`}>
                        {delta > 0 ? '+' : ''}{metric.pct ? `${(delta * 100).toFixed(1)}%` : delta?.toFixed(1)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Findings */}
          {report.findings.length > 0 && (
            <div className="lg:col-span-2 p-5 rounded-xl bg-amber-950/20 border border-amber-900/60 backdrop-blur-md shadow-xl">
              <h2 className="font-semibold text-sm border-b border-amber-900/60 pb-2 text-amber-200 flex items-center gap-2 mb-3">
                <Info className="w-4 h-4 text-amber-400" />
                <span>Verification Findings ({report.findings.length})</span>
              </h2>
              <div className="space-y-2">
                {report.findings.map((f: any) => (
                  <div key={f.finding_id} className="p-3 rounded-lg bg-slate-950/80 border border-amber-900/40 flex flex-col gap-1 font-mono text-xs">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="font-bold text-amber-200">{f.title}</span>
                      <span className="ml-auto text-[10px] text-amber-400 font-bold">{f.severity}</span>
                    </div>
                    <p className="text-slate-400 text-[11px] font-sans">{f.description}</p>
                    <p className="text-slate-500 text-[10px]">Remediation: {f.remediation_advice}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!report && !runVerificationMutation.isPending && (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-500 font-mono text-sm">
          <ShieldCheck className="w-12 h-12 text-slate-700" />
          <div className="text-center">
            <div className="text-base font-semibold text-slate-300 mb-1">Verification Engine Ready</div>
            <div className="text-xs text-slate-500">
              {firstPlan
                ? `Click to verify the coordinator plan: "${firstPlan.name}"`
                : 'Run the Coordinator first, or click Run Verification to test with a demo plan.'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
