import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchWorldSnapshot } from '../../api/worldApi';
import { fetchRiskMap } from '../../api/riskApi';
import { useVisualEnvironmentStore } from '../../store/visualEnvironmentStore';
import { useAppShellStore } from '../../store/appShellStore';
import { useRealtimeStore } from '../../store/realtimeStore';
import { World2DView } from '../world/World2DView';
import { SpatialCanvasViewport } from '../canvas/SpatialCanvasViewport';
import { SpatialNodePrimitive } from '../canvas/primitives/SpatialNodePrimitive';
import { SpatialEdgePrimitive } from '../canvas/primitives/SpatialEdgePrimitive';
import { NodeInspectorWorkspace } from './NodeInspectorWorkspace';
import { Activity, Layers, Compass } from 'lucide-react';

export const WorldWorkspace: React.FC = () => {
  const { id: routeNodeId } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { setEnvironmentMode, viewMode, setViewMode, setCameraTarget } = useVisualEnvironmentStore();
  const { selectedNodeId, setSelectedNodeId } = useAppShellStore();
  const { nodeRisks } = useRealtimeStore();

  useEffect(() => {
    setEnvironmentMode('WORLD');
  }, [setEnvironmentMode]);

  useEffect(() => {
    if (routeNodeId && routeNodeId !== selectedNodeId) {
      setSelectedNodeId(routeNodeId);
    }
  }, [routeNodeId, selectedNodeId, setSelectedNodeId]);

  const { data: snapshot, isLoading } = useQuery({
    queryKey: ['worldSnapshot'],
    queryFn: fetchWorldSnapshot,
  });

  const { data: riskMap } = useQuery({
    queryKey: ['riskMap'],
    queryFn: fetchRiskMap,
  });

  const nodes = snapshot?.nodes || [];
  const edges = snapshot?.edges || [];

  // Node Selection Handler
  const handleSelectNode = (nodeId: string | null) => {
    setSelectedNodeId(nodeId);
    if (nodeId) {
      navigate(`/world/node/${nodeId}`);
      // Find node coordinates for camera focus
      const n = nodes.find((item) => item.id === nodeId);
      if (n && n.position) {
        setCameraTarget([n.position.x, n.position.y + 5, n.position.z + 12], [n.position.x, n.position.y, n.position.z]);
      }
    } else {
      navigate('/world');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-60px)] items-center justify-center text-slate-400 font-mono text-xs">
        <Activity className="w-4 h-4 animate-spin mr-2 text-blue-400" />
        <span>Loading 3D Supply Chain Topology Mesh...</span>
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-60px)] w-full overflow-hidden bg-slate-950">
      {/* View Mode & HUD Controls Overlay */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-3 bg-slate-900/85 p-2 rounded-xl border border-slate-800 backdrop-blur-md">
        <button
          onClick={() => setViewMode(viewMode === '3D' ? '2D' : '3D')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600/30 border border-blue-500/50 text-blue-300 text-xs font-mono font-medium hover:bg-blue-600/50 transition-all"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Switch to {viewMode === '3D' ? '2D SVG' : '3D WebGL'} View</span>
        </button>

        <span className="text-[11px] font-mono text-slate-400">
          Nodes: <strong className="text-slate-200">{nodes.length}</strong> | Edges:{' '}
          <strong className="text-slate-200">{edges.length}</strong>
        </span>
      </div>

      {/* Main Visualizer: 2D SVG or 3D WebGL Canvas */}
      {viewMode === '2D' ? (
        <World2DView
          nodes={nodes}
          edges={edges}
          selectedNodeId={selectedNodeId}
          onSelectNode={handleSelectNode}
        />
      ) : (
        <SpatialCanvasViewport>
          {/* Render 3D Nodes */}
          {nodes.map((n) => {
            const pos: [number, number, number] = n.position
              ? [n.position.x, n.position.y, n.position.z]
              : [0, 0, 0];
            const composite = nodeRisks[n.id]?.composite ?? riskMap?.node_risks[n.id]?.composite ?? n.risk_scores.composite;

            return (
              <SpatialNodePrimitive
                key={n.id}
                id={n.id}
                label={n.name}
                nodeType={n.type}
                position={pos}
                riskScore={composite}
                isDisrupted={n.is_disrupted || composite >= 0.5}
                isSelected={selectedNodeId === n.id}
                onSelect={handleSelectNode}
              />
            );
          })}

          {/* Render 3D Edges */}
          {edges.map((e) => {
            const src = nodes.find((n) => n.id === e.source_node_id);
            const tgt = nodes.find((n) => n.id === e.target_node_id);
            if (!src || !tgt || !src.position || !tgt.position) return null;

            return (
              <SpatialEdgePrimitive
                key={e.id}
                id={e.id}
                sourcePos={[src.position.x, src.position.y, src.position.z]}
                targetPos={[tgt.position.x, tgt.position.y, tgt.position.z]}
                isDisrupted={e.is_disrupted}
              />
            );
          })}
        </SpatialCanvasViewport>
      )}

      {/* Node Inspector Drawer when a node is selected */}
      {selectedNodeId && (
        <NodeInspectorWorkspace
          nodeId={selectedNodeId}
          nodes={nodes}
          edges={edges}
          onClose={() => handleSelectNode(null)}
        />
      )}
    </div>
  );
};
