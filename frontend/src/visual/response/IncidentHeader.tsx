/**
 * IncidentHeader — Autonomous Incident Command Top HUD
 * Phase 13C: Response & Decision Visualization
 */

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, AlertTriangle, Activity, Clock } from 'lucide-react';
import { StatusPill } from '../telemetry/StatusPill';

export interface IncidentHeaderProps {
  incidentId: string;
  severity: 'NORMAL' | 'WARNING' | 'HIGH' | 'CRITICAL';
  affectedNodesCount: number;
  deliberationStatus?: string;
  onTriggerDeliberation: () => void;
  isPending: boolean;
}

export const IncidentHeader: React.FC<IncidentHeaderProps> = ({
  incidentId,
  severity,
  affectedNodesCount,
  deliberationStatus = 'READY',
  onTriggerDeliberation,
  isPending,
}) => {
  const getSeverityColor = () => {
    switch (severity) {
      case 'CRITICAL': return '#f87171';
      case 'HIGH': return '#fb923c';
      case 'WARNING': return '#fbbf24';
      default: return '#34d399';
    }
  };

  const color = getSeverityColor();

  return (
    <div className="p-5 rounded-xl bg-[#090d16]/90 border border-red-500/20 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4 shadow-2xl font-sans">
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-lg bg-red-950/60 border border-red-500/30 flex items-center justify-center text-red-400 shadow-inner">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-white tracking-tight font-mono uppercase">
              Autonomous Incident Command — War Room
            </h1>
            <StatusPill color={color} label={`INCIDENT ${incidentId}`} pulse={severity === 'CRITICAL'} />
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Severity: <strong style={{ color }}>{severity}</strong> · Affected Entities: <strong className="text-slate-200">{affectedNodesCount} Nodes</strong> · Deliberation: <strong className="text-purple-300">{deliberationStatus}</strong>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onTriggerDeliberation}
          disabled={isPending}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 disabled:opacity-50 text-white text-xs font-mono font-bold transition-all shadow-md shadow-red-900/30"
        >
          {isPending ? <Activity className="w-3.5 h-3.5 animate-spin" /> : <ShieldAlert className="w-3.5 h-3.5" />}
          <span>TRIGGER DELIBERATION</span>
        </button>
      </div>
    </div>
  );
};
