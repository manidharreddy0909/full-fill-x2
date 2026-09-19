import React from 'react';
import { WorldNode, WorldEdge } from '../../types/world';
import { X, AlertTriangle, ShieldCheck, Activity, MapPin, Gauge, Box, ArrowRight } from 'lucide-react';

interface NodeInspectorProps {
  node: WorldNode | null;
  edges: WorldEdge[];
  onClose: () => void;
  onSelectNode: (nodeId: string) => void;
}

export const NodeInspector: React.FC<NodeInspectorProps> = ({
  node,
  edges,
  onClose,
  onSelectNode,
}) => {
  if (!node) return null;

  const connectedEdges = edges.filter(
    (e) => e.source_node_id === node.id || e.target_node_id === node.id
  );

  const getRiskColor = (val: number) => {
    if (val < 0.25) return 'var(--color-healthy)';
    if (val < 0.6) return 'var(--color-warning)';
    return 'var(--color-critical)';
  };

  const getTypeBadgeStyle = (type: string) => {
    switch (type) {
      case 'SUPPLIER': return { bg: 'rgba(59, 130, 246, 0.15)', color: 'var(--color-supplier)', label: 'SUPPLIER' };
      case 'PORT': return { bg: 'rgba(139, 92, 246, 0.15)', color: 'var(--color-port)', label: 'PORT' };
      case 'WAREHOUSE': return { bg: 'rgba(6, 182, 212, 0.15)', color: 'var(--color-warehouse)', label: 'WAREHOUSE' };
      case 'FULFILLMENT_CENTER': return { bg: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-fc)', label: 'FULFILLMENT CENTER' };
      case 'CUSTOMER_ZONE': return { bg: 'rgba(245, 158, 11, 0.15)', color: 'var(--color-cz)', label: 'CUSTOMER ZONE' };
      default: return { bg: 'rgba(255,255,255,0.1)', color: '#FFFFFF', label: type };
    }
  };

  const typeBadge = getTypeBadgeStyle(node.type);

  return (
    <div className="glass-panel" style={{
      position: 'absolute',
      top: '20px',
      right: '20px',
      width: '380px',
      maxHeight: 'calc(100% - 40px)',
      overflowY: 'auto',
      zIndex: 100,
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      animation: 'slide-in 0.25s ease-out'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{
              fontSize: '10px',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '4px',
              background: typeBadge.bg,
              color: typeBadge.color,
              border: `1px solid ${typeBadge.color}`
            }}>
              {typeBadge.label}
            </span>
            <span className="mono" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{node.id}</span>
          </div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>{node.name}</div>
        </div>

        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '4px'
          }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Disruption Alert Status Banner */}
      {node.is_disrupted ? (
        <div style={{
          background: 'rgba(255, 59, 48, 0.15)',
          border: '1px solid var(--color-disrupted)',
          borderRadius: '6px',
          padding: '10px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <AlertTriangle size={20} color="var(--color-disrupted)" />
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-disrupted)' }}>ACTIVE DISRUPTION</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Sources: {node.disruption_source_ids.join(', ') || 'Direct Disruption'}
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          background: 'rgba(52, 199, 123, 0.1)',
          border: '1px solid var(--color-healthy)',
          borderRadius: '6px',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <ShieldCheck size={16} color="var(--color-healthy)" />
          <span style={{ fontSize: '12px', color: 'var(--color-healthy)', fontWeight: 600 }}>Operational — Normal Baseline</span>
        </div>
      )}

      {/* Multi-Dimensional Risk Scores Card */}
      <div style={{ background: 'var(--bg-canvas)', padding: '14px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Activity size={14} /> Composite Risk Index
          </div>
          <div className="mono" style={{ fontSize: '16px', fontWeight: 700, color: getRiskColor(node.risk_scores.composite) }}>
            {(node.risk_scores.composite * 100).toFixed(0)} / 100
          </div>
        </div>

        {/* Risk Breakdown Matrix */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
          <div style={{ background: 'var(--bg-surface)', padding: '8px', borderRadius: '4px' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Financial Risk</div>
            <div className="mono" style={{ fontSize: '12px', fontWeight: 600, color: getRiskColor(node.risk_scores.financial) }}>
              {(node.risk_scores.financial * 100).toFixed(0)}%
            </div>
          </div>
          <div style={{ background: 'var(--bg-surface)', padding: '8px', borderRadius: '4px' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>SLA Breach Risk</div>
            <div className="mono" style={{ fontSize: '12px', fontWeight: 600, color: getRiskColor(node.risk_scores.sla) }}>
              {(node.risk_scores.sla * 100).toFixed(0)}%
            </div>
          </div>
          <div style={{ background: 'var(--bg-surface)', padding: '8px', borderRadius: '4px' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Operational Risk</div>
            <div className="mono" style={{ fontSize: '12px', fontWeight: 600, color: getRiskColor(node.risk_scores.operational) }}>
              {(node.risk_scores.operational * 100).toFixed(0)}%
            </div>
          </div>
          <div style={{ background: 'var(--bg-surface)', padding: '8px', borderRadius: '4px' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Sustainability Risk</div>
            <div className="mono" style={{ fontSize: '12px', fontWeight: 600, color: getRiskColor(node.risk_scores.sustainability) }}>
              {(node.risk_scores.sustainability * 100).toFixed(0)}%
            </div>
          </div>
        </div>
      </div>

      {/* Operational Capacity & Metrics */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Operational Attributes</div>

        <div style={{ background: 'var(--bg-canvas)', padding: '10px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Gauge size={14} /> Inventory Stock Ratio
          </span>
          <span className="mono" style={{ fontSize: '13px', fontWeight: 600 }}>
            {(node.inventory_level * 100).toFixed(0)}%
          </span>
        </div>

        <div style={{ background: 'var(--bg-canvas)', padding: '10px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Box size={14} /> Throughput Capacity
          </span>
          <span className="mono" style={{ fontSize: '13px', fontWeight: 600 }}>
            {node.capacity.toLocaleString()} units/day
          </span>
        </div>

        {node.region && (
          <div style={{ background: 'var(--bg-canvas)', padding: '10px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={14} /> Region / Locale
            </span>
            <span className="mono" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-accent)' }}>
              {node.region}
            </span>
          </div>
        )}
      </div>

      {/* Connected Network Routes */}
      <div>
        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
          Connected Routes ({connectedEdges.length})
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '160px', overflowY: 'auto' }}>
          {connectedEdges.map((edge) => {
            const isOutgoing = edge.source_node_id === node.id;
            const otherNodeId = isOutgoing ? edge.target_node_id : edge.source_node_id;

            return (
              <div
                key={edge.id}
                onClick={() => onSelectNode(otherNodeId)}
                style={{
                  background: 'var(--bg-canvas)',
                  padding: '8px 10px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  border: edge.is_disrupted ? '1px solid var(--color-disrupted)' : '1px solid var(--border-subtle)',
                  transition: 'background 0.15s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '10px', padding: '2px 4px', borderRadius: '2px', background: isOutgoing ? 'rgba(59,130,246,0.2)' : 'rgba(16,185,129,0.2)', color: isOutgoing ? '#60A5FA' : '#34D399' }}>
                    {isOutgoing ? 'OUT' : 'IN'}
                  </span>
                  <span className="mono" style={{ fontSize: '12px', fontWeight: 600 }}>{otherNodeId}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="mono" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {edge.transport_mode || 'ROUTE'} ({(edge.load * 100).toFixed(0)}% load)
                  </span>
                  <ArrowRight size={14} color="var(--text-tertiary)" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
