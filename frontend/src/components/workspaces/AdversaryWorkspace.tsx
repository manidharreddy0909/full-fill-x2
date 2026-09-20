/**
 * AdversaryWorkspace — Resilience Attack Laboratory
 * Phase 13C: Response & Decision Visualization
 *
 * Design: Red team chaos testing ("WHAT CAN BREAK?"), attack vector breakdown (Base Plan → Attack → Failure → Impact → Resilience Result),
 * AdversaryAttackPath integration, vulnerability pattern detection.
 */

import React, { useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  fetchAdversaryStatus,
  runAdversary,
  generateAttackSuite,
  fetchLatestFindings,
} from '../../api/adversaryApi';
import { useVisualEnvironmentStore } from '../../store/visualEnvironmentStore';
import { StatusPill } from '../../visual/telemetry/StatusPill';
import { AdversaryAttackPath } from '../../visual/response/AdversaryAttackPath';
import {
  Activity, Swords, AlertTriangle, Zap, ShieldX,
  RefreshCw, Target, TrendingDown, ChevronRight, Bug,
  ShieldCheck, AlertCircle
} from 'lucide-react';
import { AdversaryAttack, AttackSeverity, Vulnerability } from '../../types/adversary';

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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="relative min-h-[calc(100vh-60px)] p-6 text-slate-100 flex flex-col gap-6 bg-[#030712] font-sans"
    >
      {/* Header Controls HUD Bar */}
      <div className="p-5 rounded-xl bg-[#090d16]/90 border border-amber-500/20 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-amber-950/60 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
            <Swords className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight font-mono uppercase">
                Adversary Chaos Engine — Resilience Attack Lab
              </h1>
              <StatusPill color="#fbbf24" label="CHAOS SUITE READY" pulse />
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Engine v{status?.engine_version || '1.0.0'} · {status?.supported_attack_types?.length || 6} Attack Types · {vulnerabilities.length} Vulnerabilities Detected
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => attackSuiteMutation.mutate()}
            disabled={attackSuiteMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-50 text-white text-xs font-mono font-bold transition-all shadow-md shadow-amber-900/30"
          >
            {attackSuiteMutation.isPending ? <Activity className="w-3.5 h-3.5 animate-spin" /> : <Target className="w-3.5 h-3.5" />}
            <span>GENERATE ATTACK SUITE</span>
          </button>

          <button
            onClick={() => runMutation.mutate()}
            disabled={runMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 disabled:opacity-50 text-white text-xs font-mono font-bold transition-all shadow-md shadow-red-900/30"
          >
            {runMutation.isPending ? <Activity className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
            <span>RUN FULL ADVERSARY</span>
          </button>
        </div>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Left Column (2 Cols): Simulated Attack Vectors Stack */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 p-5 rounded-xl bg-[#090d16]/90 border border-amber-500/20 backdrop-blur-xl shadow-2xl flex flex-col gap-4"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 font-mono text-xs">
            <span className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <ShieldX className="w-4 h-4 text-amber-400" />
              <span>Simulated Attack Vectors ({attacks.length})</span>
            </span>
            <StatusPill color="#fbbf24" label="RED TEAM SIMULATION" />
          </div>

          <div className="space-y-3.5 max-h-[580px] overflow-y-auto pr-1">
            {attacks.map((atk) => (
              <AdversaryAttackPath
                key={atk.attack_id}
                attackId={atk.attack_id}
                attackType={atk.attack_type}
                targetNodeId={atk.targets?.[0]?.entity_id || 'GLOBAL'}
                severity={atk.severity}
                impactDescription={atk.description || `Capacity Loss ${atk.capacity_loss_pct}%`}
                resilienceScore={0.88}
              />
            ))}

            {attacks.length === 0 && (
              <div className="text-center text-slate-500 font-mono text-xs py-12">
                Click 'Generate Attack Suite' or 'Run Full Adversary' above to execute red team chaos vectors.
              </div>
            )}
          </div>
        </motion.div>

        {/* Right Column: Overall Vulnerabilities & System Resilience Summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-5 rounded-xl bg-[#090d16]/90 border border-amber-500/20 backdrop-blur-xl shadow-2xl flex flex-col gap-4"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 font-mono text-xs">
            <span className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Bug className="w-4 h-4 text-red-400" />
              <span>Detected Vulnerabilities ({vulnerabilities.length})</span>
            </span>
          </div>

          <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
            {vulnerabilities.map((v, idx) => (
              <div key={idx} className="p-3.5 rounded-lg bg-[#030712]/90 border border-slate-800 flex flex-col gap-1.5 hover:border-red-500/30 transition-all font-sans">
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="text-red-400 font-bold uppercase">{v.type}</span>
                  <StatusPill color="#f87171" label={v.severity} />
                </div>

                <p className="text-xs text-slate-200 leading-relaxed">{v.description || v.title}</p>

                <div className="text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-900">
                  Target: <strong className="text-slate-200">{v.affected_entities?.[0] || 'GLOBAL'}</strong>
                </div>
              </div>
            ))}

            {vulnerabilities.length === 0 && (
              <div className="text-center text-slate-500 font-mono text-xs py-12">
                ✓ No critical vulnerabilities flagged in latest chaos run.
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
