import React, { useMemo } from 'react';
import { WorldNode, WorldEdge, NodeType } from '../../types/world';
import { Factory, Anchor, Warehouse, Building2, Users, AlertTriangle } from 'lucide-react';

interface World2DViewProps {
  nodes: WorldNode[];
  edges: WorldEdge[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
}

interface TierColumn {
  title: string;
  type: NodeType;
  icon: React.ReactNode;
  nodes: WorldNode[];
}

export const World2DView: React.FC<World2DViewProps> = ({
  nodes,
  edges,
  selectedNodeId,
  onSelectNode,
}) => {
  // Organize nodes into 5 structural supply chain tiers
  const tiers: TierColumn[] = useMemo(() => {
    return [
      {
        title: 'Suppliers',
        type: 'SUPPLIER',
        icon: <Factory size={16} color="var(--color-supplier)" />,
        nodes: nodes.filter((n) => n.type === 'SUPPLIER'),
      },
      {
        title: 'Ports',
        type: 'PORT',
        icon: <Anchor size={16} color="var(--color-port)" />,
        nodes: nodes.filter((n) => n.type === 'PORT'),
      },
      {
        title: 'Warehouses',
        type: 'WAREHOUSE',
        icon: <Warehouse size={16} color="var(--color-warehouse)" />,
        nodes: nodes.filter((n) => n.type === 'WAREHOUSE'),
      },
      {
        title: 'Fulfillment Centers',
        type: 'FULFILLMENT_CENTER',
        icon: <Building2 size={16} color="var(--color-fc)" />,
        nodes: nodes.filter((n) => n.type === 'FULFILLMENT_CENTER'),
      },
      {
        title: 'Customer Zones',
        type: 'CUSTOMER_ZONE',
        icon: <Users size={16} color="var(--color-cz)" />,
        nodes: nodes.filter((n) => n.type === 'CUSTOMER_ZONE'),
      },
    ];
  }, [nodes]);

  const getNodeBorderColor = (node: WorldNode) => {
    if (node.id === selectedNodeId) return 'var(--text-accent)';
    if (node.is_disrupted) return 'var(--color-disrupted)';
    if (node.risk_scores.composite >= 0.6) return 'var(--color-critical)';
    if (node.risk_scores.composite >= 0.25) return 'var(--color-warning)';
    return 'var(--border-default)';
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      overflowX: 'auto',
      overflowY: 'auto',
      background: 'radial-gradient(circle at 50% 50%, #0F1A2A 0%, #080D14 100%)',
      padding: '24px'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, minmax(220px, 1fr))',
        gap: '24px',
        minWidth: '1100px',
        height: '100%',
      }}>
        {tiers.map((tier) => (
          <div
            key={tier.type}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              background: 'rgba(13, 21, 32, 0.4)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '16px 12px'
            }}
          >
            {/* Tier Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: '10px',
              marginBottom: '6px'
            }}>
              {tier.icon}
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{tier.title}</span>
              <span className="mono" style={{ fontSize: '11px', color: 'var(--text-secondary)', marginLeft: 'auto' }}>
                ({tier.nodes.length})
              </span>
            </div>

            {/* Nodes Stack */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, overflowY: 'auto' }}>
              {tier.nodes.map((node) => {
                const isSelected = node.id === selectedNodeId;
                const borderColor = getNodeBorderColor(node);

                return (
                  <div
                    key={node.id}
                    onClick={() => onSelectNode(node.id)}
                    className={`glass-panel ${node.is_disrupted ? 'pulse-red' : isSelected ? 'pulse-green' : ''}`}
                    style={{
                      padding: '12px',
                      borderRadius: '6px',
                      border: `1px solid ${borderColor}`,
                      background: isSelected ? 'rgba(91, 147, 246, 0.12)' : 'var(--bg-surface)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}
                  >
                    {/* Disruption Icon Badge */}
                    {node.is_disrupted && (
                      <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
                        <AlertTriangle size={14} color="var(--color-disrupted)" />
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <span className="mono" style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{node.id}</span>
                      {node.region && (
                        <span className="mono" style={{ fontSize: '9px', background: 'rgba(255,255,255,0.06)', padding: '1px 5px', borderRadius: '3px', color: 'var(--text-tertiary)' }}>
                          {node.region}
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                      {node.name}
                    </div>

                    {/* Operational Mini Bar */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-secondary)' }}>
                        <span>Inventory / Stock</span>
                        <span className="mono">{(node.inventory_level * 100).toFixed(0)}%</span>
                      </div>
                      <div style={{ width: '100%', height: '4px', background: 'var(--bg-canvas)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${Math.min(100, Math.max(5, node.inventory_level * 100))}%`,
                          height: '100%',
                          background: node.inventory_level < 0.3 ? 'var(--color-critical)' : 'var(--color-healthy)'
                        }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
