import React, { useState } from 'react';
import { X, Zap, AlertTriangle, Radio, ShieldAlert } from 'lucide-react';
import { SignalType, SignalSeverity, SignalCreateRequest } from '../../types/risk';
import { WorldNode } from '../../types/world';

interface SignalInjectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: WorldNode[];
  initialTargetNodeId?: string | null;
  onInject: (req: SignalCreateRequest) => Promise<void>;
}

export const SignalInjectorModal: React.FC<SignalInjectorModalProps> = ({
  isOpen,
  onClose,
  nodes,
  initialTargetNodeId,
  onInject,
}) => {
  const [signalType, setSignalType] = useState<SignalType>('SUPPLIER_HEALTH');
  const [severity, setSeverity] = useState<SignalSeverity>('HIGH');
  const [title, setTitle] = useState<string>('Tier-1 Supplier Production Interruption');
  const [description, setDescription] = useState<string>(
    'Factory explosion reported at semiconductor fabrication plant. Component lead times extended by 30 days.'
  );
  const [confidence, setConfidence] = useState<number>(0.9);
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>(
    initialTargetNodeId ? [initialTargetNodeId] : ['sup-001']
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleApplyPreset = (
    type: SignalType,
    sev: SignalSeverity,
    t: string,
    d: string,
    nodeId: string,
    conf: number
  ) => {
    setSignalType(type);
    setSeverity(sev);
    setTitle(t);
    setDescription(d);
    setSelectedNodeIds([nodeId]);
    setConfidence(conf);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onInject({
        type: signalType,
        severity,
        title,
        description,
        confidence,
        affected_node_ids: selectedNodeIds,
        source: 'InteractiveSignalProvider',
      });
      onClose();
    } catch (err) {
      console.error('Failed to inject signal:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleNodeSelection = (nodeId: string) => {
    if (selectedNodeIds.includes(nodeId)) {
      setSelectedNodeIds(selectedNodeIds.filter((id) => id !== nodeId));
    } else {
      setSelectedNodeIds([...selectedNodeIds, nodeId]);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '560px',
          maxWidth: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid var(--border-default)',
          background: 'var(--bg-surface)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(232, 80, 58, 0.15)', color: 'var(--color-critical)' }}>
              <Zap size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Inject Disruption Signal
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                Introduce weak signals to test network risk calculation & BFS propagation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Quick Demo Presets */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '8px' }}>
            Quick Demo Presets
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            <button
              type="button"
              onClick={() =>
                handleApplyPreset(
                  'SUPPLIER_HEALTH',
                  'CRITICAL',
                  'Supplier S1 Fire Outage',
                  'Major facility damage causing complete halt of semiconductor line.',
                  'sup-001',
                  0.95
                )
              }
              style={{
                padding: '8px 10px',
                background: 'rgba(255,59,48,0.1)',
                border: '1px solid rgba(255,59,48,0.3)',
                borderRadius: '6px',
                color: '#FF453A',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              🔥 Supplier S1 Halt
            </button>

            <button
              type="button"
              onClick={() =>
                handleApplyPreset(
                  'WEATHER',
                  'HIGH',
                  'Port P1 Typhoon Disruption',
                  'Category 4 Typhoon causing 5-day vessel congestion at main port terminal.',
                  'port-001',
                  0.90
                )
              }
              style={{
                padding: '8px 10px',
                background: 'rgba(245,166,35,0.1)',
                border: '1px solid rgba(245,166,35,0.3)',
                borderRadius: '6px',
                color: '#F5A623',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              🌊 Port P1 Typhoon
            </button>

            <button
              type="button"
              onClick={() =>
                handleApplyPreset(
                  'CYBER',
                  'HIGH',
                  'Warehouse W1 Ransomware',
                  'WMS software locked out. Manual picking reducing capacity by 75%.',
                  'wh-001',
                  0.85
                )
              }
              style={{
                padding: '8px 10px',
                background: 'rgba(139,92,246,0.1)',
                border: '1px solid rgba(139,92,246,0.3)',
                borderRadius: '6px',
                color: '#A78BFA',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              💻 Warehouse W1 Cyber
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Signal Type & Severity */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Signal Type
              </label>
              <select
                value={signalType}
                onChange={(e) => setSignalType(e.target.value as SignalType)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  background: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                }}
              >
                <option value="SUPPLIER_HEALTH">SUPPLIER_HEALTH</option>
                <option value="WEATHER">WEATHER</option>
                <option value="GEOPOLITICAL">GEOPOLITICAL</option>
                <option value="LOGISTICS">LOGISTICS</option>
                <option value="CYBER">CYBER</option>
                <option value="DEMAND_SHIFT">DEMAND_SHIFT</option>
                <option value="REGULATORY">REGULATORY</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Severity
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as SignalSeverity)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  background: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                }}
              >
                <option value="LOW">LOW (0.25)</option>
                <option value="MEDIUM">MEDIUM (0.50)</option>
                <option value="HIGH">HIGH (0.75)</option>
                <option value="CRITICAL">CRITICAL (0.95)</option>
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
              Signal Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                background: 'var(--bg-canvas)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: '13px',
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
              Description & Evidence
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                background: 'var(--bg-canvas)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: '13px',
                resize: 'none',
              }}
            />
          </div>

          {/* Confidence Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Confidence Rating: {(confidence * 100).toFixed(0)}%
              </label>
              <span className="mono" style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                Weighting: {confidence.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={confidence}
              onChange={(e) => setConfidence(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--text-accent)' }}
            />
          </div>

          {/* Target Nodes Selector */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Target Affected Nodes ({selectedNodeIds.length} selected)
            </label>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px',
                maxHeight: '120px',
                overflowY: 'auto',
                background: 'var(--bg-canvas)',
                padding: '8px',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
              }}
            >
              {nodes.map((n) => {
                const isSelected = selectedNodeIds.includes(n.id);
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => toggleNodeSelection(n.id)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                      cursor: 'pointer',
                      border: isSelected ? '1px solid var(--text-accent)' : '1px solid var(--border-subtle)',
                      background: isSelected ? 'rgba(91, 147, 246, 0.25)' : 'rgba(255,255,255,0.03)',
                      color: isSelected ? '#93C5FD' : 'var(--text-secondary)',
                    }}
                  >
                    {n.id} ({n.type})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                background: 'transparent',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || selectedNodeIds.length === 0}
              className="pulse-green"
              style={{
                padding: '8px 20px',
                borderRadius: '6px',
                background: 'var(--color-critical)',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                opacity: isSubmitting || selectedNodeIds.length === 0 ? 0.5 : 1,
              }}
            >
              <ShieldAlert size={16} />
              {isSubmitting ? 'Injecting Signal...' : 'Inject & Recalculate Risk'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
