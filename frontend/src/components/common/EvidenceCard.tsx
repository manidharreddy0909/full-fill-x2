/**
 * EvidenceCard — Provenance & Epistemic Support Visual Primitive (Phase 6B)
 *
 * Shows lineage of an intelligence assertion or decision recommendation:
 * - Memory ID & Age
 * - Epistemic Truth Mode (Observed vs Simulated)
 * - Genome / Skill version
 * - Failure Boundary alerts
 * - Challenge / Adversary validation rate
 * - Contradiction alerts
 */
import React from 'react';
import { Shield, AlertTriangle, CheckCircle2, History, GitBranch, Crosshair } from 'lucide-react';
import { TruthTag } from './TruthTag';
import { TruthMode } from '../../visual/tokens';

export interface EvidenceItem {
  memoryId?: string;
  genomeId?: string;
  skillVersion?: string;
  truthMode: TruthMode;
  age?: string;
  boundaryRule?: string;
  isBoundaryBreached?: boolean;
  challengePassRate?: number;
  contradictionsCount?: number;
  notes?: string;
}

interface EvidenceCardProps {
  title?: string;
  evidence: EvidenceItem;
  className?: string;
  compact?: boolean;
  onInspectMemory?: (memoryId: string) => void;
  onInspectGenome?: (genomeId: string) => void;
}

export const EvidenceCard: React.FC<EvidenceCardProps> = ({
  title = 'DECISION EVIDENCE GROUNDING',
  evidence,
  className = '',
  compact = false,
  onInspectMemory,
  onInspectGenome,
}) => {
  return (
    <div
      className={`evidence-card ${className}`}
      style={{
        background: 'rgba(7, 14, 26, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '8px',
        padding: compact ? '8px 10px' : '12px 14px',
        fontFamily: 'var(--font-mono)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          paddingBottom: '6px',
        }}
      >
        <span
          style={{
            fontSize: '9px',
            fontWeight: 800,
            color: '#7a90aa',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          {title}
        </span>
        <TruthTag mode={evidence.truthMode} size="sm" />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: compact ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
          gap: '8px',
          fontSize: '10px',
        }}
      >
        {evidence.memoryId && (
          <div>
            <span style={{ color: '#4a5c72', display: 'block', fontSize: '8px' }}>MEMORY PROVENANCE</span>
            <button
              onClick={() => onInspectMemory?.(evidence.memoryId!)}
              style={{
                background: 'transparent',
                border: 'none',
                padding: 0,
                color: '#38bdf8',
                fontWeight: 700,
                cursor: onInspectMemory ? 'pointer' : 'default',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                textAlign: 'left',
              }}
            >
              <History size={10} />
              {evidence.memoryId}
              {evidence.age && <span style={{ color: '#4a5c72', fontWeight: 400 }}>({evidence.age})</span>}
            </button>
          </div>
        )}

        {evidence.genomeId && (
          <div>
            <span style={{ color: '#4a5c72', display: 'block', fontSize: '8px' }}>RESILIENCE GENOME</span>
            <button
              onClick={() => onInspectGenome?.(evidence.genomeId!)}
              style={{
                background: 'transparent',
                border: 'none',
                padding: 0,
                color: '#a78bfa',
                fontWeight: 700,
                cursor: onInspectGenome ? 'pointer' : 'default',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                textAlign: 'left',
              }}
            >
              <GitBranch size={10} />
              {evidence.genomeId}
            </button>
          </div>
        )}

        {evidence.challengePassRate !== undefined && (
          <div>
            <span style={{ color: '#4a5c72', display: 'block', fontSize: '8px' }}>CHALLENGE VALIDATION</span>
            <span
              style={{
                color: evidence.challengePassRate >= 0.8 ? '#34c77b' : '#f5a623',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
              }}
            >
              <Crosshair size={10} />
              {(evidence.challengePassRate * 100).toFixed(0)}% PASSED
            </span>
          </div>
        )}
      </div>

      {evidence.boundaryRule && (
        <div
          style={{
            marginTop: '8px',
            padding: '5px 8px',
            borderRadius: '5px',
            background: evidence.isBoundaryBreached ? 'rgba(232, 80, 58, 0.12)' : 'rgba(56, 189, 248, 0.08)',
            border: `1px solid ${evidence.isBoundaryBreached ? 'rgba(232, 80, 58, 0.35)' : 'rgba(56, 189, 248, 0.2)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '9px',
          }}
        >
          {evidence.isBoundaryBreached ? (
            <AlertTriangle size={11} color="#f87171" />
          ) : (
            <Shield size={11} color="#38bdf8" />
          )}
          <span style={{ color: evidence.isBoundaryBreached ? '#f87171' : '#8ab4d4' }}>
            <strong>Boundary:</strong> {evidence.boundaryRule}
          </span>
        </div>
      )}

      {evidence.contradictionsCount !== undefined && evidence.contradictionsCount > 0 && (
        <div
          style={{
            marginTop: '6px',
            fontSize: '9px',
            color: '#fb923c',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <AlertTriangle size={10} />
          <span>{evidence.contradictionsCount} contradictory episodes in memory</span>
        </div>
      )}
    </div>
  );
};
