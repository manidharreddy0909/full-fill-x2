/**
 * CommandWorkspace — Operational Control Room
 * Phase 13A: Visual Transformation
 *
 * Layout: TOP status bar → 3-column body (signals | node matrix | actions) → BOTTOM event ticker
 * All data: worldSummary, worldSnapshot, riskMap, realtimeStore (WebSocket events)
 */
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { fetchWorldSummary, fetchWorldSnapshot } from '../../api/worldApi';
import { fetchRiskMap } from '../../api/riskApi';
import { useVisualEnvironmentStore } from '../../store/visualEnvironmentStore';
import { useAppShellStore } from '../../store/appShellStore';
import { useRealtimeStore } from '../../store/realtimeStore';
import { AtmosphereLayer } from '../../visual/atmosphere/AtmosphereLayer';
import { MetricCard } from '../../visual/telemetry/MetricCard';
import { StatusPill } from '../../visual/telemetry/StatusPill';
import { COLOR, riskColor, nodeTypeColor } from '../../visual/tokens';
import {
  Activity, AlertTriangle, ArrowRight, Play, Eye,
  Shield, Zap, Network, Radio, Filter,
} from 'lucide-react';

// ─── Event Ticker Item ────────────────────────────────────────────────────────

const SEVERITY_COLOR: Record<string, string> = {
  CRITICAL: COLOR.critical,
  HIGH:     '#fb923c',
  MEDIUM:   COLOR.info,
  LOW:      '#94a3b8',
  INFO:     '#64748b',
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const CommandWorkspace: React.FC = () => {
  const navigate = useNavigate();
  const { setEnvironmentMode } = useVisualEnvironmentStore();
  const { setSelectedNodeId, openInjector, setWarRoomOpen, setCockpitOpen } = useAppShellStore();
  const { nodeRisks, activeSessionId, connectionStatus, events, networkHealth } = useRealtimeStore();
  const [nodeFilter, setNodeFilter] = useState<'ALL' | 'DISRUPTED' | 'WARNING'>('ALL');

  useEffect(() => {
    setEnvironmentMode('COMMAND');
  }, [setEnvironmentMode]);

  const { data: summary, isLoading: isSummaryLoading, error: summaryError } = useQuery({
    queryKey: ['worldSummary'],
    queryFn: fetchWorldSummary,
  });

  const { data: snapshot, isLoading: isSnapshotLoading } = useQuery({
    queryKey: ['worldSnapshot'],
    queryFn: fetchWorldSnapshot,
  });

  const { data: riskMap } = useQuery({
    queryKey: ['riskMap'],
    queryFn: fetchRiskMap,
  });

  const nodes = snapshot?.nodes ?? [];
  const edges = snapshot?.edges ?? [];
  const healthScore = networkHealth > 0 ? networkHealth
    : riskMap?.network_health ?? summary?.network_health_score ?? 0.94;

  // Enriched node list with composite risk
  const enrichedNodes = nodes.map((n) => {
    const rtRisk = nodeRisks[n.id]?.composite;
    const composite = rtRisk ?? riskMap?.node_risks[n.id]?.composite ?? n.risk_scores.composite;
    const isDisrupted = n.is_disrupted || composite >= 0.5;
    return { ...n, composite, isDisrupted };
  });

  // Top 5 risk signals
  const topRiskNodes = [...enrichedNodes]
    .sort((a, b) => b.composite - a.composite)
    .slice(0, 6);

  // Filtered node matrix
  const filteredNodes = enrichedNodes.filter((n) => {
    if (nodeFilter === 'DISRUPTED') return n.isDisrupted;
    if (nodeFilter === 'WARNING') return n.composite >= 0.25 && !n.isDisrupted;
    return true;
  });

  const disruptedCount = enrichedNodes.filter((n) => n.isDisrupted).length;
  const warningCount   = enrichedNodes.filter((n) => n.composite >= 0.25 && !n.isDisrupted).length;
  const wsLive = connectionStatus === 'CONNECTED';

  if (isSummaryLoading || isSnapshotLoading) {
    return (
      <div className="flex h-[calc(100vh-60px)] items-center justify-center" style={{ background: '#040813' }}>
        <Activity className="w-4 h-4 animate-spin mr-2 text-blue-400" />
        <span className="text-slate-400 font-mono text-xs">Initializing Command OS...</span>
      </div>
    );
  }

  if (summaryError) {
    return (
      <div className="flex h-[calc(100vh-60px)] flex-col items-center justify-center text-red-400 font-mono text-xs p-6 text-center" style={{ background: '#040813' }}>
        <AlertTriangle className="w-8 h-8 mb-2" />
        <span className="font-bold text-sm">Backend Connection Failed</span>
        <span className="text-slate-500 mt-1">Verify backend at http://127.0.0.1:8000</span>
      </div>
    );
  }

  return (
    <div
      className="relative overflow-hidden flex flex-col"
      style={{ height: 'calc(100vh - 60px)', background: '#040813' }}
    >
      <AtmosphereLayer mode="COMMAND" />

      {/* ── TOP STATUS BAR ── */}
      <div
        className="relative flex-shrink-0"
        style={{
          padding: '10px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(7,13,26,0.92)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          zIndex: 10,
        }}
      >
        {/* Left: title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: COLOR.info,
              boxShadow: `0 0 8px ${COLOR.info}`,
              animation: 'fx-dot-pulse 2s ease-in-out infinite',
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              fontWeight: 700,
              color: '#8ab4d4',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Autonomous Command · Operations Center
          </span>
        </div>

        {/* Right: status pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <StatusPill
            color={healthScore >= 0.85 ? COLOR.healthy : healthScore >= 0.6 ? '#f5a623' : COLOR.critical}
            label="Health"
            value={`${(healthScore * 100).toFixed(1)}%`}
            size="sm"
          />
          <StatusPill
            color={wsLive ? COLOR.info : '#4a5c72'}
            label="WS"
            value={wsLive ? 'LIVE' : 'STANDBY'}
            pulse={wsLive}
            size="sm"
          />
          <StatusPill
            color={disruptedCount > 0 ? COLOR.critical : COLOR.healthy}
            label="Disrupted"
            value={disruptedCount}
            size="sm"
          />
          {activeSessionId && (
            <StatusPill
              color={COLOR.intelligence}
              label="Session"
              value={activeSessionId.slice(-8)}
              size="sm"
            />
          )}
        </div>
      </div>

      {/* ── MAIN 3-COLUMN BODY ── */}
      <div
        className="relative flex flex-1 overflow-hidden"
        style={{ zIndex: 2, minHeight: 0 }}
      >
        {/* ── LEFT: Risk Signals ── */}
        <div
          className="flex-shrink-0 flex flex-col overflow-hidden"
          style={{
            width: '240px',
            borderRight: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(7,13,26,0.7)',
          }}
        >
          <div
            style={{
              padding: '12px 14px 8px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
              <AlertTriangle size={12} color={COLOR.critical} />
              <span
                style={{
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                }}
              >
                Risk Signals
              </span>
            </div>
            <span style={{ fontSize: '10px', color: '#4a5c72', fontFamily: 'var(--font-mono)' }}>
              Top {topRiskNodes.length} critical nodes
            </span>
          </div>

          <div className="overflow-y-auto flex-1" style={{ padding: '8px' }}>
            {topRiskNodes.map((n, idx) => {
              const color = riskColor(n.composite, n.isDisrupted);
              return (
                <div
                  key={n.id}
                  onClick={() => { setSelectedNodeId(n.id); navigate(`/world/node/${n.id}`); }}
                  style={{
                    padding: '10px 10px',
                    borderRadius: '8px',
                    marginBottom: '6px',
                    background: `${color}0c`,
                    border: `1px solid ${color}25`,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLDivElement).style.borderColor = `${color}50`}
                  onMouseLeave={(e) => (e.currentTarget as HTMLDivElement).style.borderColor = `${color}25`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span
                      style={{
                        fontSize: '9px',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        color: '#64748b',
                      }}
                    >
                      #{idx + 1}
                    </span>
                    <span
                      style={{
                        fontSize: '10px',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        color,
                      }}
                    >
                      {(n.composite * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      color: '#c8daea',
                      marginBottom: '2px',
                    }}
                  >
                    {n.id}
                  </div>
                  <div style={{ fontSize: '10px', color: '#4a5c72', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {n.name}
                  </div>
                  {/* Risk bar */}
                  <div
                    style={{
                      height: '2px',
                      borderRadius: '1px',
                      background: 'rgba(255,255,255,0.06)',
                      marginTop: '6px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${n.composite * 100}%`,
                        background: `linear-gradient(90deg, ${color}80, ${color})`,
                        borderRadius: '1px',
                        transition: 'width 0.5s ease',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Left bottom: Quick Actions */}
          <div
            style={{
              padding: '10px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <button
              onClick={() => openInjector()}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 10px', borderRadius: '7px',
                background: 'rgba(232,80,58,0.1)',
                border: '1px solid rgba(232,80,58,0.3)',
                color: '#f87171', fontSize: '11px', fontFamily: 'var(--font-mono)',
                fontWeight: 600, cursor: 'pointer', width: '100%', transition: 'all 0.15s',
              }}
            >
              <AlertTriangle size={12} />
              Inject Signal
            </button>
            <button
              onClick={() => setWarRoomOpen(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 10px', borderRadius: '7px',
                background: 'rgba(124,58,237,0.1)',
                border: '1px solid rgba(124,58,237,0.3)',
                color: '#a78bfa', fontSize: '11px', fontFamily: 'var(--font-mono)',
                fontWeight: 600, cursor: 'pointer', width: '100%', transition: 'all 0.15s',
              }}
            >
              <Play size={12} />
              War Room
            </button>
            <button
              onClick={() => setCockpitOpen(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 10px', borderRadius: '7px',
                background: 'rgba(59,130,246,0.1)',
                border: '1px solid rgba(59,130,246,0.3)',
                color: '#60a5fa', fontSize: '11px', fontFamily: 'var(--font-mono)',
                fontWeight: 600, cursor: 'pointer', width: '100%', transition: 'all 0.15s',
              }}
            >
              <Eye size={12} />
              Decision Cockpit
            </button>
          </div>
        </div>

        {/* ── CENTER: Node Topology Matrix ── */}
        <div
          className="flex-1 flex flex-col overflow-hidden"
          style={{ minWidth: 0 }}
        >
          {/* Center header */}
          <div
            style={{
              padding: '10px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '8px',
              background: 'rgba(7,13,26,0.5)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Network size={13} color={COLOR.info} />
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#8ab4d4' }}>
                Network Node Matrix
              </span>
              <span
                style={{
                  fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 600,
                  padding: '2px 7px', borderRadius: '4px',
                  background: 'rgba(56,189,248,0.1)', color: '#67e8f9',
                  border: '1px solid rgba(56,189,248,0.2)',
                }}
              >
                {nodes.length} nodes · {edges.length} edges
              </span>
            </div>

            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: '4px' }}>
              {(['ALL', 'DISRUPTED', 'WARNING'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setNodeFilter(f)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '5px',
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    border: '1px solid',
                    background: nodeFilter === f ? 'rgba(56,189,248,0.12)' : 'transparent',
                    borderColor: nodeFilter === f ? 'rgba(56,189,248,0.4)' : 'rgba(255,255,255,0.08)',
                    color: nodeFilter === f ? '#38bdf8' : '#4a5c72',
                  }}
                >
                  {f === 'ALL' ? `All (${nodes.length})` : f === 'DISRUPTED' ? `Disrupted (${disruptedCount})` : `Warning (${warningCount})`}
                </button>
              ))}

              <button
                onClick={() => navigate('/world')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  padding: '4px 10px', borderRadius: '5px',
                  fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 600,
                  cursor: 'pointer', border: '1px solid rgba(91,147,246,0.3)',
                  background: 'rgba(91,147,246,0.08)', color: '#7aabf8',
                  transition: 'all 0.15s',
                }}
              >
                <span>3D View</span>
                <ArrowRight size={10} />
              </button>
            </div>
          </div>

          {/* KPI row */}
          <div
            style={{
              padding: '10px 14px',
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '8px',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              flexShrink: 0,
            }}
          >
            <MetricCard
              label="Health Score"
              value={`${(healthScore * 100).toFixed(1)}%`}
              fill={healthScore}
              color={healthScore >= 0.85 ? COLOR.healthy : healthScore >= 0.6 ? '#f5a623' : COLOR.critical}
            />
            <MetricCard
              label="Disrupted"
              value={disruptedCount}
              color={disruptedCount > 0 ? COLOR.critical : COLOR.healthy}
            />
            <MetricCard
              label="Warning"
              value={warningCount}
              color={warningCount > 0 ? '#f5a623' : COLOR.healthy}
            />
            <MetricCard
              label="Events (WS)"
              value={events.length}
              color={COLOR.info}
            />
          </div>

          {/* Node grid */}
          <div
            className="overflow-y-auto flex-1"
            style={{ padding: '12px 14px' }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))',
                gap: '8px',
              }}
            >
              {filteredNodes.map((node) => {
                const color = riskColor(node.composite, node.isDisrupted);
                const typeColor = nodeTypeColor(node.type);
                return (
                  <div
                    key={node.id}
                    onClick={() => { setSelectedNodeId(node.id); navigate(`/world/node/${node.id}`); }}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: node.isDisrupted
                        ? 'rgba(25,4,4,0.7)'
                        : node.composite >= 0.25
                        ? 'rgba(20,12,3,0.7)'
                        : 'rgba(7,15,28,0.6)',
                      border: `1px solid ${color}30`,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.borderColor = `${color}60`;
                      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.borderColor = `${color}30`;
                      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                    }}
                  >
                    {/* Node type accent strip */}
                    <div
                      style={{
                        position: 'absolute', top: 0, left: 0, right: 0,
                        height: '2px',
                        background: `linear-gradient(90deg, ${typeColor}80, transparent)`,
                      }}
                    />

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#b8d0e8' }}>
                        {node.id}
                      </span>
                      <span
                        style={{
                          fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: 700,
                          padding: '1px 5px', borderRadius: '3px',
                          background: node.isDisrupted ? 'rgba(232,80,58,0.2)' : 'rgba(52,199,123,0.12)',
                          color: node.isDisrupted ? '#f87171' : '#34d399',
                        }}
                      >
                        {node.isDisrupted ? 'DISRUPTED' : 'OK'}
                      </span>
                    </div>

                    <div style={{ fontSize: '10px', color: '#4a5c72', fontFamily: 'var(--font-mono)', marginBottom: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {node.name}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>
                      <span style={{ color }}>Risk: {(node.composite * 100).toFixed(0)}%</span>
                      <span style={{ color: '#3d5168' }}>Inv: {node.inventory_level.toFixed(0)}</span>
                    </div>

                    {/* Risk bar */}
                    <div style={{ height: '2px', borderRadius: '1px', background: 'rgba(255,255,255,0.05)', marginTop: '5px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${node.composite * 100}%`, background: color, borderRadius: '1px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Intelligence + Navigation ── */}
        <div
          className="flex-shrink-0 flex flex-col overflow-hidden"
          style={{
            width: '220px',
            borderLeft: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(7,13,26,0.7)',
          }}
        >
          <div
            style={{
              padding: '12px 14px 8px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={12} color={COLOR.intelligence} />
              <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Intelligence
              </span>
            </div>
          </div>

          <div className="overflow-y-auto flex-1" style={{ padding: '10px' }}>
            {/* Intelligence module links */}
            {[
              { label: 'Risk Heatmap', path: '/intelligence/risk', color: COLOR.critical, icon: <AlertTriangle size={11} /> },
              { label: 'GNN Propagation', path: '/intelligence/gnn', color: '#7c3aed', icon: <Network size={11} /> },
              { label: 'Causal Analysis', path: '/intelligence/causal', color: '#818cf8', icon: <Zap size={11} /> },
              { label: 'Agent Constellation', path: '/intelligence', color: COLOR.info, icon: <Radio size={11} /> },
              { label: 'War Room', path: '/response/war-room', color: '#f87171', icon: <Shield size={11} /> },
              { label: 'Digital Twin', path: '/simulation/twin', color: '#22d3ee', icon: <Filter size={11} /> },
              { label: 'Evaluation', path: '/evaluation', color: '#fbbf24', icon: <Activity size={11} /> },
            ].map(({ label, path, color, icon }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  width: '100%', padding: '8px 10px', borderRadius: '7px', marginBottom: '5px',
                  background: `${color}0a`, border: `1px solid ${color}20`,
                  cursor: 'pointer', transition: 'all 0.15s',
                  color: `${color}cc`,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = `${color}40`;
                  (e.currentTarget as HTMLButtonElement).style.color = color;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = `${color}20`;
                  (e.currentTarget as HTMLButtonElement).style.color = `${color}cc`;
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {icon}
                  <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    {label}
                  </span>
                </div>
                <ArrowRight size={10} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── BOTTOM EVENT TICKER ── */}
      <div
        className="relative flex-shrink-0"
        style={{
          height: '32px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(5,10,20,0.95)',
          backdropFilter: 'blur(8px)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          zIndex: 10,
        }}
      >
        {/* Label */}
        <div
          style={{
            flexShrink: 0,
            padding: '0 12px',
            borderRight: '1px solid rgba(255,255,255,0.06)',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(56,189,248,0.06)',
          }}
        >
          <Radio size={11} color={COLOR.info} />
          <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Live Events
          </span>
        </div>

        {/* Scrolling ticker */}
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          {events.length === 0 ? (
            <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#2a3d52', padding: '0 16px' }}>
              Waiting for WebSocket events...
            </span>
          ) : (
            <div className="event-ticker-track">
              {[...events, ...events].slice(0, 20).map((evt, i) => {
                const color = SEVERITY_COLOR[evt.severity] ?? '#4a5c72';
                return (
                  <span
                    key={`${evt.event_id}-${i}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      marginRight: '32px',
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      color: '#546880',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span style={{ color, fontWeight: 700 }}>{evt.severity}</span>
                    <span style={{ color: '#2a3d52' }}>·</span>
                    <span>{evt.event_type}</span>
                    {evt.stage && (
                      <span style={{ color: '#3d5168' }}>@{evt.stage}</span>
                    )}
                    <span style={{ color: '#2a3d52' }}>·</span>
                    <span style={{ color: '#38424e' }}>{new Date(evt.timestamp).toLocaleTimeString()}</span>
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
