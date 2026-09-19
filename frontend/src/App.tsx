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
import { Navbar } from './components/common/Navbar';
import { WorldSummaryBar } from './components/world/WorldSummaryBar';
import { World2DView } from './components/world/World2DView';
import { World3DView } from './components/world/World3DView';
import { NodeInspector } from './components/world/NodeInspector';
import { RiskExplorer } from './components/risk/RiskExplorer';
import { SignalInjectorModal } from './components/risk/SignalInjectorModal';

export const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<'2D' | '3D'>('2D');
  const [snapshot, setSnapshot] = useState<WorldStateSnapshot | null>(null);
  const [summary, setSummary] = useState<WorldSummary | null>(null);
  const [riskMap, setRiskMap] = useState<RiskScoreMap | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('sup-001');
  const [nodeRiskDetail, setNodeRiskDetail] = useState<NodeRiskDetail | null>(null);
  const [activePreset, setActivePreset] = useState<string>('healthy');
  const [activeSeed, setActiveSeed] = useState<number>(42);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals / Inspector State
  const [isInjectorOpen, setIsInjectorOpen] = useState<boolean>(false);
  const [injectorTargetId, setInjectorTargetId] = useState<string | null>(null);

  const loadWorldAndRiskData = useCallback(async () => {
    try {
      setLoading(true);
      const [snapData, sumData, rMap] = await Promise.all([
        fetchWorldSnapshot(),
        fetchWorldSummary(),
        fetchRiskMap().catch(() => null),
      ]);

      setSnapshot(snapData);
      setSummary(sumData);
      if (rMap) setRiskMap(rMap);
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
      // Refresh snapshot and risk map after signal injection & risk recalculation
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

  const selectedNode = snapshot?.nodes.find((n) => n.id === selectedNodeId) || null;

  // Merge updated risk scores into WorldNodes if available
  const currentNodes: WorldNode[] = (snapshot?.nodes || []).map((node) => {
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
      {/* Navbar */}
      <Navbar
        viewMode={viewMode}
        setViewMode={setViewMode}
        activePreset={activePreset}
        activeSeed={activeSeed}
        healthScore={riskMap?.network_health ?? summary?.network_health_score ?? snapshot?.network_health_score ?? 0.94}
        isBackendConnected={isBackendConnected}
        onSeedChange={handleSeedChange}
        onReset={handleReset}
        onOpenInjector={() => handleOpenInjector()}
      />

      {/* World Summary Bar */}
      <WorldSummaryBar summary={summary} />

      {/* Main View Area */}
      <main style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
            <div className="mono">Loading FULFILL-X World State & Deterministic Risk Engine...</div>
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

            {/* Risk Detail Inspector Panel (if risk details available) */}
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

            {/* Signal Injector Modal */}
            <SignalInjectorModal
              isOpen={isInjectorOpen}
              onClose={() => setIsInjectorOpen(false)}
              nodes={currentNodes}
              initialTargetNodeId={injectorTargetId}
              onInject={handleInjectSignal}
            />
          </>
        )}
      </main>
    </div>
  );
};

export default App;
