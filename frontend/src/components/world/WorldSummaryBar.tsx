import React from 'react';
import { WorldSummary } from '../../types/world';
import { Factory, Anchor, Warehouse, Building2, Users, Package, Activity, AlertTriangle } from 'lucide-react';

interface WorldSummaryBarProps {
  summary: WorldSummary | null;
}

export const WorldSummaryBar: React.FC<WorldSummaryBarProps> = ({ summary }) => {
  if (!summary) return null;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: '12px',
      padding: '12px 24px',
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-default)',
    }}>
      {/* Metric 1: Total Nodes */}
      <div className="glass-panel" style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ padding: '8px', borderRadius: '6px', background: 'rgba(91, 147, 246, 0.1)', color: 'var(--text-accent)' }}>
          <Factory size={18} />
        </div>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Suppliers</div>
          <div className="mono" style={{ fontSize: '16px', fontWeight: 700 }}>{summary.suppliers_count}</div>
        </div>
      </div>

      {/* Metric 2: Ports */}
      <div className="glass-panel" style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ padding: '8px', borderRadius: '6px', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--color-port)' }}>
          <Anchor size={18} />
        </div>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Ports</div>
          <div className="mono" style={{ fontSize: '16px', fontWeight: 700 }}>{summary.ports_count}</div>
        </div>
      </div>

      {/* Metric 3: Warehouses */}
      <div className="glass-panel" style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ padding: '8px', borderRadius: '6px', background: 'rgba(6, 182, 212, 0.1)', color: 'var(--color-warehouse)' }}>
          <Warehouse size={18} />
        </div>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Warehouses</div>
          <div className="mono" style={{ fontSize: '16px', fontWeight: 700 }}>{summary.warehouses_count}</div>
        </div>
      </div>

      {/* Metric 4: Fulfillment Centers */}
      <div className="glass-panel" style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ padding: '8px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-fc)' }}>
          <Building2 size={18} />
        </div>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>FCs</div>
          <div className="mono" style={{ fontSize: '16px', fontWeight: 700 }}>{summary.fulfillment_centers_count}</div>
        </div>
      </div>

      {/* Metric 5: Customer Zones */}
      <div className="glass-panel" style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ padding: '8px', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--color-cz)' }}>
          <Users size={18} />
        </div>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Customer Zones</div>
          <div className="mono" style={{ fontSize: '16px', fontWeight: 700 }}>{summary.customer_zones_count}</div>
        </div>
      </div>

      {/* Metric 6: Total Inventory */}
      <div className="glass-panel" style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ padding: '8px', borderRadius: '6px', background: 'rgba(52, 199, 123, 0.1)', color: 'var(--color-healthy)' }}>
          <Package size={18} />
        </div>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Total Inventory</div>
          <div className="mono" style={{ fontSize: '16px', fontWeight: 700 }}>{(summary.total_inventory_units / 1000).toFixed(1)}k units</div>
        </div>
      </div>

      {/* Metric 7: Disruptions / Health */}
      <div className="glass-panel" style={{
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        borderColor: summary.disrupted_nodes_count > 0 ? 'var(--color-disrupted)' : 'var(--border-default)',
        background: summary.disrupted_nodes_count > 0 ? 'rgba(255, 59, 48, 0.08)' : 'var(--bg-surface)'
      }}>
        <div style={{ padding: '8px', borderRadius: '6px', background: summary.disrupted_nodes_count > 0 ? 'rgba(255, 59, 48, 0.2)' : 'rgba(52, 199, 123, 0.1)', color: summary.disrupted_nodes_count > 0 ? 'var(--color-disrupted)' : 'var(--color-healthy)' }}>
          {summary.disrupted_nodes_count > 0 ? <AlertTriangle size={18} /> : <Activity size={18} />}
        </div>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Disruptions</div>
          <div className="mono" style={{ fontSize: '16px', fontWeight: 700, color: summary.disrupted_nodes_count > 0 ? 'var(--color-disrupted)' : 'var(--color-healthy)' }}>
            {summary.disrupted_nodes_count} Nodes / {summary.disrupted_edges_count} Edges
          </div>
        </div>
      </div>
    </div>
  );
};
