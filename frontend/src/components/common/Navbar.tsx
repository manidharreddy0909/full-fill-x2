import React from 'react';
import { Activity, ShieldAlert, RefreshCw, Cpu, Layers, Box, Bot, Sparkles, LayoutDashboard, Database, Shield, Lock, Radio, Brain, GitFork } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export type ProductTab = 'COMMAND' | 'WORLD' | 'INTELLIGENCE' | 'RESPONSE' | 'DECISION' | 'EVALUATION' | 'DEMO' | 'DATA' | 'SECURITY' | 'OBSERVABILITY' | 'PREDICTIVE_ML' | 'GRAPH_INTELLIGENCE' | 'SIMULATION' | 'RESILIENCE_AGENTS' | 'RESILIENCE_OS' | 'GOVERNANCE';

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
  onOpenAuthGateway?: () => void;
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
  onOpenAuthGateway,
}) => {
  const { user, userRole, isAuthenticated } = useAuthStore();

  const getHealthColor = (score: number) => {
    if (score >= 0.85) return 'var(--color-healthy)';
    if (score >= 0.6) return 'var(--color-warning)';
    return 'var(--color-critical)';
  };

  const navItems: { tab: ProductTab; label: string; icon: React.ReactNode }[] = [
    { tab: 'COMMAND', label: 'Command Center', icon: <LayoutDashboard size={14} /> },
    { tab: 'INTELLIGENCE', label: 'Intelligence Swarm', icon: <ShieldAlert size={14} /> },
    { tab: 'DECISION', label: 'Decision Cockpit', icon: <Cpu size={14} /> },
    { tab: 'WORLD', label: 'Digital Twin', icon: <Box size={14} /> },
    { tab: 'RESPONSE', label: 'War Room', icon: <Bot size={14} /> },
    { tab: 'SECURITY', label: 'Security & Policy', icon: <Shield size={14} /> },
    { tab: 'OBSERVABILITY', label: 'Observability', icon: <Radio size={14} /> },
  ];

  const secondaryNavItems: { tab: ProductTab; label: string; icon: React.ReactNode }[] = [
    { tab: 'DATA', label: 'Data Platform', icon: <Database size={14} /> },
    { tab: 'EVALUATION', label: 'System Evaluation', icon: <Activity size={14} /> },
    { tab: 'PREDICTIVE_ML', label: 'Predictive ML', icon: <Brain size={14} /> },
    { tab: 'GRAPH_INTELLIGENCE', label: 'Graph GNN', icon: <GitFork size={14} /> },
    { tab: 'SIMULATION', label: 'Monte Carlo Twin', icon: <Layers size={14} /> },
    { tab: 'RESILIENCE_AGENTS', label: 'Resilience Agents', icon: <Bot size={14} /> },
    { tab: 'RESILIENCE_OS', label: 'Resilience OS', icon: <Cpu size={14} /> },
    { tab: 'GOVERNANCE', label: 'Governance', icon: <Shield size={14} /> },
    { tab: 'DEMO', label: 'Demo Mode', icon: <Sparkles size={14} /> },
  ];

  const [isMoreOpen, setIsMoreOpen] = React.useState(false);

  return (
    <header className="glass-panel relative z-50" style={{ borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0, padding: '8px 16px', position: 'relative', zIndex: 100 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'nowrap', gap: '12px' }}>
        {/* Brand & Version */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, #00f0ff 0%, #3b82f6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 12px rgba(0,240,255,0.4)'
            }}>
              <Cpu size={18} color="#030712" />
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                FULFILL<span style={{ color: '#00f0ff' }}>-X</span>
                <span className="mono" style={{ fontSize: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#34D399', padding: '1px 5px', borderRadius: '4px', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
                  v1.0
                </span>
              </div>
            </div>
          </div>

          <div style={{ height: '20px', width: '1px', background: 'rgba(255,255,255,0.15)' }} />

          {/* Core Product Navigation Tabs */}
          <nav style={{ display: 'flex', alignItems: 'center', background: 'rgba(3, 7, 18, 0.95)', padding: '3px 5px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)', gap: '3px' }}>
            {navItems.map(({ tab, label, icon }) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  className="fx-btn-interactive fx-focus-ring"
                  onClick={() => setActiveTab(tab)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '5px 9px',
                    borderRadius: '5px',
                    border: isActive ? '1px solid rgba(0, 240, 255, 0.5)' : '1px solid transparent',
                    background: isActive ? 'rgba(0, 240, 255, 0.12)' : 'transparent',
                    color: isActive ? '#00f0ff' : '#94A3B8',
                    fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                    boxShadow: isActive ? '0 0 10px rgba(0, 240, 255, 0.25)' : 'none',
                  }}
                >
                  {icon}
                  <span>{label}</span>
                </button>
              );
            })}

            {/* More Tools Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setIsMoreOpen(!isMoreOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '5px 9px',
                  borderRadius: '5px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: isMoreOpen ? 'rgba(255,255,255,0.1)' : 'transparent',
                  color: '#cbd5e1',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                }}
              >
                <Layers size={13} />
                <span>More Tools ▼</span>
              </button>

              {isMoreOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '36px',
                    right: 0,
                    zIndex: 9999,
                    background: '#090d16',
                    border: '1px solid rgba(0, 240, 255, 0.4)',
                    borderRadius: '8px',
                    padding: '8px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.95), 0 0 20px rgba(0, 240, 255, 0.25)',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 170px)',
                    gap: '6px',
                  }}
                  onMouseLeave={() => setIsMoreOpen(false)}
                >
                  {secondaryNavItems.map(({ tab, label, icon }) => (
                    <button
                      key={tab}
                      onClick={() => {
                        setActiveTab(tab);
                        setIsMoreOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 8px',
                        borderRadius: '4px',
                        border: 'none',
                        background: activeTab === tab ? 'rgba(0, 240, 255, 0.15)' : 'transparent',
                        color: activeTab === tab ? '#00f0ff' : '#94a3b8',
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      {icon}
                      <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
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

          {/* User Account / Identity Gateway Pill */}
          <button
            onClick={onOpenAuthGateway}
            className="fx-btn-interactive fx-focus-ring"
            title="Click to authenticate or switch identity gateway"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(6, 182, 212, 0.15)',
              padding: '5px 10px',
              borderRadius: '6px',
              border: '1px solid rgba(6, 182, 212, 0.4)',
              cursor: 'pointer',
            }}
          >
            <Shield size={14} color="#06B6D4" />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1 }}>
              <span className="mono" style={{ fontSize: '10px', fontWeight: 700, color: '#06B6D4' }}>
                {user ? user.display_name.split(' ')[0] : 'GUEST'}
              </span>
              <span className="mono" style={{ fontSize: '8px', color: '#A5F3FC' }}>
                ROLE: {userRole || 'OWNER'}
              </span>
            </div>
          </button>

          {/* AI Provider Pill */}
          <button
            onClick={() => {
              const providers = ['mock', 'gemini', 'ollama', 'bedrock'];
              const current = (activeAiProvider || 'mock').toLowerCase();
              const idx = providers.indexOf(current);
              const next = providers[(idx + 1) % providers.length];
              alert(`AI Provider switched to ${next.toUpperCase()} mode.`);
            }}
            className="fx-btn-interactive fx-focus-ring"
            title="Click to cycle active AI Provider (MOCK / GEMINI / OLLAMA / BEDROCK)"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              background: 'rgba(139, 92, 246, 0.18)',
              padding: '5px 10px',
              borderRadius: '6px',
              border: '1px solid rgba(139, 92, 246, 0.4)',
              cursor: 'pointer',
            }}
          >
            <Bot size={14} color="#C4B5FD" />
            <span className="mono" style={{ fontSize: '10px', fontWeight: 700, color: '#C4B5FD' }}>
              AI: {(activeAiProvider || 'mock').toUpperCase()}
            </span>
          </button>

          {/* Network Health Pill */}
          <button
            onClick={onReset}
            className="fx-btn-interactive fx-focus-ring"
            title="Click to verify live network telemetry status"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--bg-surface-elevated)',
              padding: '5px 10px',
              borderRadius: '6px',
              border: '1px solid var(--border-default)',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: isBackendConnected ? 'var(--color-healthy)' : 'var(--color-critical)',
                boxShadow: isBackendConnected ? '0 0 6px var(--color-healthy)' : '0 0 6px var(--color-critical)'
              }} />
              <span className="mono" style={{ fontSize: '10px', fontWeight: 700, color: '#34D399' }}>
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
          </button>
        </div>
      </div>
    </header>
  );
};
