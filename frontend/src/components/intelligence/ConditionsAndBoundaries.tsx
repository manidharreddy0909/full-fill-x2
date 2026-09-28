/**
 * Reusable Conditions, Boundaries, and Learning Components
 */
import React from 'react';
import { CheckCircle2, AlertTriangle, HelpCircle, ArrowRight, TrendingUp, TrendingDown, Swords } from 'lucide-react';
import type { TruthStatus, ChallengeStatus } from '../../types/intelligence';

export const SuccessCondition: React.FC<{
  text: string;
  verified: boolean;
  parameter?: string;
  threshold?: string;
}> = ({ text, verified, parameter, threshold }) => (
  <div className={`genome-condition success ${verified ? 'verified' : 'unverified'}`}>
    <CheckCircle2 size={11} color={verified ? '#34c77b' : '#3d5168'} style={{ flexShrink: 0, marginTop: '1px' }} />
    <div style={{ flex: 1 }}>
      <div>{text}</div>
      {parameter && threshold && (
        <div style={{ fontSize: '9px', color: '#4a5c72', marginTop: '2px' }}>
          Param: <code style={{ color: '#38bdf8' }}>{parameter}</code> Threshold: <code style={{ color: '#34c77b' }}>{threshold}</code>
        </div>
      )}
    </div>
    <span style={{ fontSize: '8px', color: verified ? '#34c77b' : '#4a5c72', textTransform: 'uppercase', fontWeight: 700 }}>
      {verified ? 'VERIFIED' : 'UNTESTED'}
    </span>
  </div>
);

export const FailureBoundary: React.FC<{
  text: string;
  verified: boolean;
  parameter?: string;
  threshold?: string;
  severity?: 'CRITICAL' | 'WARNING';
}> = ({ text, verified, parameter, threshold, severity = 'CRITICAL' }) => (
  <div className={`genome-condition failure ${verified ? 'verified' : 'unverified'}`}>
    <AlertTriangle size={11} color={verified ? '#e8503a' : '#f5a623'} style={{ flexShrink: 0, marginTop: '1px' }} />
    <div style={{ flex: 1 }}>
      <div>{text}</div>
      {parameter && threshold && (
        <div style={{ fontSize: '9px', color: '#4a5c72', marginTop: '2px' }}>
          Limit: <code style={{ color: '#e8503a' }}>{parameter} {threshold}</code>
        </div>
      )}
    </div>
    <span style={{
      fontSize: '8px',
      color: severity === 'CRITICAL' ? '#e8503a' : '#f5a623',
      textTransform: 'uppercase',
      fontWeight: 700,
      background: severity === 'CRITICAL' ? 'rgba(232,80,58,0.1)' : 'rgba(245,166,35,0.1)',
      padding: '1px 5px',
      borderRadius: '3px',
    }}>
      {severity}
    </span>
  </div>
);

export const UnknownZone: React.FC<{
  zones?: Array<{ zone: TruthStatus; count: number; desc: string }>;
}> = ({
  zones = [
    { zone: 'KNOWN', count: 5, desc: 'Validated by direct operational observation' },
    { zone: 'PROBABLE', count: 4, desc: 'High-confidence structural inference' },
    { zone: 'UNCERTAIN', count: 2, desc: 'Limited or conflicting evidence base' },
    { zone: 'UNKNOWN', count: 1, desc: 'No validated historical experience exists' },
  ],
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
    {zones.map((z) => {
      const cls = z.zone.toLowerCase();
      return (
        <div key={z.zone} className={`knowledge-zone ${cls}`} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '3px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <span>{z.zone}</span>
            <span style={{ fontSize: '13px', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{z.count}</span>
          </div>
          <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#4a5c72', fontWeight: 400, textTransform: 'none', letterSpacing: '0' }}>
            {z.desc}
          </div>
        </div>
      );
    })}
  </div>
);

export const PredictionActual: React.FC<{
  predicted: { label: string; value: string | number };
  actual: { label: string; value: string | number };
  accuracyDelta?: string;
}> = ({ predicted, actual, accuracyDelta }) => (
  <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(7,14,26,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '8px' }}>
      <div style={{ padding: '8px', borderRadius: '6px', background: 'rgba(56,189,248,0.05)', border: '1px solid rgba(56,189,248,0.15)' }}>
        <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#38bdf8', textTransform: 'uppercase' }}>{predicted.label}</div>
        <div style={{ fontSize: '15px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#c8daea', marginTop: '2px' }}>{predicted.value}</div>
      </div>
      <ArrowRight size={13} color="#3d5168" />
      <div style={{ padding: '8px', borderRadius: '6px', background: 'rgba(52,199,123,0.05)', border: '1px solid rgba(52,199,123,0.15)' }}>
        <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#34c77b', textTransform: 'uppercase' }}>{actual.label}</div>
        <div style={{ fontSize: '15px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#34c77b', marginTop: '2px' }}>{actual.value}</div>
      </div>
    </div>
    {accuracyDelta && (
      <div style={{ marginTop: '8px', fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#7a90aa', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <TrendingUp size={10} color="#38bdf8" />
        {accuracyDelta}
      </div>
    )}
  </div>
);

export const LearningDelta: React.FC<{
  metric: string;
  before: number;
  after: number;
  unit?: string;
  explanation: string;
}> = ({ metric, before, after, unit = '%', explanation }) => {
  const delta = +(after - before).toFixed(1);
  const isPositive = delta >= 0;

  return (
    <div className={`learning-delta-card ${isPositive ? 'improved' : 'drift'}`} style={{ padding: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#7a90aa', textTransform: 'uppercase' }}>
          {metric}
        </span>
        <span style={{
          fontSize: '11px',
          fontFamily: 'var(--font-mono)',
          fontWeight: 800,
          color: isPositive ? '#34c77b' : '#e8503a',
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
        }}>
          {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {isPositive ? `+${delta}` : delta}{unit}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: '#4a5c72' }}>{before}{unit}</span>
        <ArrowRight size={10} color="#3d5168" />
        <span style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#c8daea' }}>{after}{unit}</span>
      </div>
      <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#3d5168', lineHeight: 1.4 }}>
        {explanation}
      </div>
    </div>
  );
};

export const ChallengeResult: React.FC<{
  status: ChallengeStatus;
  testedDimensions: string[];
  vulnerabilitiesFound?: number;
}> = ({ status, testedDimensions, vulnerabilitiesFound = 0 }) => {
  const cfg = {
    ROBUST: { color: '#34c77b', bg: 'rgba(52,199,123,0.1)', border: 'rgba(52,199,123,0.25)', label: 'CHALLENGE PASSED' },
    FRAGILE: { color: '#f5a623', bg: 'rgba(245,166,35,0.1)', border: 'rgba(245,166,35,0.25)', label: 'FRAGILITY DETECTED' },
    VULNERABLE: { color: '#e8503a', bg: 'rgba(232,80,58,0.1)', border: 'rgba(232,80,58,0.25)', label: 'HIGH VULNERABILITY' },
    UNKNOWN: { color: '#4a5c72', bg: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.08)', label: 'UNTESTED' },
  }[status];

  return (
    <div style={{ padding: '10px', borderRadius: '7px', background: cfg.bg, border: `1px solid ${cfg.border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Swords size={11} color={cfg.color} />
          <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: cfg.color, letterSpacing: '0.06em' }}>
            {cfg.label}
          </span>
        </div>
        {vulnerabilitiesFound > 0 && (
          <span style={{ fontSize: '8px', color: '#e8503a', background: 'rgba(232,80,58,0.15)', padding: '1px 5px', borderRadius: '3px' }}>
            {vulnerabilitiesFound} VULNERABILITIES
          </span>
        )}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
        {testedDimensions.map((d) => (
          <span key={d} style={{ fontSize: '8px', fontFamily: 'var(--font-mono)', color: '#7a90aa', background: 'rgba(255,255,255,0.05)', padding: '2px 5px', borderRadius: '3px' }}>
            {d}
          </span>
        ))}
      </div>
    </div>
  );
};
