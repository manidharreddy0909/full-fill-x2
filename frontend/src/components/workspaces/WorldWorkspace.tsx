/**
 * WorldWorkspace — 3D Digital Twin
 * Phase 13A: Visual Transformation
 *
 * Enhancements:
 * - WorldNodePrimitive: risk-mapped glow, aura, selection beam
 * - FlowEdgePrimitive: directional flow particles, disruption pulse
 * - SceneAtmosphere: fog + calibrated lighting (via SpatialCanvasViewport)
 * - Selected path emphasis: highlight edges connected to selected node
 * - AtmosphereLayer CSS background
 * - Enhanced HUD
 */
import React, { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchWorldSnapshot } from '../../api/worldApi';
import { fetchRiskMap } from '../../api/riskApi';
import { useVisualEnvironmentStore } from '../../store/visualEnvironmentStore';
import { useAppShellStore } from '../../store/appShellStore';
import { useRealtimeStore } from '../../store/realtimeStore';
import { World2DView } from '../world/World2DView';
import { SpatialCanvasViewport } from '../canvas/SpatialCanvasViewport';
import { WorldNodePrimitive } from '../../visual/nodes/WorldNodePrimitive';
import { FlowEdgePrimitive } from '../../visual/edges/FlowEdgePrimitive';
import { NodeInspectorWorkspace } from './NodeInspectorWorkspace';
import { AtmosphereLayer } from '../../visual/atmosphere/AtmosphereLayer';
import { StatusPill } from '../../visual/telemetry/StatusPill';
import { COLOR, riskColor } from '../../visual/tokens';
import { Activity, Layers, Compass, AlertTriangle, Network } from 'lucide-react';

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

  const nodes = snapshot?.nodes ?? [];
  const edges = snapshot?.edges ?? [];

  // Enrich nodes with real composite risk
  const enrichedNodes = useMemo(() =>
    nodes.map((n) => {
      const rtRisk = nodeRisks[n.id]?.composite;
      const composite = rtRisk ?? riskMap?.node_risks[n.id]?.composite ?? n.risk_scores.composite;
      const isDisrupted = n.is_disrupted || composite >= 0.5;
      return { ...n, composite, isDisrupted };
    }),
    [nodes, nodeRisks, riskMap]
  );

  // Derive set of edge IDs connected to the selected node (for path emphasis)
  const highlightedEdgeIds = useMemo(() => {
    if (!selectedNodeId) return new Set<string>();
    const ids = new Set<string>();
    edges.forEach((e) => {
      if (e.source_node_id === selectedNodeId || e.target_node_id === selectedNodeId) {
        ids.add(e.id);
      }
    });
    return ids;
  }, [selectedNodeId, edges]);

  // Summary stats for HUD
  const disruptedCount = enrichedNodes.filter((n) => n.isDisrupted).length;
  const avgRisk = enrichedNodes.length > 0
    ? enrichedNodes.reduce((acc, n) => acc + n.composite, 0) / enrichedNodes.length
    : 0;

  const handleSelectNode = (nodeId: string | null) => {
    setSelectedNodeId(nodeId);
    if (nodeId) {
      navigate(`/world/node/${nodeId}`);
      const n = nodes.find((item) => item.id === nodeId);
      if (n?.position) {
        setCameraTarget(
          [n.position.x, n.position.y + 6, n.position.z + 14],
          [n.position.x, n.position.y, n.position.z]
        );
      }
    } else {
      navigate('/world');
    }
  };

  if (isLoading) {
    return (
      <div
        className="flex h-[calc(100vh-60px)] items-center justify-center"
        style={{ background: '#040813' }}
      >
        <Activity className="w-4 h-4 animate-spin mr-2 text-blue-400" />
        <span className="text-slate-400 font-mono text-xs">
          Loading 3D Supply Chain Digital Twin...
        </span>
      </div>
    );
  }

  return (
    <div
      className="relative overflow-hidden"
      style={{ height: 'calc(100vh - 60px)', background: '#040813' }}
    >
      <AtmosphereLayer mode="WORLD" />

      {/* ── View Mode Toggle + HUD ── */}
      <div
        style={{
          position: 'absolute',
          top: '14px',
          left: '14px',
          zIndex: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {/* View toggle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 10px',
            borderRadius: '10px',
            background: 'rgba(7,15,28,0.88)',
            border: '1px solid rgba(255,255,255,0.09)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <button
            onClick={() => setViewMode(viewMode === '3D' ? '2D' : '3D')}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '5px 10px', borderRadius: '6px',
              background: 'rgba(52,199,123,0.1)', border: '1px solid rgba(52,199,123,0.3)',
              color: '#34d399', fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            {viewMode === '3D' ? <Layers size={12} /> : <Compass size={12} />}
            <span>{viewMode === '3D' ? '2D Map' : '3D Twin'}</span>
          </button>

          <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.08)' }} />

          <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#3d5168' }}>
            {nodes.length}N · {edges.length}E
          </span>
        </div>

        {/* Status pills */}
        <StatusPill
          color={avgRisk >= 0.5 ? COLOR.critical : avgRisk >= 0.25 ? '#f5a623' : COLOR.healthy}
          label="Avg Risk"
          value={`${(avgRisk * 100).toFixed(1)}%`}
          size="sm"
        />
        {disruptedCount > 0 && (
          <StatusPill
            color={COLOR.critical}
            label="Disrupted"
            value={disruptedCount}
            pulse
            size="sm"
          />
        )}
      </div>

      {/* ── Selected node legend (top-right) ── */}
      {selectedNodeId && (
        <div
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            zIndex: 20,
            padding: '8px 12px',
            borderRadius: '8px',
            background: 'rgba(7,15,28,0.90)',
            border: '1px solid rgba(91,147,246,0.35)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Network size={12} color={COLOR.info} />
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#7aabf8' }}>
            {selectedNodeId}
          </span>
          <button
            onClick={() => handleSelectNode(null)}
            style={{
              fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#3d5168',
              background: 'transparent', border: 'none', cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Disruption legend (bottom-left) ── */}
      <div
        style={{
          position: 'absolute',
          bottom: '14px',
          left: '14px',
          zIndex: 20,
          padding: '8px 12px',
          borderRadius: '8px',
          background: 'rgba(7,15,28,0.80)',
          border: '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        {[
          { color: COLOR.healthy,  label: 'Healthy' },
          { color: COLOR.info,     label: 'Low Risk' },
          { color: '#fb923c',      label: 'Warning' },
          { color: COLOR.critical, label: 'Critical' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, boxShadow: `0 0 5px ${color}` }} />
            <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#4a5c72' }}>{label}</span>
          </div>
        ))}
        {disruptedCount > 0 && (
          <>
            <div style={{ width: '1px', height: '14px', background: 'rgba(255,255,255,0.08)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <AlertTriangle size={11} color={COLOR.critical} />
              <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#f87171', fontWeight: 700 }}>
                {disruptedCount} disrupted
              </span>
            </div>
          </>
        )}
      </div>

      {/* ── Main Visualizer ── */}
      {viewMode === '2D' ? (
        <World2DView
          nodes={nodes}
          edges={edges}
          selectedNodeId={selectedNodeId}
          onSelectNode={handleSelectNode}
        />
      ) : (
        <SpatialCanvasViewport showGrid showStars starCount={150}>
          {/* Enhanced nodes */}
          {enrichedNodes.map((n) => {
            const pos: [number, number, number] = n.position
              ? [n.position.x, n.position.y, n.position.z]
              : [0, 0, 0];
            return (
              <WorldNodePrimitive
                key={n.id}
                id={n.id}
                label={n.name}
                nodeType={n.type}
                position={pos}
                riskScore={n.composite}
                isDisrupted={n.isDisrupted}
                isSelected={selectedNodeId === n.id}
                onSelect={handleSelectNode}
              />
            );
          })}

          {/* Enhanced edges with flow + path emphasis */}
          {edges.map((e) => {
            const src = nodes.find((n) => n.id === e.source_node_id);
            const tgt = nodes.find((n) => n.id === e.target_node_id);
            if (!src || !tgt || !src.position || !tgt.position) return null;

            const srcEnriched = enrichedNodes.find((n) => n.id === e.source_node_id);
            const tgtEnriched = enrichedNodes.find((n) => n.id === e.target_node_id);
            const capacity = 1 - Math.max(
              srcEnriched?.composite ?? 0,
              tgtEnriched?.composite ?? 0
            );

            return (
              <FlowEdgePrimitive
                key={e.id}
                id={e.id}
                sourcePos={[src.position.x, src.position.y, src.position.z]}
                targetPos={[tgt.position.x, tgt.position.y, tgt.position.z]}
                isDisrupted={e.is_disrupted}
                isHighlighted={highlightedEdgeIds.has(e.id)}
                capacity={capacity}
              />
            );
          })}
        </SpatialCanvasViewport>
      )}

      {/* ── Node Inspector Drawer ── */}
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
