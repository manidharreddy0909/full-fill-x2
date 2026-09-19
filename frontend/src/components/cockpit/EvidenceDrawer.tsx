import React from 'react';
import { X, ShieldAlert, ArrowRight, FileText, CheckCircle2, Layers, Cpu, ShieldCheck } from 'lucide-react';
import { EvidenceLink } from '../../types/cockpit';

interface EvidenceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  evidence: EvidenceLink | null;
  allEvidence: EvidenceLink[];
}

export const EvidenceDrawer: React.FC<EvidenceDrawerProps> = ({
  isOpen,
  onClose,
  evidence,
  allEvidence,
}) => {
  if (!isOpen || !evidence) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '560px',
          height: '100%',
          borderRadius: 0,
          borderRight: 0,
          borderTop: 0,
          borderBottom: 0,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-8px 0 24px rgba(0, 0, 0, 0.5)',
          animation: 'fadeIn 0.2s ease-out',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-canvas)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={20} color="#5B93F6" />
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Evidence Traceability Chain
              </h3>
              <span className="mono" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                ID: {evidence.evidence_id}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '6px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Main Evidence Card */}
          <div
            style={{
              padding: '16px',
              borderRadius: '8px',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-default)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span
                className="mono"
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: 'rgba(91, 147, 246, 0.15)',
                  color: '#5B93F6',
                  border: '1px solid rgba(91, 147, 246, 0.4)',
                }}
              >
                {evidence.source_stage}
              </span>
              <span className="mono" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                Type: {evidence.entity_type}
              </span>
            </div>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', color: 'var(--text-primary)' }}>
              {evidence.title}
            </h4>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {evidence.description}
            </p>
          </div>

          {/* Provenance Trace Chain */}
          <div>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Provenance Trace
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {evidence.provenance_chain.map((step, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: 'rgba(139, 92, 246, 0.2)',
                      border: '1px solid #8B5CF6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#A78BFA',
                    }}
                  >
                    {idx + 1}
                  </div>
                  <div
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '6px',
                      background: 'var(--bg-canvas)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '12px',
                      color: 'var(--text-primary)',
                      fontFamily: 'monospace',
                    }}
                  >
                    {step}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Structured Parameters */}
          {Object.keys(evidence.metadata).length > 0 && (
            <div>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Structured Metadata Parameters
              </h4>
              <div
                style={{
                  padding: '12px',
                  borderRadius: '6px',
                  background: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '10px',
                }}
              >
                {Object.entries(evidence.metadata).map(([key, value]) => (
                  <div key={key}>
                    <div className="mono" style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                      {key}
                    </div>
                    <div className="mono" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Connected Evidence Links */}
          <div>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Connected Workflow Evidence
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {allEvidence
                .filter((ev) => ev.evidence_id !== evidence.evidence_id)
                .slice(0, 4)
                .map((ev) => (
                  <div
                    key={ev.evidence_id}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '6px',
                      background: 'var(--bg-canvas)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {ev.title}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                        {ev.source_stage} • {ev.entity_type}
                      </div>
                    </div>
                    <span className="mono" style={{ fontSize: '10px', color: '#5B93F6' }}>
                      {ev.entity_id}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
