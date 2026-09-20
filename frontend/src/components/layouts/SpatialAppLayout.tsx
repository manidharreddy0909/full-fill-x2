import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Navbar, ProductTab } from '../common/Navbar';
import { EventToastContainer } from '../common/EventToastContainer';
import { SignalInjectorModal } from '../risk/SignalInjectorModal';
import { IdentityGateway } from '../auth/IdentityGateway';
import { useAppShellStore } from '../../store/appShellStore';
import { useVisualEnvironmentStore } from '../../store/visualEnvironmentStore';
import { seedWorld, resetWorld } from '../../api/worldApi';
import { resetRisk, injectSignal } from '../../api/riskApi';
import { SignalCreateRequest } from '../../types/risk';
import { useQueryClient } from '@tanstack/react-query';

export const SpatialAppLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const {
    selectedNodeId,
    activePreset,
    activeSeed,
    isBackendConnected,
    isInjectorOpen,
    injectorTargetId,
    isAuthGatewayOpen,
    setActivePresetAndSeed,
    closeInjector,
    openInjector,
    setAuthGatewayOpen,
  } = useAppShellStore();

  const { viewMode, setViewMode } = useVisualEnvironmentStore();

  // Map route pathname to ProductTab
  const getActiveTab = (): ProductTab => {
    const path = location.pathname;
    if (path.startsWith('/world')) return 'WORLD';
    if (path.startsWith('/intelligence/gnn')) return 'GRAPH_INTELLIGENCE';
    if (path.startsWith('/intelligence/causal')) return 'PREDICTIVE_ML';
    if (path.startsWith('/intelligence')) return 'INTELLIGENCE';
    if (path.startsWith('/response')) return 'RESPONSE';
    if (path.startsWith('/decision')) return 'DECISION';
    if (path.startsWith('/simulation')) return 'SIMULATION';
    if (path.startsWith('/learning')) return 'RESILIENCE_AGENTS';
    if (path.startsWith('/observability')) return 'OBSERVABILITY';
    if (path.startsWith('/governance/resilience')) return 'RESILIENCE_OS';
    if (path.startsWith('/governance/policies')) return 'GOVERNANCE';
    if (path.startsWith('/evaluation')) return 'EVALUATION';
    if (path.startsWith('/command')) return 'COMMAND';
    return 'COMMAND';
  };

  const handleTabChange = (tab: ProductTab) => {
    switch (tab) {
      case 'COMMAND':
        navigate('/command');
        break;
      case 'WORLD':
      case 'DATA':
        navigate('/world');
        break;
      case 'INTELLIGENCE':
        navigate('/intelligence');
        break;
      case 'GRAPH_INTELLIGENCE':
        navigate('/intelligence/gnn');
        break;
      case 'PREDICTIVE_ML':
        navigate('/intelligence/causal');
        break;
      case 'RESPONSE':
        navigate('/response/war-room');
        break;
      case 'DECISION':
      case 'DEMO':
        navigate('/decision/cockpit');
        break;
      case 'SIMULATION':
        navigate('/simulation/twin');
        break;
      case 'RESILIENCE_AGENTS':
        navigate('/learning/deliberate');
        break;
      case 'OBSERVABILITY':
        navigate('/observability/events');
        break;
      case 'RESILIENCE_OS':
        navigate('/governance/resilience');
        break;
      case 'EVALUATION':
        navigate('/evaluation');
        break;
      case 'GOVERNANCE':
        navigate('/governance/policies');
        break;
      case 'SECURITY':
        setAuthGatewayOpen(true);
        navigate('/governance/resilience');
        break;
      default:
        navigate('/command');
        break;
    }
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

  return (
    <div className="flex flex-col h-screen w-screen bg-[#050911] overflow-hidden">
      {/* Realtime Toast Notifications Container */}
      <EventToastContainer />

      {/* Spatial Navbar */}
      <Navbar
        activeTab={getActiveTab()}
        setActiveTab={handleTabChange}
        viewMode={viewMode}
        setViewMode={setViewMode}
        activePreset={activePreset}
        activeSeed={activeSeed}
        healthScore={0.94}
        isBackendConnected={isBackendConnected}
        activeAiProvider="mock"
        onSeedChange={handleSeedChange}
        onReset={handleReset}
        onOpenInjector={() => openInjector()}
        onOpenAuthGateway={() => setAuthGatewayOpen(true)}
      />

      {/* Main Spatial Route Viewport */}
      <main className="flex-1 relative overflow-auto">
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
            <div className="w-full max-w-md">
              <IdentityGateway onClose={() => setAuthGatewayOpen(false)} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
