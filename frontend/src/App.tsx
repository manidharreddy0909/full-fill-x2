import React, { useState, useEffect, useCallback } from 'react';
import { WorldStateSnapshot, WorldSummary, WorldNode, WorldEdge } from './types/world';
import { fetchWorldSnapshot, fetchWorldSummary, seedWorld, resetWorld } from './api/worldApi';
import { Navbar } from './components/common/Navbar';
import { WorldSummaryBar } from './components/world/WorldSummaryBar';
import { World2DView } from './components/world/World2DView';
import { World3DView } from './components/world/World3DView';
import { NodeInspector } from './components/world/NodeInspector';

export const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<'2D' | '3D'>('2D');
  const [snapshot, setSnapshot] = useState<WorldStateSnapshot | null>(null);
  const [summary, setSummary] = useState<WorldSummary | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('sup-001');
  const [activePreset, setActivePreset] = useState<string>('healthy');
  const [activeSeed, setActiveSeed] = useState<number>(42);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);

  const loadWorldData = useCallback(async () => {
    try {
      setLoading(true);
      const [snapData, sumData] = await Promise.all([
        fetchWorldSnapshot(),
        fetchWorldSummary(),
      ]);
      setSnapshot(snapData);
      setSummary(sumData);
      setIsBackendConnected(true);
    } catch (err) {
      console.warn('Backend connection issue, serving fallback state:', err);
      setIsBackendConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWorldData();
  }, [loadWorldData]);

  const handleSeedChange = async (preset: string, seed: number) => {
    setActivePreset(preset);
    setActiveSeed(seed);
    try {
      const snap = await seedWorld(preset, seed);
      setSnapshot(snap);
      const sum = await fetchWorldSummary();
      setSummary(sum);
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
    } catch (err) {
      console.error('Failed to reset world:', err);
    }
  };

  const selectedNode = snapshot?.nodes.find((n) => n.id === selectedNodeId) || null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', background: 'var(--bg-canvas)' }}>
      {/* Navbar */}
      <Navbar
        viewMode={viewMode}
        setViewMode={setViewMode}
        activePreset={activePreset}
        activeSeed={activeSeed}
        healthScore={summary?.network_health_score || snapshot?.network_health_score || 0.94}
        isBackendConnected={isBackendConnected}
        onSeedChange={handleSeedChange}
        onReset={handleReset}
      />

      {/* World Summary Bar */}
      <WorldSummaryBar summary={summary} />

      {/* Main View Area */}
      <main style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
            <div className="mono">Loading FULFILL-X World State...</div>
          </div>
        ) : (
          <>
            {viewMode === '2D' ? (
              <World2DView
                nodes={snapshot?.nodes || []}
                edges={snapshot?.edges || []}
                selectedNodeId={selectedNodeId}
                onSelectNode={setSelectedNodeId}
              />
            ) : (
              <World3DView
                nodes={snapshot?.nodes || []}
                edges={snapshot?.edges || []}
                selectedNodeId={selectedNodeId}
                onSelectNode={setSelectedNodeId}
              />
            )}

            {/* Selected Node Inspector Panel */}
            <NodeInspector
              node={selectedNode}
              edges={snapshot?.edges || []}
              onClose={() => setSelectedNodeId(null)}
              onSelectNode={setSelectedNodeId}
            />
          </>
        )}
      </main>
    </div>
  );
};

export default App;
