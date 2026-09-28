/**
 * DeepDecisionLinkCard — Progressive Disclosure Bridge to Decision Convergence (Phase 6G)
 *
 * Connects deep intelligence studios (GNN, Causal, ML, Simulation, War Room, Adversary, Risk)
 * to the authoritative Decision Clearance layer without flattening the studios.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Scale, ArrowRight, ShieldCheck, Cpu, ExternalLink, Sparkles } from 'lucide-react';
import { TruthTag } from './TruthTag';
import { TruthMode } from '../../visual/tokens';
import { useIncidentContextStore } from '../../store/incidentContextStore';

interface DeepDecisionLinkCardProps {
  studioName: string;
  truthMode: TruthMode;
  metricLabel: string;
  metricValue: string;
  decisionImpactSummary: string;
  recommendedActionHint?: string;
}

export const DeepDecisionLinkCard: React.FC<DeepDecisionLinkCardProps> = ({
  studioName,
  truthMode,
  metricLabel,
  metricValue,
  decisionImpactSummary,
  recommendedActionHint,
}) => {
  const { activeIncident, selectedStrategy, governanceDecision } = useIncidentContextStore();

  return (
    <div className="p-4 rounded-xl bg-[#090d16]/90 border border-cyan-500/25 backdrop-blur-xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 shadow-inner">
          <Scale className="w-5 h-5" />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              {studioName} · Decision Evidence Bridge
            </span>
            <TruthTag mode={truthMode} />
            <span className="text-[11px] text-slate-400">
              Active Incident: <strong className="text-white">{activeIncident?.id || 'INC-2026-SUP002'}</strong>
            </span>
          </div>

          <div className="text-xs text-slate-200 mt-1 font-sans leading-relaxed">
            <span className="font-bold font-mono text-cyan-300 mr-2">
              [{metricLabel}: {metricValue}]
            </span>
            {decisionImpactSummary}
          </div>

          {recommendedActionHint && (
            <div className="text-[11px] text-slate-400 mt-0.5">
              Candidate Strategy: <strong className="text-emerald-400">{selectedStrategy?.name || 'Governed Shift to Supplier D'}</strong> · {recommendedActionHint}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Link
          to="/decision/cockpit"
          className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-cyan-900/30 flex items-center gap-1.5"
        >
          <span>View Decision Clearance</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
