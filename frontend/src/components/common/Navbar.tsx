import React from 'react';
import { Activity, ShieldAlert, RefreshCw, Cpu, Layers, Box } from 'lucide-react';

interface NavbarProps {
  viewMode: '2D' | '3D';
  setViewMode: (mode: '2D' | '3D') => void;
  activePreset: string;
  activeSeed: number;
  healthScore: number;
  isBackendConnected: boolean;
  onSeedChange: (preset: string, seed: number) => void;
  onReset: () => void;
  onOpenInjector?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  viewMode,
  setViewMode,
  activePreset,
  activeSeed,
  healthScore,
  isBackendConnected,
  onSeedChange,
  onReset,
  onOpenInjector,
}) => {
  const getHealthColor = (score: number) => {
    if (score >= 0.85) return 'var(--color-healthy)';
    if (score >= 0.6) return 'var(--color-warning)';
    return 'var(--color-critical)';
  };

  return (
    <header className="glass-panel" style={{ borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0, padding: '12px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, #5B93F6 0%, #3B82F6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-glow-blue)'
            }}>
              <Cpu size={20} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                FULFILL<span style={{ color: 'var(--text-accent)' }}>-X</span>
                <span className="mono" style={{ fontSize: '10px', background: 'rgba(91, 147, 246, 0.15)', color: 'var(--text-accent)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-accent)' }}>
                  PHASE 03
                </span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                Deterministic Risk Engine & Intelligence Vertical Slice
              </div>
            </div>
          </div>

          <div style={{ height: '24px', width: '1px', background: 'var(--border-default)' }} />

          {/* View Mode Toggle */}
          <div style={{ display: 'flex', background: 'var(--bg-canvas)', padding: '3px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => setViewMode('2D')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '4px',
                border: 'none',
                background: viewMode === '2D' ? 'var(--bg-surface-elevated)' : 'transparent',
                color: viewMode === '2D' ? 'var(--text-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
                transition: 'all 0.2s'
              }}
            >
              <Layers size={14} /> 2D Topology Graph
            </button>
            <button
              onClick={() => setViewMode('3D')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '4px',
                border: 'none',
                background: viewMode === '3D' ? 'var(--bg-surface-elevated)' : 'transparent',
                color: viewMode === '3D' ? 'var(--text-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
                transition: 'all 0.2s'
              }}
            >
              <Box size={14} /> 3D Spatial Scene
            </button>
          </div>
        </div>

        {/* Controls & Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Seed / Preset Controller */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-surface-elevated)', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--border-default)' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500 }}>Preset:</span>
            <select
              value={activePreset}
              onChange={(e) => onSeedChange(e.target.value, activeSeed)}
              style={{
                background: 'var(--bg-canvas)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '4px',
                padding: '3px 8px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              <option value="healthy">Healthy Baseline</option>
              <option value="double_punch">The Double Punch (Disrupted)</option>
            </select>

            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500, marginLeft: '6px' }}>Seed:</span>
            <input
              type="number"
              value={activeSeed}
              onChange={(e) => onSeedChange(activePreset, parseInt(e.target.value) || 42)}
              style={{
                width: '50px',
                background: 'var(--bg-canvas)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '4px',
                padding: '3px 6px',
                fontSize: '12px',
                textAlign: 'center'
              }}
            />

            <button
              onClick={onReset}
              title="Reset World to baseline snapshot"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px'
              }}
            >
              <RefreshCw size={14} />
            </button>
          </div>

          {/* Inject Signal Button */}
          {onOpenInjector && (
            <button
              onClick={onOpenInjector}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '6px',
                background: 'rgba(232, 80, 58, 0.15)',
                border: '1px solid #E8503A',
                color: '#FF453A',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <ShieldAlert size={15} /> Inject Signal
            </button>
          )}

          {/* Health Status Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-surface-elevated)', padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-default)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: isBackendConnected ? 'var(--color-healthy)' : 'var(--color-critical)',
                boxShadow: isBackendConnected ? '0 0 8px var(--color-healthy)' : '0 0 8px var(--color-critical)'
              }} />
              <span className="mono" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {isBackendConnected ? 'WORLD LIVE' : 'BACKEND DISCONNECTED'}
              </span>
            </div>

            <div style={{ height: '14px', width: '1px', background: 'var(--border-default)' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Activity size={14} color={getHealthColor(healthScore)} />
              <span className="mono" style={{ fontSize: '12px', fontWeight: 700, color: getHealthColor(healthScore) }}>
                {(healthScore * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
