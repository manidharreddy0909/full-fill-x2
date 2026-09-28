/**
 * ResilienceIntelligenceLayout — Phase 1 Application Shell
 *
 * Premium enterprise sidebar + topbar layout for the
 * Experiential Resilience Intelligence Platform.
 *
 * PRESERVES: All existing routes via the Outlet.
 * DOES NOT: Delete any existing workspace or API.
 */
import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAppShellStore } from '../../store/appShellStore';
import { useRealtimeStore } from '../../store/realtimeStore';
import {
  LayoutDashboard,
  Radio,
  Brain,
  GitBranch,
  Shuffle,
  Swords,
  Cpu,
  FlaskConical,
  Zap,
  Shield,
  Target,
  BookOpen,
  BarChart3,
  Settings,
  ChevronRight,
  Activity,
  Bell,
  User,
  Wifi,
  WifiOff,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { EventToastContainer } from '../common/EventToastContainer';
import { SignalInjectorModal } from '../risk/SignalInjectorModal';
import { IdentityGateway } from '../auth/IdentityGateway';
import { Global3DParticleCanvas } from '../../visual/environment/Global3DParticleCanvas';
import { seedWorld, resetWorld } from '../../api/worldApi';
import { resetRisk, injectSignal } from '../../api/riskApi';
import { SignalCreateRequest } from '../../types/risk';
import { useQueryClient } from '@tanstack/react-query';

// ─── Navigation Definition ────────────────────────────────────────────────────

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: string;
  badgeColor?: string;
  isNew?: boolean;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const NAV_STRUCTURE: NavSection[] = [
  {
    label: 'Intelligence',
    items: [
      {
        id: 'overview',
        label: 'Overview',
        icon: <LayoutDashboard size={14} />,
        path: '/',
      },
      {
        id: 'live',
        label: 'Live Resilience',
        icon: <Radio size={14} />,
        path: '/command',
      },
    ],
  },
  {
    label: 'Experience',
    items: [
      {
        id: 'memory',
        label: 'Experience Memory',
        icon: <Brain size={14} />,
        path: '/memory',
        isNew: true,
      },
      {
        id: 'genome',
        label: 'Resilience Genome',
        icon: <GitBranch size={14} />,
        path: '/genome',
        isNew: true,
      },
      {
        id: 'transfer',
        label: 'Transfer Intelligence',
        icon: <Shuffle size={14} />,
        path: '/transfer',
        isNew: true,
      },
    ],
  },
  {
    label: 'Decision',
    items: [
      {
        id: 'arena',
        label: 'Strategy Arena',
        icon: <Target size={14} />,
        path: '/arena',
        isNew: true,
      },
      {
        id: 'simulation',
        label: 'Simulation',
        icon: <FlaskConical size={14} />,
        path: '/simulation/twin',
      },
      {
        id: 'challenge',
        label: 'Challenge Engine',
        icon: <Swords size={14} />,
        path: '/challenge',
        isNew: true,
      },
    ],
  },
  {
    label: 'Operations',
    items: [
      {
        id: 'skills',
        label: 'Skills',
        icon: <Zap size={14} />,
        path: '/learning/deliberate',
      },
      {
        id: 'governance',
        label: 'Decision Governance',
        icon: <Shield size={14} />,
        path: '/governance/policies',
      },
      {
        id: 'outcomes',
        label: 'Outcomes',
        icon: <BarChart3 size={14} />,
        path: '/decision/cockpit',
      },
      {
        id: 'learning',
        label: 'Learning',
        icon: <BookOpen size={14} />,
        path: '/governance/resilience',
      },
    ],
  },
  {
    label: 'Platform',
    items: [
      {
        id: 'agents',
        label: 'Agent Constellation',
        icon: <Cpu size={14} />,
        path: '/intelligence',
      },
      {
        id: 'world',
        label: 'Digital Twin',
        icon: <Activity size={14} />,
        path: '/world',
      },
      {
        id: 'evaluation',
        label: 'Evaluation',
        icon: <BarChart3 size={14} />,
        path: '/evaluation',
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: <Settings size={14} />,
        path: '/observability/events',
      },
    ],
  },
];

// ─── Page Title Map ───────────────────────────────────────────────────────────

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/':                        { title: 'Resilience Intelligence',   subtitle: 'Operational intelligence that learns from experience' },
  '/command':                 { title: 'Live Resilience',            subtitle: 'Real-time supply chain operational status' },
  '/memory':                  { title: 'Experience Memory',          subtitle: 'Persistent operational experience and evidence' },
  '/genome':                  { title: 'Resilience Genome',          subtitle: 'Learned success conditions and failure boundaries' },
  '/transfer':                { title: 'Transfer Intelligence',      subtitle: 'Experience transferability assessment' },
  '/arena':                   { title: 'Strategy Arena',             subtitle: 'Candidate strategy evaluation and selection' },
  '/simulation/twin':         { title: 'Simulation',                 subtitle: 'Counterfactual and scenario simulation engine' },
  '/response/adversary':      { title: 'Challenge Engine',           subtitle: 'Adversarial challenge and robustness analysis' },
  '/learning/deliberate':     { title: 'Skills',                     subtitle: 'Operational resilience skill evolution' },
  '/governance/policies':     { title: 'Decision Governance',        subtitle: 'Trust gates, policy controls, and decision authority' },
  '/decision/cockpit':        { title: 'Outcomes',                   subtitle: 'Prediction vs actual outcome analysis' },
  '/governance/resilience':   { title: 'Learning',                   subtitle: 'Continuous operational learning and adaptation' },
  '/intelligence':            { title: 'Agent Constellation',        subtitle: 'Specialized intelligence module status' },
  '/world':                   { title: 'Digital Twin',               subtitle: '3D supply chain network topology' },
  '/evaluation':              { title: 'Evaluation',                 subtitle: 'System performance benchmarks and evidence' },
  '/intelligence/risk':       { title: 'Risk Intelligence',          subtitle: 'Risk heatmap and propagation analysis' },
  '/intelligence/gnn':        { title: 'Graph Intelligence',         subtitle: 'GNN-based network propagation analysis' },
  '/intelligence/causal':     { title: 'Causal Analysis',            subtitle: 'Causal reasoning and predictive modelling' },
  '/response/war-room':       { title: 'War Room',                   subtitle: 'Autonomous resilience response orchestration' },
  '/decision/verification':   { title: 'Verification',               subtitle: 'Decision verification and safety checks' },
  '/observability/events':    { title: 'Observability',              subtitle: 'Live event stream and telemetry' },
};

// ─── Main Layout Component ────────────────────────────────────────────────────

export const ResilienceIntelligenceLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const realtimeState = useRealtimeStore();

  const {
    isBackendConnected,
    isInjectorOpen,
    injectorTargetId,
    isAuthGatewayOpen,
    activePreset,
    activeSeed,
    setActivePresetAndSeed,
    closeInjector,
    openInjector,
    setAuthGatewayOpen,
  } = useAppShellStore();

  const [notificationCount] = useState(3);
  const [isSidebarExpanded] = useState(true);

  // Establish global WebSocket connection
  React.useEffect(() => {
    import('../../api/websocket').then(({ realtimeClient }) => {
      realtimeClient.connect();
    });
  }, []);

  const currentPath = location.pathname;
  const pageInfo = PAGE_TITLES[currentPath] || { title: 'Resilience Intelligence', subtitle: 'Operational intelligence platform' };
  const networkHealth = realtimeState.networkHealth || 0.94;
  const wsLive = realtimeState.connectionStatus === 'CONNECTED';

  const isActive = (path: string) => {
    if (path === '/') return currentPath === '/';
    return currentPath === path || currentPath.startsWith(path + '/');
  };

  const handleSeedChange = async (preset: string, seed: number) => {
    setActivePresetAndSeed(preset, seed);
    try {
      await seedWorld(preset, seed);
      queryClient.invalidateQueries({ queryKey: ['worldSnapshot'] });
      queryClient.invalidateQueries({ queryKey: ['worldSummary'] });
      queryClient.invalidateQueries({ queryKey: ['riskMap'] });
    } catch (err) {
      console.error('Failed to seed world:', err);
    }
  };

  const handleReset = async () => {
    try {
      await resetWorld();
      await resetRisk();
      queryClient.invalidateQueries({ queryKey: ['worldSnapshot'] });
      queryClient.invalidateQueries({ queryKey: ['worldSummary'] });
      queryClient.invalidateQueries({ queryKey: ['riskMap'] });
    } catch (err) {
      console.error('Failed to reset world:', err);
    }
  };

  const handleInjectSignal = async (req: SignalCreateRequest) => {
    try {
      await injectSignal(req);
      queryClient.invalidateQueries({ queryKey: ['worldSnapshot'] });
      queryClient.invalidateQueries({ queryKey: ['worldSummary'] });
      queryClient.invalidateQueries({ queryKey: ['riskMap'] });
    } catch (err) {
      console.error('Failed to inject signal:', err);
    }
  };

  const healthColor = networkHealth >= 0.85 ? '#34c77b' : networkHealth >= 0.6 ? '#f5a623' : '#e8503a';

  return (
    <div style={{ background: '#040810', minHeight: '100vh', position: 'relative' }}>
      {/* Particle Canvas Background */}
      <Global3DParticleCanvas />

      {/* Realtime Toasts */}
      <EventToastContainer />

      {/* ── SIDEBAR ── */}
      <nav className="ri-sidebar">
        {/* Product Mark */}
        <div style={{
          padding: '16px 16px 12px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Logo mark */}
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #1a3a5c 0%, #0f2040 100%)',
              border: '1px solid rgba(56,189,248,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 0 12px rgba(56,189,248,0.15)',
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="5.5" stroke="#38bdf8" strokeWidth="1.5" />
                <circle cx="8" cy="8" r="2.5" fill="#38bdf8" opacity="0.6" />
                <line x1="8" y1="1" x2="8" y2="3" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="8" y1="13" x2="8" y2="15" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="1" y1="8" x2="3" y2="8" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="13" y1="8" x2="15" y2="8" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            {isSidebarExpanded && (
              <div>
                <div style={{
                  fontSize: '12px',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                  color: '#c8daea',
                  letterSpacing: '0.05em',
                  lineHeight: 1.2,
                }}>
                  RESILIENCE OS
                </div>
                <div style={{
                  fontSize: '9px',
                  fontFamily: 'var(--font-mono)',
                  color: '#2a3d52',
                  letterSpacing: '0.06em',
                  marginTop: '1px',
                }}>
                  INTELLIGENCE PLATFORM
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Sections */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingTop: '8px' }}>
          {NAV_STRUCTURE.map((section) => (
            <div key={section.label}>
              {isSidebarExpanded && (
                <div className="ri-sidebar-section-label">{section.label}</div>
              )}
              {section.items.map((item) => (
                <button
                  key={item.id}
                  className={`ri-sidebar-nav-item ${isActive(item.path) ? 'active' : ''}`}
                  onClick={() => navigate(item.path)}
                  title={!isSidebarExpanded ? item.label : undefined}
                  style={{ width: 'calc(100% - 16px)' }}
                >
                  <span style={{ flexShrink: 0 }}>{item.icon}</span>
                  {isSidebarExpanded && (
                    <>
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.label}
                      </span>
                      {item.isNew && (
                        <span style={{
                          fontSize: '8px',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 800,
                          padding: '1px 5px',
                          borderRadius: '3px',
                          background: 'rgba(56,189,248,0.15)',
                          color: '#38bdf8',
                          border: '1px solid rgba(56,189,248,0.25)',
                          letterSpacing: '0.06em',
                          flexShrink: 0,
                        }}>
                          NEW
                        </span>
                      )}
                      {isActive(item.path) && (
                        <ChevronRight size={10} style={{ flexShrink: 0 }} />
                      )}
                    </>
                  )}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Sidebar Bottom — System Status */}
        <div style={{
          padding: '10px 12px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
        }}>
          {/* Memory status */}
          {isSidebarExpanded && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 10px',
              borderRadius: '7px',
              background: 'rgba(56,189,248,0.06)',
              border: '1px solid rgba(56,189,248,0.12)',
              marginBottom: '8px',
            }}>
              <Brain size={11} color="#38bdf8" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.06em' }}>
                  EXPERIENCE MEMORY
                </div>
                <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#3d5168' }}>
                  12 experiences · 84% confident
                </div>
              </div>
            </div>
          )}

          {/* Connection status */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 10px',
            borderRadius: '6px',
            background: 'rgba(7,14,26,0.7)',
          }}>
            <span className={`status-dot ${isBackendConnected ? 'operational' : 'critical'}`} />
            {isSidebarExpanded && (
              <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: isBackendConnected ? '#34c77b' : '#e8503a' }}>
                {isBackendConnected ? 'SYSTEM OPERATIONAL' : 'SYSTEM OFFLINE'}
              </span>
            )}
          </div>
        </div>
      </nav>

      {/* ── TOP BAR ── */}
      <header className="ri-topbar">
        {/* Left: Breadcrumb / Page Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div>
            <div style={{
              fontSize: '13px',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              color: '#c8daea',
              letterSpacing: '0.02em',
            }}>
              {pageInfo.title}
            </div>
            <div style={{
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              color: '#3d5168',
              marginTop: '1px',
            }}>
              {pageInfo.subtitle}
            </div>
          </div>
        </div>

        {/* Right: Status Indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Scenario Controls */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 8px',
            borderRadius: '6px',
            background: 'rgba(7,14,26,0.8)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}>
            <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#3d5168' }}>Scenario:</span>
            <select
              value={activePreset}
              onChange={(e) => handleSeedChange(e.target.value, activeSeed)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#7a90aa',
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
                padding: '1px 2px',
                borderRadius: '0',
                boxShadow: 'none',
              }}
            >
              <option value="healthy">Healthy Baseline</option>
              <option value="double_punch">Double Disruption</option>
            </select>
            <button
              onClick={handleReset}
              title="Reset scenario"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#3d5168',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
                boxShadow: 'none',
              }}
            >
              <RefreshCw size={11} />
            </button>
          </div>

          {/* Network Health */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '6px',
            background: 'rgba(7,14,26,0.8)',
            border: `1px solid ${healthColor}20`,
          }}>
            <Activity size={12} color={healthColor} />
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: healthColor }}>
              {(networkHealth * 100).toFixed(1)}%
            </span>
            <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#3d5168' }}>HEALTH</span>
          </div>

          {/* Signal Injector */}
          <button
            onClick={() => openInjector()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '5px 10px',
              borderRadius: '6px',
              background: 'rgba(232,80,58,0.1)',
              border: '1px solid rgba(232,80,58,0.3)',
              color: '#f87171',
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <AlertTriangle size={11} />
            Inject Signal
          </button>

          {/* WS Status */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '4px 8px',
            borderRadius: '5px',
            background: wsLive ? 'rgba(56,189,248,0.08)' : 'rgba(7,14,26,0.6)',
            border: wsLive ? '1px solid rgba(56,189,248,0.2)' : '1px solid rgba(255,255,255,0.05)',
          }}>
            {wsLive ? <Wifi size={11} color="#38bdf8" /> : <WifiOff size={11} color="#3d5168" />}
            <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: wsLive ? '#38bdf8' : '#3d5168' }}>
              {wsLive ? 'LIVE' : 'STANDBY'}
            </span>
          </div>

          {/* Notifications */}
          <button
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              padding: '6px',
              borderRadius: '6px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.07)',
              color: '#4a5c72',
              cursor: 'pointer',
              boxShadow: 'none',
            }}
          >
            <Bell size={14} />
            {notificationCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '2px',
                right: '2px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#e8503a',
                fontSize: '7px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }} />
            )}
          </button>

          {/* User Profile */}
          <button
            onClick={() => setAuthGatewayOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              padding: '5px 10px',
              borderRadius: '6px',
              background: 'rgba(7,14,26,0.8)',
              border: '1px solid rgba(255,255,255,0.08)',
              cursor: 'pointer',
            }}
          >
            <div style={{
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1a3a5c, #0f2040)',
              border: '1px solid rgba(56,189,248,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <User size={11} color="#38bdf8" />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#8ab4d4' }}>GUEST</div>
              <div style={{ fontSize: '8px', fontFamily: 'var(--font-mono)', color: '#2a3d52' }}>ANALYST</div>
            </div>
          </button>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="ri-main-content">
        <Outlet />

        {/* Signal Injector Modal */}
        <SignalInjectorModal
          isOpen={isInjectorOpen}
          onClose={closeInjector}
          nodes={[]}
          initialTargetNodeId={injectorTargetId}
          onInject={handleInjectSignal}
        />

        {/* Identity Gateway Modal */}
        {isAuthGatewayOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
            <div className="w-[440px] max-w-full">
              <IdentityGateway onClose={() => setAuthGatewayOpen(false)} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
