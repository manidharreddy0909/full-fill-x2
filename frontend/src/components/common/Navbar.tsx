import React from 'react';
import { Activity, ShieldAlert, RefreshCw, Cpu, Layers, Box, Bot, Sparkles, LayoutDashboard, Database } from 'lucide-react';

export type ProductTab = 'COMMAND' | 'WORLD' | 'INTELLIGENCE' | 'RESPONSE' | 'DECISION' | 'EVALUATION' | 'DEMO';

interface NavbarProps {
  activeTab: ProductTab;
  setActiveTab: (tab: ProductTab) => void;
  viewMode: '2D' | '3D';
  setViewMode: (mode: '2D' | '3D') => void;
  activePreset: string;
  activeSeed: number;
  healthScore: number;
  isBackendConnected: boolean;
  activeAiProvider?: string;
  onSeedChange: (preset: string, seed: number) => void;
  onReset: () => void;
  onOpenInjector?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  viewMode,
  setViewMode,
  activePreset,
  activeSeed,
  healthScore,
  isBackendConnected,
  activeAiProvider,
  onSeedChange,
  onReset,
  onOpenInjector,
}) => {
  const getHealthColor = (score: number) => {
    if (score >= 0.85) return 'var(--color-healthy)';
    if (score >= 0.6) return 'var(--color-warning)';
    return 'var(--color-critical)';
  };

  const navItems: { tab: ProductTab; label: string; icon: React.ReactNode }[] = [
    { tab: 'COMMAND', label: 'Command', icon: <LayoutDashboard size={14} /> },
    { tab: 'WORLD', label: 'Digital Twin', icon: <Box size={14} /> },
    { tab: 'INTELLIGENCE', label: 'Intelligence', icon: <ShieldAlert size={14} /> },
    { tab: 'RESPONSE', label: 'War Room', icon: <Bot size={14} /> },
    { tab: 'DECISION', label: 'Cockpit', icon: <Cpu size={14} /> },
    { tab: 'EVALUATION', label: 'Evaluation', icon: <Activity size={14} /> },
    { tab: 'DEMO', label: 'Demo Mode', icon: <Sparkles size={14} /> },
  ];

  return (
    <header className="glass-panel" style={{ borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0, padding: '10px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        {/* Brand & Version */}
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
              <div style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                FULFILL<span style={{ color: 'var(--text-accent)' }}>-X</span>
                <span className="mono" style={{ fontSize: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#34D399', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
                  v1.0.0
                </span>
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                Fulfillment Resilience Intelligence Platform
              </div>
            </div>
          </div>

          <div style={{ height: '24px', width: '1px', background: 'var(--border-default)' }} />

          {/* Product Navigation Tabs */}
          <nav style={{ display: 'flex', background: 'var(--bg-canvas)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-subtle)', gap: '2px' }}>
            {navItems.map(({ tab, label, icon }) => {
              const isActive = activeTab === tab;
              const isDemo = tab === 'DEMO';
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    background: isActive
                      ? isDemo
                        ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.4) 0%, rgba(217, 119, 6, 0.4) 100%)'
                        : 'var(--bg-surface-elevated)'
                      : 'transparent',
                    color: isActive ? (isDemo ? '#FBBF24' : 'var(--text-primary)') : 'var(--text-secondary)',
                    fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer',
                    fontSize: '12px',
                    transition: 'all 0.2s',
                    boxShadow: isActive && isDemo ? '0 0 10px rgba(245, 158, 11, 0.3)' : 'none',
                  }}
                >
                  {icon}
                  <span>{label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Status Indicators & Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Preset & Seed */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-surface-elevated)', padding: '3px 8px', borderRadius: '6px', border: '1px solid var(--border-default)' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 500 }}>Preset:</span>
            <select
              value={activePreset}
              onChange={(e) => onSeedChange(e.target.value, activeSeed)}
              style={{
                background: 'var(--bg-canvas)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '4px',
                padding: '2px 6px',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              <option value="healthy">Healthy Baseline</option>
              <option value="double_punch">Double Punch</option>
            </select>

            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 500, marginLeft: '4px' }}>Seed:</span>
            <input
              type="number"
              value={activeSeed}
              onChange={(e) => onSeedChange(activePreset, parseInt(e.target.value) || 42)}
              style={{
                width: '44px',
                background: 'var(--bg-canvas)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '4px',
                padding: '2px 4px',
                fontSize: '11px',
                textAlign: 'center'
              }}
            />

            <button
              onClick={onReset}
              title="Reset World to baseline"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '2px'
              }}
            >
              <RefreshCw size={13} />
            </button>
          </div>

          {/* Signal Injector Button */}
          {onOpenInjector && (
            <button
              onClick={onOpenInjector}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 12px',
                borderRadius: '6px',
                background: 'rgba(232, 80, 58, 0.15)',
                border: '1px solid #E8503A',
                color: '#FF453A',
                fontWeight: 700,
                fontSize: '11px',
                cursor: 'pointer',
              }}
            >
              <ShieldAlert size={14} /> Inject Signal
            </button>
          )}

          {/* AI Provider Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(139, 92, 246, 0.12)', padding: '5px 10px', borderRadius: '6px', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
            <Bot size={14} color="#A78BFA" />
            <span className="mono" style={{ fontSize: '10px', fontWeight: 600, color: '#A78BFA' }}>
              AI: {(activeAiProvider || 'mock').toUpperCase()}
            </span>
          </div>

          {/* Network Health Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-surface-elevated)', padding: '5px 10px', borderRadius: '6px', border: '1px solid var(--border-default)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: isBackendConnected ? 'var(--color-healthy)' : 'var(--color-critical)',
                boxShadow: isBackendConnected ? '0 0 6px var(--color-healthy)' : '0 0 6px var(--color-critical)'
              }} />
              <span className="mono" style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {isBackendConnected ? 'LIVE' : 'DISCONNECTED'}
              </span>
            </div>

            <div style={{ height: '12px', width: '1px', background: 'var(--border-default)' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Activity size={13} color={getHealthColor(healthScore)} />
              <span className="mono" style={{ fontSize: '11px', fontWeight: 700, color: getHealthColor(healthScore) }}>
                {(healthScore * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
