import React, { useState, useEffect, useCallback } from 'react';
import { WorldStateSnapshot, WorldSummary, WorldNode } from './types/world';
import { NodeRiskDetail, RiskScoreMap, SignalCreateRequest } from './types/risk';
import { fetchWorldSnapshot, fetchWorldSummary, seedWorld, resetWorld } from './api/worldApi';
import {
  fetchRiskMap,
  fetchNodeRiskDetail,
  injectSignal,
  resetRisk,
} from './api/riskApi';
import { fetchAIProviders } from './api/aiApi';
import { Navbar, ProductTab } from './components/common/Navbar';
import { WorldSummaryBar } from './components/world/WorldSummaryBar';
import { World2DView } from './components/world/World2DView';
import { World3DView } from './components/world/World3DView';
import { NodeInspector } from './components/world/NodeInspector';
import { RiskExplorer } from './components/risk/RiskExplorer';
import { SignalInjectorModal } from './components/risk/SignalInjectorModal';
import { SpecialistWarRoom } from './components/agents/SpecialistWarRoom';
import { DecisionCockpit } from './components/cockpit/DecisionCockpit';
import { EvaluationDashboard } from './components/evaluation/EvaluationDashboard';
import { DemoMode } from './components/demo/DemoMode';
import { CommandCenter } from './components/command/CommandCenter';
import { IntelligencePanel } from './components/intelligence/IntelligencePanel';
import { DataFabric } from './components/data/DataFabric';
import { SecurityConsole } from './components/security/SecurityConsole';
import { ObservabilityCenter } from './components/observability/ObservabilityCenter';
import { PredictiveIntelligence } from './components/ml/PredictiveIntelligence';
import { IdentityGateway } from './components/auth/IdentityGateway';
import { EventToastContainer } from './components/common/EventToastContainer';
import { useRealtimeStore } from './store/realtimeStore';
import { CandidatePlan } from './types/coordinator';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ProductTab>('COMMAND');
  const [viewMode, setViewMode] = useState<'2D' | '3D'>('2D');
  const [snapshot, setSnapshot] = useState<WorldStateSnapshot | null>(null);
  const [summary, setSummary] = useState<WorldSummary | null>(null);
  const [riskMap, setRiskMap] = useState<RiskScoreMap | null>(null);
  const [activeAiProvider, setActiveAiProvider] = useState<string>('mock');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('sup-001');
  const [nodeRiskDetail, setNodeRiskDetail] = useState<NodeRiskDetail | null>(null);
  const [activePreset, setActivePreset] = useState<string>('healthy');
  const [activeSeed, setActiveSeed] = useState<number>(42);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals / Inspector State
  const [isInjectorOpen, setIsInjectorOpen] = useState<boolean>(false);
  const [injectorTargetId, setInjectorTargetId] = useState<string | null>(null);
  const [isWarRoomOpen, setIsWarRoomOpen] = useState<boolean>(false);
  const [isCockpitOpen, setIsCockpitOpen] = useState<boolean>(false);
  const [isAuthGatewayOpen, setIsAuthGatewayOpen] = useState<boolean>(false);
  const [previewCandidatePlan, setPreviewCandidatePlan] = useState<CandidatePlan | null>(null);

  const loadWorldAndRiskData = useCallback(async () => {
    try {
      setLoading(true);
      const [snapData, sumData, rMap, aiSummary] = await Promise.all([
        fetchWorldSnapshot(),
        fetchWorldSummary(),
        fetchRiskMap().catch(() => null),
        fetchAIProviders().catch(() => null),
      ]);

      setSnapshot(snapData);
      setSummary(sumData);
      if (rMap) setRiskMap(rMap);
      if (aiSummary) setActiveAiProvider(aiSummary.active_provider);
      setIsBackendConnected(true);
    } catch (err) {
      console.warn('Backend connection issue, serving fallback state:', err);
      setIsBackendConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWorldAndRiskData();
  }, [loadWorldAndRiskData]);

  // Load risk detail whenever selected node changes
  useEffect(() => {
    if (selectedNodeId && isBackendConnected) {
      fetchNodeRiskDetail(selectedNodeId)
        .then((detail) => setNodeRiskDetail(detail))
        .catch(() => setNodeRiskDetail(null));
    } else {
      setNodeRiskDetail(null);
    }
  }, [selectedNodeId, isBackendConnected, riskMap]);

  const handleSeedChange = async (preset: string, seed: number) => {
    setActivePreset(preset);
    setActiveSeed(seed);
    try {
      const snap = await seedWorld(preset, seed);
      setSnapshot(snap);
      const sum = await fetchWorldSummary();
      setSummary(sum);
      const rMap = await fetchRiskMap();
      setRiskMap(rMap);
    } catch (err) {
      console.error('Failed to seed world:', err);
    }
  };

  const handleReset = async () => {
    try {
      const snap = await resetWorld();
      setSnapshot(snap);
      const sum = await fetchWorldSummary();
      setSummary(sum);
      const rMap = await resetRisk();
      setRiskMap(rMap);
      if (selectedNodeId) {
        const detail = await fetchNodeRiskDetail(selectedNodeId);
        setNodeRiskDetail(detail);
      }
    } catch (err) {
      console.error('Failed to reset world:', err);
    }
  };

  const handleInjectSignal = async (req: SignalCreateRequest) => {
    try {
      await injectSignal(req);
      const [snapData, sumData, rMap] = await Promise.all([
        fetchWorldSnapshot(),
        fetchWorldSummary(),
        fetchRiskMap(),
      ]);
      setSnapshot(snapData);
      setSummary(sumData);
      setRiskMap(rMap);
      if (selectedNodeId) {
        const detail = await fetchNodeRiskDetail(selectedNodeId);
        setNodeRiskDetail(detail);
      }
    } catch (err) {
      console.error('Failed to inject signal:', err);
    }
  };

  const handleOpenInjector = (targetNodeId?: string) => {
    setInjectorTargetId(targetNodeId || selectedNodeId);
    setIsInjectorOpen(true);
  };

  const { nodeRisks: rtNodeRisks } = useRealtimeStore();
  const selectedNode = snapshot?.nodes.find((n) => n.id === selectedNodeId) || null;

  const currentNodes: WorldNode[] = (snapshot?.nodes || []).map((node) => {
    const rtRisk = rtNodeRisks[node.id];
    if (rtRisk) {
      const baseScores = riskMap?.node_risks[node.id] || node.risk_scores;
      return {
        ...node,
        risk_scores: {
          ...baseScores,
          composite: rtRisk.composite,
        },
        is_disrupted: rtRisk.composite >= 0.5 || node.is_disrupted,
      };
    }
    if (riskMap?.node_risks[node.id]) {
      const r = riskMap.node_risks[node.id];
      return {
        ...node,
        risk_scores: r,
        is_disrupted: r.composite >= 0.5 || node.is_disrupted,
      };
    }
    return node;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', background: 'var(--bg-canvas)' }}>
      {/* Real-time Toast Notifications */}
      <EventToastContainer />

      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        viewMode={viewMode}
        setViewMode={setViewMode}
        activePreset={activePreset}
        activeSeed={activeSeed}
        healthScore={riskMap?.network_health ?? summary?.network_health_score ?? snapshot?.network_health_score ?? 0.94}
        isBackendConnected={isBackendConnected}
        activeAiProvider={activeAiProvider}
        onSeedChange={handleSeedChange}
        onReset={handleReset}
        onOpenInjector={() => handleOpenInjector()}
        onOpenAuthGateway={() => setIsAuthGatewayOpen(true)}
      />

      {/* World Summary Bar */}
      <WorldSummaryBar summary={summary} />

      {/* Main Product View Area */}
      <main style={{ flex: 1, position: 'relative', overflow: 'auto' }}>
        {loading ? (
          <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
            <div className="mono">Loading FULFILL-X World State & Deterministic Risk Engine...</div>
          </div>
        ) : activeTab === 'COMMAND' ? (
          <CommandCenter
            summary={summary}
            nodes={currentNodes}
            riskMap={riskMap}
            onOpenInjector={() => handleOpenInjector()}
            onOpenWarRoom={() => setIsWarRoomOpen(true)}
            onOpenCockpit={() => setIsCockpitOpen(true)}
            onOpenEvaluation={() => setActiveTab('EVALUATION')}
            onOpenDemo={() => setActiveTab('DEMO')}
            onSelectNode={(nid) => { setSelectedNodeId(nid); setActiveTab('WORLD'); }}
          />
        ) : activeTab === 'INTELLIGENCE' ? (
          <IntelligencePanel
            onOpenInjector={() => handleOpenInjector()}
            onSelectNode={(nid) => { setSelectedNodeId(nid); setActiveTab('WORLD'); }}
          />
        ) : activeTab === 'EVALUATION' ? (
          <EvaluationDashboard />
        ) : activeTab === 'DEMO' ? (
          <DemoMode />
        ) : activeTab === 'DATA' ? (
          <DataFabric />
        ) : activeTab === 'SECURITY' ? (
          <SecurityConsole />
        ) : activeTab === 'OBSERVABILITY' ? (
          <ObservabilityCenter />
        ) : activeTab === 'PREDICTIVE_ML' ? (
          <PredictiveIntelligence />
        ) : activeTab === 'RESPONSE' ? (
          <div className="max-w-7xl mx-auto p-6">
            <SpecialistWarRoom
              isOpen={true}
              onClose={() => setActiveTab('COMMAND')}
              selectedNodeId={selectedNodeId}
              onPreviewCandidate={(cand) => setPreviewCandidatePlan(cand)}
              selectedCandidateId={previewCandidatePlan?.candidate_id}
            />
          </div>
        ) : activeTab === 'DECISION' ? (
          <div className="max-w-7xl mx-auto p-6">
            <DecisionCockpit
              isOpen={true}
              onClose={() => setActiveTab('COMMAND')}
              onPreviewCandidate={(cand) => setPreviewCandidatePlan(cand)}
            />
          </div>
        ) : (
          <>
            {viewMode === '2D' ? (
              <World2DView
                nodes={currentNodes}
                edges={snapshot?.edges || []}
                selectedNodeId={selectedNodeId}
                onSelectNode={setSelectedNodeId}
              />
            ) : (
              <World3DView
                nodes={currentNodes}
                edges={snapshot?.edges || []}
                selectedNodeId={selectedNodeId}
                onSelectNode={setSelectedNodeId}
              />
            )}

            {/* Risk Detail Inspector Panel */}
            {nodeRiskDetail ? (
              <RiskExplorer
                riskDetail={nodeRiskDetail}
                onClose={() => setSelectedNodeId(null)}
                onSelectNode={setSelectedNodeId}
                onOpenInjector={(nid) => handleOpenInjector(nid)}
              />
            ) : (
              <NodeInspector
                node={selectedNode}
                edges={snapshot?.edges || []}
                onClose={() => setSelectedNodeId(null)}
                onSelectNode={setSelectedNodeId}
              />
            )}
          </>
        )}

        {/* Signal Injector Modal */}
        <SignalInjectorModal
          isOpen={isInjectorOpen}
          onClose={() => setIsInjectorOpen(false)}
          nodes={currentNodes}
          initialTargetNodeId={injectorTargetId}
          onInject={handleInjectSignal}
        />

        {/* Specialist War Room Drawer (Modal Mode) */}
        {isWarRoomOpen && (
          <SpecialistWarRoom
            isOpen={isWarRoomOpen}
            onClose={() => setIsWarRoomOpen(false)}
            selectedNodeId={selectedNodeId}
            onPreviewCandidate={(cand) => setPreviewCandidatePlan(cand)}
            selectedCandidateId={previewCandidatePlan?.candidate_id}
          />
        )}

        {/* Decision Cockpit Modal */}
        {isCockpitOpen && (
          <DecisionCockpit
            isOpen={isCockpitOpen}
            onClose={() => setIsCockpitOpen(false)}
            onPreviewCandidate={(cand) => setPreviewCandidatePlan(cand)}
          />
        )}

        {/* Identity Gateway Modal */}
        {isAuthGatewayOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
            <div className="w-full max-w-md">
              <IdentityGateway onClose={() => setIsAuthGatewayOpen(false)} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
