import React from 'react';
import { NodeRiskDetail, RiskLevel } from '../../types/risk';
import { X, ShieldAlert, Activity, ArrowRight, Layers, AlertTriangle, CheckCircle, Flame } from 'lucide-react';

interface RiskExplorerProps {
  riskDetail: NodeRiskDetail | null;
  onClose: () => void;
  onSelectNode: (nodeId: string) => void;
  onOpenInjector: (nodeId: string) => void;
}

export const RiskExplorer: React.FC<RiskExplorerProps> = ({
  riskDetail,
  onClose,
  onSelectNode,
  onOpenInjector,
}) => {
  if (!riskDetail) return null;

  const getRiskLevelBadge = (level: RiskLevel) => {
    switch (level) {
      case 'CRITICAL':
        return { bg: 'rgba(255,59,48,0.2)', color: '#FF453A', border: '#FF3B30', label: 'CRITICAL RISK' };
      case 'HIGH':
        return { bg: 'rgba(232,80,58,0.18)', color: '#E8503A', border: '#E8503A', label: 'HIGH RISK' };
      case 'MEDIUM':
        return { bg: 'rgba(245,166,35,0.18)', color: '#F5A623', border: '#F5A623', label: 'MEDIUM RISK' };
      default:
        return { bg: 'rgba(52,199,123,0.18)', color: '#34D399', border: '#34D399', label: 'LOW RISK' };
    }
  };

  const badge = getRiskLevelBadge(riskDetail.risk_level);
  const expl = riskDetail.explanation;

  return (
    <div
      className="glass-panel"
      style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        width: '420px',
        maxHeight: 'calc(100% - 40px)',
        overflowY: 'auto',
        zIndex: 110,
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        borderRadius: '10px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
        animation: 'slide-in 0.25s ease-out',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '4px',
                background: badge.bg,
                color: badge.color,
                border: `1px solid ${badge.border}`,
              }}
            >
              {badge.label}
            </span>
            <span className="mono" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              {riskDetail.node_id}
            </span>
          </div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {riskDetail.node_name}
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '4px',
          }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Composite Score Banner */}
      <div
        style={{
          background: 'var(--bg-canvas)',
          padding: '16px',
          borderRadius: '8px',
          border: `1px solid ${badge.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Activity size={14} /> Composite Risk Index
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
            Primary Driver: <strong style={{ color: badge.color }}>{expl?.primary_driver || 'BASELINE'}</strong>
          </div>
        </div>

        <div className="mono" style={{ fontSize: '24px', fontWeight: 800, color: badge.color }}>
          {(riskDetail.risk_scores.composite * 100).toFixed(0)}
          <span style={{ fontSize: '13px', color: 'var(--text-tertiary)', fontWeight: 400 }}> / 100</span>
        </div>
      </div>

      {/* Dimensional Risk Matrix */}
      <div style={{ background: 'var(--bg-canvas)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '10px', textTransform: 'uppercase' }}>
          Dimensional Exposure Breakdown
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div style={{ background: 'var(--bg-surface)', padding: '8px 10px', borderRadius: '4px' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Financial Risk</div>
            <div className="mono" style={{ fontSize: '13px', fontWeight: 700, color: badge.color }}>
              {(riskDetail.risk_scores.financial * 100).toFixed(0)}%
            </div>
          </div>
          <div style={{ background: 'var(--bg-surface)', padding: '8px 10px', borderRadius: '4px' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>SLA Breach Risk</div>
            <div className="mono" style={{ fontSize: '13px', fontWeight: 700, color: badge.color }}>
              {(riskDetail.risk_scores.sla * 100).toFixed(0)}%
            </div>
          </div>
          <div style={{ background: 'var(--bg-surface)', padding: '8px 10px', borderRadius: '4px' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Operational Risk</div>
            <div className="mono" style={{ fontSize: '13px', fontWeight: 700, color: badge.color }}>
              {(riskDetail.risk_scores.operational * 100).toFixed(0)}%
            </div>
          </div>
          <div style={{ background: 'var(--bg-surface)', padding: '8px 10px', borderRadius: '4px' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Sustainability Risk</div>
            <div className="mono" style={{ fontSize: '13px', fontWeight: 700, color: badge.color }}>
              {(riskDetail.risk_scores.sustainability * 100).toFixed(0)}%
            </div>
          </div>
        </div>
      </div>

      {/* Deterministic Explanation Narrative */}
      {expl && (
        <div style={{ background: 'var(--bg-canvas)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldAlert size={14} color="var(--text-accent)" /> Traceable Evidence Explanation
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-primary)', lineHeight: '1.5', margin: 0 }}>
            {expl.explanation_text}
          </p>
        </div>
      )}

      {/* Contributing Fused Signals */}
      <div>
        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>Contributing Signals ({riskDetail.fused_signals.length})</span>
          <button
            onClick={() => onOpenInjector(riskDetail.node_id)}
            style={{
              padding: '2px 8px',
              fontSize: '10px',
              background: 'rgba(91,147,246,0.15)',
              border: '1px solid var(--text-accent)',
              borderRadius: '4px',
              color: 'var(--text-accent)',
              cursor: 'pointer',
            }}
          >
            + Add Signal
          </button>
        </div>

        {riskDetail.fused_signals.length === 0 ? (
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontStyle: 'italic', padding: '8px', textAlign: 'center' }}>
            No active disruption signals directly target or propagate to this node.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '140px', overflowY: 'auto' }}>
            {riskDetail.fused_signals.map((sig) => (
              <div
                key={sig.fused_id}
                style={{
                  background: 'var(--bg-canvas)',
                  padding: '8px 10px',
                  borderRadius: '4px',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {sig.type} ({sig.severity})
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                    Fused from {sig.contributing_signal_ids.length} signal(s)
                  </div>
                </div>
                <div className="mono" style={{ fontSize: '11px', color: 'var(--text-accent)', fontWeight: 600 }}>
                  Confidence {(sig.confidence * 100).toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upstream & Downstream Propagation Exposure */}
      {expl && (expl.affected_upstream_nodes.length > 0 || expl.affected_downstream_nodes.length > 0) && (
        <div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
            Network Propagation Impact
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {expl.affected_upstream_nodes.length > 0 && (
              <div style={{ background: 'var(--bg-canvas)', padding: '8px 10px', borderRadius: '4px' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Upstream Vulnerabilities ({expl.affected_upstream_nodes.length})
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {expl.affected_upstream_nodes.map((nid) => (
                    <span
                      key={nid}
                      onClick={() => onSelectNode(nid)}
                      className="mono"
                      style={{
                        fontSize: '10px',
                        background: 'rgba(232,80,58,0.15)',
                        border: '1px solid #E8503A',
                        color: '#E8503A',
                        padding: '1px 6px',
                        borderRadius: '3px',
                        cursor: 'pointer',
                      }}
                    >
                      {nid}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {expl.affected_downstream_nodes.length > 0 && (
              <div style={{ background: 'var(--bg-canvas)', padding: '8px 10px', borderRadius: '4px' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Downstream At-Risk Exposure ({expl.affected_downstream_nodes.length})
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {expl.affected_downstream_nodes.map((nid) => (
                    <span
                      key={nid}
                      onClick={() => onSelectNode(nid)}
                      className="mono"
                      style={{
                        fontSize: '10px',
                        background: 'rgba(245,166,35,0.15)',
                        border: '1px solid #F5A623',
                        color: '#F5A623',
                        padding: '1px 6px',
                        borderRadius: '3px',
                        cursor: 'pointer',
                      }}
                    >
                      {nid}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
