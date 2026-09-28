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
  ShieldAlert,
  GitFork,
  Bot,
  ShieldCheck,
  Lock,
  Database,
  Sparkles,
} from 'lucide-react';
import { EventToastContainer } from '../common/EventToastContainer';
import { ContextBar } from '../common/ContextBar';
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
    label: 'Operations',
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
      {
        id: 'war-room',
        label: 'Incident War Room',
        icon: <Bot size={14} />,
        path: '/response/war-room',
      },
      {
        id: 'world',
        label: 'Digital Twin 3D',
        icon: <Activity size={14} />,
        path: '/world',
      },
    ],
  },
  {
    label: 'Deep Intelligence',
    items: [
      {
        id: 'agents',
        label: 'Agent Constellation',
        icon: <Cpu size={14} />,
        path: '/intelligence',
      },
      {
        id: 'risk',
        label: 'Risk Explorer',
        icon: <ShieldAlert size={14} />,
        path: '/intelligence/risk',
      },
      {
        id: 'gnn',
        label: 'Graph Neural Network',
        icon: <GitFork size={14} />,
        path: '/intelligence/gnn',
      },
      {
        id: 'causal',
        label: 'Causal DAG Sandbox',
        icon: <GitBranch size={14} />,
        path: '/intelligence/causal',
      },
      {
        id: 'predictive',
        label: 'Predictive AI / ML',
        icon: <Brain size={14} />,
        path: '/intelligence/predictive',
      },
    ],
  },
  {
    label: 'Experiential Intelligence',
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
      {
        id: 'skills',
        label: 'Skills & Evolution',
        icon: <Zap size={14} />,
        path: '/learning/deliberate',
      },
      {
        id: 'learning',
        label: 'Resilience OS Cycle',
        icon: <BookOpen size={14} />,
        path: '/governance/resilience',
      },
    ],
  },
  {
    label: 'Response & Stress Testing',
    items: [
      {
        id: 'adversary-lab',
        label: 'Adversary Attack Lab',
        icon: <Swords size={14} />,
        path: '/response/adversary-lab',
      },
      {
        id: 'challenge',
        label: 'Challenge Engine',
        icon: <Target size={14} />,
        path: '/challenge',
        isNew: true,
      },
    ],
  },
  {
    label: 'Decision & Safety',
    items: [
      {
        id: 'arena',
        label: 'Strategy Arena',
        icon: <Target size={14} />,
        path: '/arena',
        isNew: true,
      },
      {
        id: 'cockpit',
        label: 'Decision Cockpit',
        icon: <BarChart3 size={14} />,
        path: '/decision/cockpit',
      },
      {
        id: 'verification',
        label: 'Safety Verification',
        icon: <ShieldCheck size={14} />,
        path: '/decision/verification',
      },
    ],
  },
  {
    label: 'Simulation',
    items: [
      {
        id: 'simulation',
        label: 'Monte Carlo Twin',
        icon: <FlaskConical size={14} />,
        path: '/simulation/twin',
      },
    ],
  },
  {
    label: 'Governance & Platform',
    items: [
      {
        id: 'governance',
        label: 'Policy Engine',
        icon: <Shield size={14} />,
        path: '/governance/policies',
      },
      {
        id: 'security',
        label: 'Security & Identity',
        icon: <Lock size={14} />,
        path: '/security/console',
      },
      {
        id: 'data-fabric',
        label: 'Data Platform Fabric',
        icon: <Database size={14} />,
        path: '/data/fabric',
      },
      {
        id: 'events',
        label: 'Event Telemetry',
        icon: <Settings size={14} />,
        path: '/observability/events',
      },
      {
        id: 'evaluation',
        label: 'System Evaluation',
        icon: <BarChart3 size={14} />,
        path: '/evaluation',
      },
      {
        id: 'demo',
        label: 'Competition Demo',
        icon: <Sparkles size={14} />,
        path: '/demo',
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
  '/simulation/twin':         { title: 'Monte Carlo Simulation',     subtitle: 'Stochastic 1,000-run parameter distribution engine' },
  '/challenge':               { title: 'Challenge Engine',           subtitle: 'Adversarial counterfactual skill boundary challenge' },
  '/response/adversary':      { title: 'Adversary Attack Lab',       subtitle: '12 controlled chaos attack vectors and stress testing' },
  '/response/adversary-lab':  { title: 'Adversary Attack Lab',       subtitle: '12 controlled chaos attack vectors and stress testing' },
  '/learning/deliberate':     { title: 'Skills & Evolution',         subtitle: 'Operational resilience skill evolution' },
  '/governance/policies':     { title: 'Decision Governance',        subtitle: 'Trust gates, policy controls, and decision authority' },
  '/decision/cockpit':        { title: 'Outcomes (Decision Cockpit)', subtitle: 'Multi-agent plan reconciliation and decision cockpit' },
  '/governance/resilience':   { title: 'Resilience OS Cycle',        subtitle: '15-stage continuous operational learning and adaptation' },
  '/intelligence':            { title: 'Agent Constellation',        subtitle: 'Specialized intelligence module status' },
  '/world':                   { title: 'Digital Twin 3D',            subtitle: '3D spatial supply chain network topology' },
  '/evaluation':              { title: 'System Evaluation',          subtitle: 'System performance benchmarks and A/B learning evaluation' },
  '/intelligence/risk':       { title: 'Risk Explorer',              subtitle: 'Multi-dimensional risk scoring and propagation analysis' },
  '/intelligence/gnn':        { title: 'Graph Neural Network (GNN)', subtitle: 'GraphSAGE embeddings and multi-hop risk propagation' },
  '/intelligence/causal':     { title: 'Causal DAG Sandbox',         subtitle: 'Causal DAG structural equations and counterfactual simulation' },
  '/intelligence/predictive': { title: 'Predictive Intelligence',    subtitle: 'Demand forecasting, disruption probability & anomaly detection' },
  '/response/war-room':       { title: 'Incident War Room',          subtitle: 'Multi-agent incident command and response orchestration' },
  '/decision/verification':   { title: 'Safety Verification Sandbox', subtitle: 'Deterministic multi-tier invariant and capacity safety gates' },
  '/observability/events':    { title: 'Observability & Telemetry',  subtitle: 'Live real-time WebSocket event stream and telemetry' },
  '/data/fabric':             { title: 'Data Platform Fabric',       subtitle: 'Canonical data ingestion, quality engine & provenance' },
  '/security/console':        { title: 'Security & Identity Console', subtitle: 'Zero-trust RBAC policy matrix, multi-tenancy & audit boundaries' },
  '/demo':                    { title: 'Competition Demo Mode',      subtitle: 'Deterministic 14-state demonstration runner & judge report' },
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

      {/* ── GLOBAL RESILIENCE CONTEXT BAR (Phase 6C) ── */}
      <ContextBar />

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
