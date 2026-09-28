/**
 * Reusable Badges & Indicators — Intelligence UI Layer
 */
import React from 'react';
import { CheckCircle2, AlertTriangle, HelpCircle, Shield, Clock } from 'lucide-react';
import type { TransferabilityState, ProvenanceType, TruthStatus, AutonomyLevel } from '../../types/intelligence';

export const TransferabilityBadge: React.FC<{
  state: TransferabilityState;
  showIcon?: boolean;
}> = ({ state, showIcon = true }) => {
  const cls =
    state === 'TRANSFERABLE'
      ? 'transferable'
      : state === 'PARTIAL'
      ? 'partial'
      : state === 'NON-TRANSFERABLE'
      ? 'non-transferable'
      : 'unknown';

  return (
    <span className={`transfer-badge ${cls}`}>
      {showIcon && (
        <span style={{ marginRight: '4px' }}>
          {state === 'TRANSFERABLE' && '✓'}
          {state === 'PARTIAL' && '◐'}
          {state === 'NON-TRANSFERABLE' && '✕'}
          {state === 'UNKNOWN' && '?'}
        </span>
      )}
      {state}
    </span>
  );
};

export const EvidenceBadge: React.FC<{
  count: number;
  provenance?: ProvenanceType;
}> = ({ count, provenance = 'observed' }) => (
  <span className={`provenance-badge ${provenance}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
    {provenance === 'observed' && '● '}
    {provenance === 'simulated' && '◇ '}
    {provenance === 'derived' && '△ '}
    {provenance === 'inferred' && '◈ '}
    {provenance === 'hypothesis' && '? '}
    {provenance === 'stale' && '⊗ '}
    {count} {count === 1 ? 'EVIDENCE' : 'EVIDENCES'}
  </span>
);

export const TruthStatusBadge: React.FC<{ status: TruthStatus }> = ({ status }) => {
  const cls = status.toLowerCase();
  return (
    <span className={`knowledge-zone ${cls}`} style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '4px', fontSize: '9px' }}>
      {status}
    </span>
  );
};

export const ConfidenceIndicator: React.FC<{
  value: number; // 0.0 to 1.0
  label?: string;
  color?: string;
}> = ({ value, label, color = '#38bdf8' }) => {
  const pct = Math.round(value * 100);
  const barColor = value >= 0.8 ? '#34c77b' : value >= 0.6 ? '#38bdf8' : value >= 0.4 ? '#f5a623' : '#e8503a';
  const effectiveColor = color !== '#38bdf8' ? color : barColor;

  return (
    <div style={{ width: '100%' }}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
          <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#4a5c72', textTransform: 'uppercase' }}>
            {label}
          </span>
          <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: effectiveColor }}>
            {pct}%
          </span>
        </div>
      )}
      <div className="confidence-bar-track">
        <div
          className="confidence-bar-fill"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${effectiveColor}80, ${effectiveColor})` }}
        />
      </div>
    </div>
  );
};

export const GovernanceGate: React.FC<{
  level: AutonomyLevel;
  requiredApprovals?: number;
  currentApprovals?: number;
}> = ({ level, requiredApprovals = 1, currentApprovals = 0 }) => {
  const cfg = {
    AUTO: { cls: 'auto', label: 'AUTONOMOUS EXECUTION', desc: 'Pre-approved under verified genome boundaries' },
    MONITOR: { cls: 'monitor', label: 'AUTO + MONITOR', desc: 'Auto-executing with real-time operator alerts' },
    APPROVAL: { cls: 'approval', label: 'OPERATOR APPROVAL REQUIRED', desc: `Requires ${requiredApprovals} human authorization (${currentApprovals}/${requiredApprovals} secured)` },
    BLOCKED: { cls: 'blocked', label: 'POLICY BLOCKED', desc: 'Boundary violation or insufficient confidence' },
  }[level];

  return (
    <div className={`autonomy-level ${cfg.cls}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '6px' }}>
      <Shield size={12} />
      <div>
        <div style={{ fontWeight: 800 }}>{cfg.label}</div>
        <div style={{ fontSize: '8px', opacity: 0.85, fontWeight: 400 }}>{cfg.desc}</div>
      </div>
    </div>
  );
};
