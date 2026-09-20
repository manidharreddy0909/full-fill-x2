import React, { useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  fetchAdversaryStatus,
  runAdversary,
  generateAttackSuite,
  fetchLatestFindings,
} from '../../api/adversaryApi';
import { useVisualEnvironmentStore } from '../../store/visualEnvironmentStore';
import {
  Activity, Swords, AlertTriangle, Zap, ShieldX,
  RefreshCw, Target, TrendingDown, ChevronRight, Bug,
} from 'lucide-react';
import { AdversaryAttack, AttackSeverity, Vulnerability } from '../../types/adversary';

const severityColor: Record<AttackSeverity, string> = {
  CRITICAL: '#f87171',
  HIGH: '#fb923c',
  MEDIUM: '#fbbf24',
  LOW: '#34d399',
};

const severityBg: Record<AttackSeverity, string> = {
  CRITICAL: 'rgba(248,113,113,0.1)',
  HIGH: 'rgba(251,146,60,0.1)',
  MEDIUM: 'rgba(251,191,36,0.1)',
  LOW: 'rgba(52,211,153,0.1)',
};

export const AdversaryWorkspace: React.FC = () => {
  const { setEnvironmentMode } = useVisualEnvironmentStore();

  useEffect(() => {
    setEnvironmentMode('INTELLIGENCE');
  }, [setEnvironmentMode]);

  const { data: status } = useQuery({
    queryKey: ['adversaryStatus'],
    queryFn: fetchAdversaryStatus,
  });

  const { data: latestFindings, refetch: refetchFindings } = useQuery({
    queryKey: ['adversaryFindings'],
    queryFn: fetchLatestFindings,
  });

  const runMutation = useMutation({
    mutationFn: () => runAdversary(undefined, '', 42),
    onSuccess: () => refetchFindings(),
  });

  const attackSuiteMutation = useMutation({
    mutationFn: () => generateAttackSuite(undefined, 42),
  });

  const attacks: AdversaryAttack[] = attackSuiteMutation.data || latestFindings?.attack_suite || [];
  const vulnerabilities: Vulnerability[] = latestFindings?.overall_vulnerabilities || [];
  const report = latestFindings;

  return (
    <div className="relative min-h-[calc(100vh-60px)] p-6 text-slate-100 flex flex-col gap-6 bg-[#040813]">
      {/* Header */}
      <div className="p-5 rounded-xl bg-slate-900/85 border border-slate-800 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-950/80 border border-orange-800/80 flex items-center justify-center text-orange-400">
            <Swords className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white">Adversary Chaos Engine — Red Team Attack Suite</h1>
            <p className="text-xs text-slate-400">
              v{status?.engine_version || '—'} · {status?.supported_attack_types?.length || 0} attack types ·{' '}
              {status?.supported_vulnerability_types?.length || 0} vulnerability patterns
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => attackSuiteMutation.mutate()}
            disabled={attackSuiteMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:bg-amber-900 text-white text-xs font-mono font-semibold transition-all"
          >
            {attackSuiteMutation.isPending
              ? <Activity className="w-3.5 h-3.5 animate-spin" />
              : <Target className="w-3.5 h-3.5" />}
            <span>GENERATE ATTACK SUITE</span>
          </button>

          <button
            onClick={() => runMutation.mutate()}
            disabled={runMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 disabled:bg-red-900 text-white text-xs font-mono font-semibold transition-all shadow-lg shadow-red-600/30"
          >
            {runMutation.isPending
              ? <Activity className="w-3.5 h-3.5 animate-spin" />
              : <Zap className="w-3.5 h-3.5" />}
            <span>RUN FULL ADVERSARY</span>
          </button>

          <button
            onClick={() => refetchFindings()}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
            title="Refresh findings"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Report Summary Banner */}
      {report && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Scenarios Tested', value: report.scenarios_tested, color: '#c084fc' },
            { label: 'Attacks Simulated', value: report.attack_suite.length, color: '#f87171' },
            { label: 'Vulnerabilities Found', value: report.overall_vulnerabilities.length, color: '#fb923c' },
            { label: 'Defensive Recs', value: report.defensive_recommendations.length, color: '#34d399' },
            { label: 'Latency', value: `${report.latency_ms}ms`, color: '#60a5fa' },
          ].map((kpi) => (
            <div key={kpi.label} className="p-4 rounded-xl bg-slate-900/85 border border-slate-800 backdrop-blur-md">
              <div className="text-[10px] text-slate-400 font-mono uppercase">{kpi.label}</div>
              <div className="text-xl font-bold mt-1 font-mono" style={{ color: kpi.color }}>{kpi.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Narrative Summary */}
      {report?.summary_narrative && (
        <div className="p-4 rounded-xl bg-orange-950/20 border border-orange-900/60 text-orange-100 text-sm leading-relaxed">
          <Bug className="w-4 h-4 inline mr-2 text-orange-400" />
          {report.summary_narrative}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attack Suite */}
        <div className="p-5 rounded-xl bg-slate-900/85 border border-slate-800 backdrop-blur-md shadow-xl flex flex-col gap-4">
          <h2 className="font-semibold text-sm border-b border-slate-800 pb-2 text-slate-200 flex items-center gap-2">
            <Target className="w-4 h-4 text-red-400" />
            <span>Generated Attack Suite ({attacks.length})</span>
          </h2>

          {(runMutation.isPending || attackSuiteMutation.isPending) && (
            <div className="flex items-center justify-center py-8 gap-2 text-slate-400 font-mono text-xs">
              <Activity className="w-4 h-4 animate-spin text-red-400" />
              <span>Generating adversarial attack scenarios...</span>
            </div>
          )}

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {attacks.map((attack) => (
              <div
                key={attack.attack_id}
                className="p-3 rounded-lg border font-mono text-xs flex flex-col gap-1.5"
                style={{
                  background: severityBg[attack.severity],
                  borderColor: `${severityColor[attack.severity]}33`,
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">{attack.attack_type.replace(/_/g, ' ')}</span>
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-bold"
                    style={{
                      color: severityColor[attack.severity],
                      background: `${severityColor[attack.severity]}22`,
                      border: `1px solid ${severityColor[attack.severity]}44`,
                    }}
                  >
                    {attack.severity}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">{attack.description}</p>
                <div className="flex gap-3 text-[10px] text-slate-400 pt-0.5">
                  <span>Targets: <strong className="text-slate-200">{attack.targets.length}</strong></span>
                  <span>Duration: <strong className="text-slate-200">{attack.duration_days}d</strong></span>
                  <span>Cap Loss: <strong className="text-red-400">{(attack.capacity_loss_pct * 100).toFixed(0)}%</strong></span>
                  <span>Delay: <strong className="text-amber-400">+{attack.delay_hours}h</strong></span>
                </div>
              </div>
            ))}

            {attacks.length === 0 && !runMutation.isPending && !attackSuiteMutation.isPending && (
              <div className="text-center text-slate-500 font-mono text-xs py-8">
                No attack suite generated. Click "Generate Attack Suite" to begin red-team analysis.
              </div>
            )}
          </div>
        </div>

        {/* Vulnerabilities */}
        <div className="p-5 rounded-xl bg-slate-900/85 border border-slate-800 backdrop-blur-md shadow-xl flex flex-col gap-4">
          <h2 className="font-semibold text-sm border-b border-slate-800 pb-2 text-slate-200 flex items-center gap-2">
            <ShieldX className="w-4 h-4 text-orange-400" />
            <span>System Vulnerabilities ({vulnerabilities.length})</span>
          </h2>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {vulnerabilities.map((vuln) => (
              <div
                key={vuln.vulnerability_id}
                className="p-3 rounded-lg border font-mono text-xs flex flex-col gap-1.5"
                style={{
                  background: severityBg[vuln.severity],
                  borderColor: `${severityColor[vuln.severity]}33`,
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-bold text-slate-200">{vuln.title}</div>
                    <div className="text-[10px] text-slate-400 font-sans mt-0.5">{vuln.type.replace(/_/g, ' ')}</div>
                  </div>
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-bold shrink-0"
                    style={{
                      color: severityColor[vuln.severity],
                      background: `${severityColor[vuln.severity]}22`,
                      border: `1px solid ${severityColor[vuln.severity]}44`,
                    }}
                  >
                    {vuln.severity}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">{vuln.description}</p>
                {vuln.affected_entities.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {vuln.affected_entities.map((e) => (
                      <span key={e} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[9px]">{e}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {vulnerabilities.length === 0 && !runMutation.isPending && (
              <div className="text-center text-slate-500 font-mono text-xs py-8">
                Run the full adversary to detect vulnerabilities in candidate plans.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Defensive Recommendations */}
      {report && report.defensive_recommendations.length > 0 && (
        <div className="p-5 rounded-xl bg-emerald-950/20 border border-emerald-900/60 backdrop-blur-md shadow-xl">
          <h2 className="font-semibold text-sm border-b border-emerald-900/60 pb-2 text-emerald-200 flex items-center gap-2 mb-3">
            <TrendingDown className="w-4 h-4 text-emerald-400" />
            <span>Defensive Recommendations ({report.defensive_recommendations.length})</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {report.defensive_recommendations.map((rec) => (
              <div key={rec.recommendation_id} className="p-3 rounded-lg bg-slate-950/80 border border-emerald-900/40 font-mono text-xs flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                  <ChevronRight className="w-3 h-3" />
                  <span>{rec.title}</span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">{rec.description}</p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-500">{rec.suggested_action_type.replace(/_/g, ' ')}</span>
                  <span className="text-emerald-400 font-bold text-[11px]">-{rec.estimated_mitigation_pct}% risk</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
