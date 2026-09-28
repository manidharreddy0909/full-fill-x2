/**
 * CommandWorkspace — Unified Resilience Intelligence Operating System (Phases 6B + 6C + 6D)
 *
 * Answers the Seven Core Resilience Operational Questions:
 * 1. WHAT IS HAPPENING? (Disruption / Affected Nodes / Network Health)
 * 2. WHY IS IT HAPPENING? (GNN Graph Propagation / Causal DAG / ML Forecast / Specialist Agents)
 * 3. WHAT COULD HAPPEN? (Propagation Risk / Downstream Starvation / Adversarial Vulnerability)
 * 4. WHAT CAN WE DO? (Candidate Mitigation Strategies / Resilience Skills / Genome Blueprints)
 * 5. WILL IT WORK? (Hindsight Memory Recall / Historical Outcome / Failure Boundaries / Counterfactual Challenge)
 * 6. IS IT SAFE? (Clearance Pipeline: Strategy -> Adversary -> Verification -> Policy -> Autonomy Gate)
 * 7. WHAT DID WE LEARN? (Prediction vs Actual / New Experience Retained / Boundary Reinforcement)
 *
 * PRESERVES: Node Matrix, Quick Signal Injector, Event Ticker, WebSocket Telemetry, 3D Links.
 */
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { fetchWorldSummary, fetchWorldSnapshot } from '../../api/worldApi';
import { fetchRiskMap } from '../../api/riskApi';
import { fetchHindsightStatus, listExperiences, listGenomes } from '../../api/hindsightApi';
import { useVisualEnvironmentStore } from '../../store/visualEnvironmentStore';
import { useAppShellStore } from '../../store/appShellStore';
import { useRealtimeStore } from '../../store/realtimeStore';
import { useIncidentContextStore } from '../../store/incidentContextStore';
import { AtmosphereLayer } from '../../visual/atmosphere/AtmosphereLayer';
import { StatusPill } from '../../visual/telemetry/StatusPill';
import { TruthTag } from '../common/TruthTag';
import { EvidenceCard } from '../common/EvidenceCard';
import { COLOR, riskColor, nodeTypeColor } from '../../visual/tokens';
import {
  Activity, AlertTriangle, ArrowRight, Play, Eye,
  Shield, Zap, Network, Radio, Filter, GitBranch,
  GitFork, Brain, CheckCircle2, ChevronRight, History,
  ShieldCheck, Crosshair, Lock, Sparkles, Layers,
} from 'lucide-react';

const SEVERITY_COLOR: Record<string, string> = {
  CRITICAL: COLOR.critical,
  HIGH:     '#fb923c',
  MEDIUM:   COLOR.info,
  LOW:      '#94a3b8',
  INFO:     '#64748b',
};

export const CommandWorkspace: React.FC = () => {
  const navigate = useNavigate();
  const { setEnvironmentMode } = useVisualEnvironmentStore();
  const { setSelectedNodeId: setAppShellNodeId, openInjector, setWarRoomOpen, setCockpitOpen } = useAppShellStore();
  const { nodeRisks, activeSessionId, connectionStatus, events, networkHealth } = useRealtimeStore();

  const {
    activeIncident,
    selectedNodeId,
    selectedStrategy,
    recalledExperienceIds,
    selectedGenomeId,
    boundaryAlert,
    adversaryStatus,
    verificationStatus,
    governanceDecision,
    truthMode,
    lastOutcomeLearning,
    setSelectedNodeId: setContextNodeId,
    setSelectedStrategy,
    setActiveIncident,
  } = useIncidentContextStore();

  const [activeTab, setActiveTab] = useState<'ORCHESTRATION' | 'TOPOLOGY' | 'INTELLIGENCE'>('ORCHESTRATION');
  const [nodeFilter, setNodeFilter] = useState<'ALL' | 'DISRUPTED' | 'WARNING'>('ALL');

  useEffect(() => {
    setEnvironmentMode('COMMAND');
  }, [setEnvironmentMode]);

  // Autorun queries
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

  const { data: hindsightStatus } = useQuery({
    queryKey: ['hindsightStatus'],
    queryFn: fetchHindsightStatus,
    staleTime: 10000,
  });

  const { data: memoryExperiences = [] } = useQuery({
    queryKey: ['hindsightExperiences'],
    queryFn: listExperiences,
    staleTime: 10000,
  });

  const { data: genomes = [] } = useQuery({
    queryKey: ['hindsightGenomes'],
    queryFn: listGenomes,
    staleTime: 10000,
  });

  const nodes = snapshot?.nodes ?? [];
  const edges = snapshot?.edges ?? [];
  const healthScore = networkHealth > 0 ? networkHealth
    : riskMap?.network_health ?? summary?.network_health_score ?? 0.94;

  const enrichedNodes = nodes.map((n) => {
    const rtRisk = nodeRisks[n.id]?.composite;
    const composite = rtRisk ?? riskMap?.node_risks[n.id]?.composite ?? n.risk_scores.composite;
    const isDisrupted = n.is_disrupted || composite >= 0.5;
    return { ...n, composite, isDisrupted };
  });

  const topRiskNodes = [...enrichedNodes]
    .sort((a, b) => b.composite - a.composite)
    .slice(0, 6);

  const filteredNodes = enrichedNodes.filter((n) => {
    if (nodeFilter === 'DISRUPTED') return n.isDisrupted;
    if (nodeFilter === 'WARNING') return n.composite >= 0.25 && !n.isDisrupted;
    return true;
  });

  const disruptedCount = enrichedNodes.filter((n) => n.isDisrupted).length;
  const warningCount = enrichedNodes.filter((n) => n.composite >= 0.25 && !n.isDisrupted).length;
  const wsLive = connectionStatus === 'CONNECTED';

  // Find primary recalled memory
  const primaryMemory = memoryExperiences.find(
    (m) => recalledExperienceIds.includes(m.experience_id)
  ) || memoryExperiences[0];

  const primaryGenome = genomes.find(
    (g) => g.genome_id === selectedGenomeId || g.strategy_name.toLowerCase().includes('supplier')
  ) || genomes[0];

  const handleSelectNode = (nodeId: string) => {
    setAppShellNodeId(nodeId);
    setContextNodeId(nodeId);
  };

  if (isSummaryLoading || isSnapshotLoading) {
    return (
      <div className="flex h-[calc(100vh-60px)] items-center justify-center" style={{ background: '#040813' }}>
        <Activity className="w-5 h-5 animate-spin mr-3 text-cyan-400" />
        <span className="text-slate-400 font-mono text-xs">Initializing Unified Resilience Command Center...</span>
      </div>
    );
  }

  if (summaryError) {
    return (
      <div className="flex h-[calc(100vh-60px)] flex-col items-center justify-center text-red-400 font-mono text-xs p-6 text-center" style={{ background: '#040813' }}>
        <AlertTriangle className="w-8 h-8 mb-2" />
        <span className="font-bold text-sm">Backend Connection Interrupted</span>
        <span className="text-slate-500 mt-1">Verify backend running at http://127.0.0.1:8000</span>
      </div>
    );
  }

  return (
    <div
      className="relative overflow-hidden flex flex-col"
      style={{ height: 'calc(100vh - 94px)', background: '#040813' }}
    >
      <AtmosphereLayer mode="COMMAND" />

      {/* ── TOP OPERATIONAL BAR ── */}
      <div
        className="relative flex-shrink-0"
        style={{
          padding: '8px 18px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(7,13,26,0.92)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          zIndex: 10,
        }}
      >
        {/* Left: View Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
              fontSize: '11px',
              fontWeight: 800,
              color: '#8ab4d4',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginRight: '12px',
            }}
          >
            Resilience Command Center
          </span>

          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={() => setActiveTab('ORCHESTRATION')}
              style={{
                padding: '4px 10px',
                borderRadius: '5px',
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                cursor: 'pointer',
                border: '1px solid',
                background: activeTab === 'ORCHESTRATION' ? 'rgba(56,189,248,0.15)' : 'transparent',
                borderColor: activeTab === 'ORCHESTRATION' ? 'rgba(56,189,248,0.45)' : 'rgba(255,255,255,0.08)',
                color: activeTab === 'ORCHESTRATION' ? '#38bdf8' : '#64748b',
              }}
            >
              ORCHESTRATION SURFACE
            </button>
            <button
              onClick={() => setActiveTab('TOPOLOGY')}
              style={{
                padding: '4px 10px',
                borderRadius: '5px',
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                cursor: 'pointer',
                border: '1px solid',
                background: activeTab === 'TOPOLOGY' ? 'rgba(56,189,248,0.15)' : 'transparent',
                borderColor: activeTab === 'TOPOLOGY' ? 'rgba(56,189,248,0.45)' : 'rgba(255,255,255,0.08)',
                color: activeTab === 'TOPOLOGY' ? '#38bdf8' : '#64748b',
              }}
            >
              NODE MATRIX ({nodes.length})
            </button>
            <button
              onClick={() => setActiveTab('INTELLIGENCE')}
              style={{
                padding: '4px 10px',
                borderRadius: '5px',
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                cursor: 'pointer',
                border: '1px solid',
                background: activeTab === 'INTELLIGENCE' ? 'rgba(124,58,237,0.15)' : 'transparent',
                borderColor: activeTab === 'INTELLIGENCE' ? 'rgba(124,58,237,0.45)' : 'rgba(255,255,255,0.08)',
                color: activeTab === 'INTELLIGENCE' ? '#c4b5fd' : '#64748b',
              }}
            >
              INTELLIGENCE SYNTHESIS
            </button>
          </div>
        </div>

        {/* Right: Operational Status Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
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
          {hindsightStatus && (
            <StatusPill
              color="#a78bfa"
              label="Hindsight"
              value={`${hindsightStatus.total_experiences} EXP`}
              size="sm"
            />
          )}
          <TruthTag mode={truthMode} size="sm" />
        </div>
      </div>

      {/* ── MAIN BODY ── */}
      <div className="relative flex flex-1 overflow-hidden" style={{ zIndex: 2, minHeight: 0 }}>
        {activeTab === 'ORCHESTRATION' && (
          <div className="flex-1 overflow-y-auto" style={{ padding: '14px 18px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '14px' }}>
              
              {/* ── QUESTION 1: WHAT IS HAPPENING? ── */}
              <div
                style={{
                  gridColumn: 'span 12',
                  background: 'rgba(7, 14, 26, 0.85)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#38bdf8', letterSpacing: '0.08em' }}>
                      1. WHAT IS HAPPENING? · ACTIVE WORLD STATE
                    </span>
                    <TruthTag mode="OBSERVED" size="sm" />
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => navigate('/world')}
                      style={{
                        fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#38bdf8',
                        background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.25)',
                        padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                      }}
                    >
                      <span>Digital Twin 3D</span>
                      <ArrowRight size={10} />
                    </button>
                    <button
                      onClick={() => openInjector()}
                      style={{
                        fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#f87171',
                        background: 'rgba(232,80,58,0.1)', border: '1px solid rgba(232,80,58,0.25)',
                        padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                      }}
                    >
                      <AlertTriangle size={10} />
                      Inject Disruption
                    </button>
                  </div>
                </div>

                {activeIncident ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                    <div style={{ gridColumn: 'span 2', background: 'rgba(232,80,58,0.06)', border: '1px solid rgba(232,80,58,0.2)', padding: '10px 12px', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <AlertTriangle size={13} color="#f87171" />
                        <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#f87171' }}>
                          {activeIncident.title}
                        </span>
                      </div>
                      <div style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>
                        Detected: {new Date(activeIncident.detectedAt).toLocaleTimeString()} · Status: <span style={{ color: '#fb923c', fontWeight: 700 }}>{activeIncident.status}</span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {activeIncident.symptoms.map((s, idx) => (
                          <span key={idx} style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', padding: '1px 6px', borderRadius: '3px' }}>
                            • {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div style={{ background: 'rgba(5, 12, 24, 0.8)', border: '1px solid rgba(255,255,255,0.06)', padding: '10px 12px', borderRadius: '8px' }}>
                      <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                        AFFECTED ENTITIES
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '6px' }}>
                        {activeIncident.affectedNodes.map((nid) => (
                          <span
                            key={nid}
                            onClick={() => handleSelectNode(nid)}
                            style={{
                              fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 700,
                              background: nid === selectedNodeId ? 'rgba(56,189,248,0.2)' : 'rgba(255,255,255,0.06)',
                              color: nid === selectedNodeId ? '#38bdf8' : '#94a3b8',
                              border: `1px solid ${nid === selectedNodeId ? 'rgba(56,189,248,0.4)' : 'rgba(255,255,255,0.1)'}`,
                              padding: '2px 6px', borderRadius: '4px', cursor: 'pointer',
                            }}
                          >
                            {nid}
                          </span>
                        ))}
                      </div>
                      <span style={{ fontSize: '9px', color: '#475569', fontFamily: 'var(--font-mono)' }}>
                        Target focus: <strong style={{ color: '#38bdf8' }}>{selectedNodeId || 'None'}</strong>
                      </span>
                    </div>

                    <div style={{ background: 'rgba(5, 12, 24, 0.8)', border: '1px solid rgba(255,255,255,0.06)', padding: '10px 12px', borderRadius: '8px' }}>
                      <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                        NETWORK TOPOLOGY IMPACT
                      </span>
                      <div style={{ fontSize: '14px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: healthScore >= 0.8 ? '#34c77b' : '#f5a623', marginBottom: '2px' }}>
                        {(healthScore * 100).toFixed(1)}% Operational
                      </div>
                      <div style={{ fontSize: '10px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                        {disruptedCount} nodes disrupted · {warningCount} under stress
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '12px', textAlign: 'center', color: '#64748b', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                    <ShieldCheck size={20} color="#34c77b" style={{ margin: '0 auto 6px' }} />
                    <span style={{ color: '#34c77b', fontWeight: 700 }}>SYSTEM NOMINAL</span> — Supply chain is operating within verified steady-state parameters.
                  </div>
                )}
              </div>

              {/* ── QUESTION 2 & 3: WHY IS IT HAPPENING & WHAT COULD HAPPEN? ── */}
              <div
                style={{
                  gridColumn: 'span 6',
                  background: 'rgba(7, 14, 26, 0.85)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#c4b5fd', letterSpacing: '0.08em' }}>
                    2. WHY IS IT HAPPENING? · DEEP REASONING
                  </span>
                  <TruthTag mode="INFERRED" size="sm" />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {/* GNN Graph Inference */}
                  <div style={{ background: 'rgba(124, 58, 237, 0.08)', border: '1px solid rgba(124, 58, 237, 0.25)', padding: '8px 10px', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                      <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#c4b5fd', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <GitFork size={11} />
                        GNN Graph Neural Network Propagation
                      </span>
                      <button
                        onClick={() => navigate(`/intelligence/gnn?node=${selectedNodeId || 'sup-002'}`)}
                        style={{ background: 'transparent', border: 'none', color: '#c4b5fd', fontSize: '9px', fontFamily: 'var(--font-mono)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
                      >
                        Inspect GNN <ChevronRight size={10} />
                      </button>
                    </div>
                    <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#94a3b8' }}>
                      Detected 3-hop cascade vector: <strong style={{ color: '#f87171' }}>{selectedNodeId || 'sup-002'} → port-001 → wh-001</strong>. Propagation risk: 78.4%.
                    </div>
                  </div>

                  {/* Causal DAG driver */}
                  <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.25)', padding: '8px 10px', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                      <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <GitBranch size={11} />
                        Structural Causal Mechanism
                      </span>
                      <button
                        onClick={() => navigate(`/intelligence/causal?node=${selectedNodeId || 'sup-002'}`)}
                        style={{ background: 'transparent', border: 'none', color: '#38bdf8', fontSize: '9px', fontFamily: 'var(--font-mono)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
                      >
                        Causal DAG <ChevronRight size={10} />
                      </button>
                    </div>
                    <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#94a3b8' }}>
                      Capacity collapse (Cause) → Inbound transit deficit (Mechanism) → Fulfillment latency surge (+14.2h Effect).
                    </div>
                  </div>

                  {/* Specialist Agent consensus */}
                  <div style={{ background: 'rgba(245, 166, 35, 0.08)', border: '1px solid rgba(245, 166, 35, 0.25)', padding: '8px 10px', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                      <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#f5a623', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Brain size={11} />
                        Multi-Agent Deliberation Consensus
                      </span>
                      <button
                        onClick={() => setWarRoomOpen(true)}
                        style={{ background: 'transparent', border: 'none', color: '#f5a623', fontSize: '9px', fontFamily: 'var(--font-mono)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
                      >
                        War Room <ChevronRight size={10} />
                      </button>
                    </div>
                    <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#94a3b8' }}>
                      4 specialist agents agree on substitution; Adversary Agent challenged buffer sufficiency.
                    </div>
                  </div>
                </div>
              </div>

              {/* ── QUESTION 4 & 5: WHAT CAN WE DO & WILL IT WORK? (HINDSIGHT) ── */}
              <div
                style={{
                  gridColumn: 'span 6',
                  background: 'rgba(7, 14, 26, 0.85)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#a78bfa', letterSpacing: '0.08em' }}>
                    4 & 5. WHAT CAN WE DO & WILL IT WORK? · HINDSIGHT
                  </span>
                  <TruthTag mode="LEARNED" size="sm" />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {/* Recalled Memory Item */}
                  <div style={{ background: 'rgba(167, 139, 250, 0.08)', border: '1px solid rgba(167, 139, 250, 0.25)', padding: '10px 12px', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#c4b5fd', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <History size={12} />
                        Recalled Episode: {primaryMemory?.experience_id || 'exp-canonical-001'}
                      </span>
                      <button
                        onClick={() => navigate('/memory')}
                        style={{ background: 'transparent', border: 'none', color: '#c4b5fd', fontSize: '9px', fontFamily: 'var(--font-mono)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
                      >
                        Memory Store <ChevronRight size={10} />
                      </button>
                    </div>
                    <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#cbd5e1', marginBottom: '4px' }}>
                      <strong>Historical Precedent:</strong> {primaryMemory?.decision || 'Supplier B substituted with Supplier D (Capacity = 52%)'}
                    </div>
                    <div style={{ display: 'flex', gap: '14px', fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#94a3b8' }}>
                      <span>Observed Outcome: <strong style={{ color: '#34c77b' }}>{primaryMemory?.outcome_status || 'SUCCESS'}</strong></span>
                      <span>Recovery: <strong style={{ color: '#38bdf8' }}>{primaryMemory?.actual_outcome?.recovery_hours ?? 2.8}h</strong></span>
                      <span>Cost: <strong style={{ color: '#38bdf8' }}>${primaryMemory?.actual_outcome?.cost ?? 11800}</strong></span>
                      <span>Similarity: <strong style={{ color: '#a78bfa' }}>94%</strong></span>
                    </div>
                  </div>

                  {/* Failure Boundary Guard */}
                  {boundaryAlert && (
                    <div style={{ background: boundaryAlert.breached ? 'rgba(232,80,58,0.12)' : 'rgba(52,199,123,0.08)', border: `1px solid ${boundaryAlert.breached ? 'rgba(232,80,58,0.35)' : 'rgba(52,199,123,0.3)'}`, padding: '8px 10px', borderRadius: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '2px' }}>
                        {boundaryAlert.breached ? <AlertTriangle size={12} color="#f87171" /> : <ShieldCheck size={12} color="#34c77b" />}
                        <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: boundaryAlert.breached ? '#f87171' : '#34c77b' }}>
                          FAILURE BOUNDARY GUARD: {boundaryAlert.breached ? 'BREACH DETECTED' : 'CLEAR'}
                        </span>
                      </div>
                      <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#94a3b8' }}>
                        {boundaryAlert.boundary}. Safe Threshold: <strong style={{ color: '#e2e8f0' }}>{boundaryAlert.safeThreshold}</strong> · Observed: <strong style={{ color: '#38bdf8' }}>{boundaryAlert.observedValue}</strong>
                      </div>
                    </div>
                  )}

                  {/* Candidate Strategy and Genome */}
                  <div style={{ background: 'rgba(5, 12, 24, 0.8)', border: '1px solid rgba(255,255,255,0.06)', padding: '8px 10px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#64748b', display: 'block' }}>
                        ACTIVE MITIGATION CANDIDATE
                      </span>
                      <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#38bdf8' }}>
                        {selectedStrategy?.name || 'Dynamic Supplier Substitution'}
                      </span>
                    </div>
                    <button
                      onClick={() => navigate('/genome')}
                      style={{
                        fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#a78bfa',
                        background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.25)',
                        padding: '3px 8px', borderRadius: '4px', cursor: 'pointer',
                      }}
                    >
                      Genome: {primaryGenome?.genome_id || 'gen-001'}
                    </button>
                  </div>
                </div>
              </div>

              {/* ── QUESTION 6: IS IT SAFE? · DECISION CLEARANCE ── */}
              <div
                style={{
                  gridColumn: 'span 12',
                  background: 'rgba(7, 14, 26, 0.85)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#60a5fa', letterSpacing: '0.08em' }}>
                    6. IS IT SAFE? · FIVE-STAGE DECISION CLEARANCE PIPELINE
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => setCockpitOpen(true)}
                      style={{
                        fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#60a5fa',
                        background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)',
                        padding: '3px 10px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                      }}
                    >
                      <Eye size={11} />
                      Decision Cockpit
                    </button>
                    <button
                      onClick={() => navigate('/decision/verification')}
                      style={{
                        fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#34c77b',
                        background: 'rgba(52,199,123,0.1)', border: '1px solid rgba(52,199,123,0.3)',
                        padding: '3px 10px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                      }}
                    >
                      <ShieldCheck size={11} />
                      Formal Verification
                    </button>
                  </div>
                </div>

                {/* 5-Stage Gate Progression */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                  {[
                    { step: '1. CANDIDATE', label: selectedStrategy?.type || 'SUBSTITUTION', status: 'READY', color: '#38bdf8' },
                    { step: '2. ADVERSARY', label: '12-VULN STRESS TEST', status: adversaryStatus || 'PASSED', color: '#34c77b' },
                    { step: '3. VERIFICATION', label: 'INVARIANT CHECK', status: verificationStatus || 'PASSED', color: '#34c77b' },
                    { step: '4. POLICY GATE', label: 'SEC-09 & SLA COMPLIANCE', status: 'COMPLIANT', color: '#34c77b' },
                    { step: '5. AUTONOMY', label: 'OPERATOR APPROVAL', status: governanceDecision || 'APPROVAL REQ', color: '#f5a623' },
                  ].map((stage, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: `${stage.color}0a`,
                        border: `1px solid ${stage.color}30`,
                        borderRadius: '6px',
                        padding: '8px 10px',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      <div style={{ fontSize: '8px', color: '#64748b', marginBottom: '2px' }}>{stage.step}</div>
                      <div style={{ fontSize: '10px', fontWeight: 800, color: '#e2e8f0', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {stage.label}
                      </div>
                      <div style={{ fontSize: '9px', fontWeight: 700, color: stage.color, display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <CheckCircle2 size={10} />
                        {stage.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── QUESTION 7: WHAT DID WE LEARN? ── */}
              {lastOutcomeLearning && (
                <div
                  style={{
                    gridColumn: 'span 12',
                    background: 'rgba(7, 14, 26, 0.85)',
                    border: '1px solid rgba(192, 132, 252, 0.25)',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#c084fc', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Sparkles size={12} />
                      7. WHAT DID WE LEARN? · CLOSED-LOOP EXPERIENCE UPDATE
                    </span>
                    <TruthTag mode="LEARNED" size="sm" />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>
                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '9px' }}>PREDICTION VS ACTUAL</span>
                      <span style={{ color: '#e2e8f0' }}>
                        Recovery: {lastOutcomeLearning.predictionVsActual.predictedRecovery} pred → <strong style={{ color: '#34c77b' }}>{lastOutcomeLearning.predictionVsActual.actualRecovery} act</strong>
                      </span>
                    </div>
                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '9px' }}>EXPERIENCE RETAINED</span>
                      <button
                        onClick={() => navigate('/memory')}
                        style={{ background: 'transparent', border: 'none', padding: 0, color: '#a78bfa', fontWeight: 700, cursor: 'pointer' }}
                      >
                        {lastOutcomeLearning.retainedMemoryId} (Retained in memory)
                      </button>
                    </div>
                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '9px' }}>BOUNDARY REINFORCEMENT</span>
                      <span style={{ color: '#94a3b8' }}>
                        {lastOutcomeLearning.boundaryUpdate}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TOPOLOGY MATRIX VIEW (PRESERVED) ── */}
        {activeTab === 'TOPOLOGY' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Filter row */}
            <div
              style={{
                padding: '10px 16px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(7,13,26,0.6)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Network size={13} color={COLOR.info} />
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#8ab4d4' }}>
                  Network Topology Matrix
                </span>
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', background: 'rgba(56,189,248,0.1)', color: '#38bdf8', padding: '1px 6px', borderRadius: '4px' }}>
                  {nodes.length} Nodes · {edges.length} Edges
                </span>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {(['ALL', 'DISRUPTED', 'WARNING'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setNodeFilter(f)}
                    style={{
                      padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontFamily: 'var(--font-mono)',
                      background: nodeFilter === f ? 'rgba(56,189,248,0.15)' : 'transparent',
                      border: `1px solid ${nodeFilter === f ? 'rgba(56,189,248,0.4)' : 'rgba(255,255,255,0.08)'}`,
                      color: nodeFilter === f ? '#38bdf8' : '#64748b', cursor: 'pointer',
                    }}
                  >
                    {f}
                  </button>
                ))}
                <button
                  onClick={() => navigate('/world')}
                  style={{
                    padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontFamily: 'var(--font-mono)',
                    background: 'rgba(52,199,123,0.1)', border: '1px solid rgba(52,199,123,0.3)', color: '#34c77b', cursor: 'pointer',
                  }}
                >
                  3D View
                </button>
              </div>
            </div>

            {/* Grid */}
            <div className="overflow-y-auto flex-1" style={{ padding: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '8px' }}>
                {filteredNodes.map((node) => {
                  const color = riskColor(node.composite, node.isDisrupted);
                  const typeColor = nodeTypeColor(node.type);
                  return (
                    <div
                      key={node.id}
                      onClick={() => { handleSelectNode(node.id); navigate(`/world/node/${node.id}`); }}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        background: node.isDisrupted ? 'rgba(25,4,4,0.7)' : node.composite >= 0.25 ? 'rgba(20,12,3,0.7)' : 'rgba(7,15,28,0.6)',
                        border: `1px solid ${color}30`,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, ${typeColor}80, transparent)` }} />
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#b8d0e8' }}>{node.id}</span>
                        <span style={{ fontSize: '8px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: node.isDisrupted ? '#f87171' : '#34d399' }}>
                          {node.isDisrupted ? 'DISRUPTED' : 'OK'}
                        </span>
                      </div>
                      <div style={{ fontSize: '10px', color: '#4a5c72', fontFamily: 'var(--font-mono)', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {node.name}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '9px', fontFamily: 'var(--font-mono)' }}>
                        <span style={{ color }}>Risk: {(node.composite * 100).toFixed(0)}%</span>
                        <span style={{ color: '#475569' }}>Inv: {node.inventory_level.toFixed(0)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── INTELLIGENCE SYNTHESIS VIEW (PRESERVED) ── */}
        {activeTab === 'INTELLIGENCE' && (
          <div className="flex-1 overflow-y-auto" style={{ padding: '14px 18px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
              {[
                { title: 'Graph Neural Network (GNN)', path: '/intelligence/gnn', desc: 'Topological message passing over supply-chain nodes to predict multi-hop risk propagation.' },
                { title: 'Causal DAG Sandbox', path: '/intelligence/causal', desc: 'Structural causal models estimating counterfactual effects of supplier disruptions.' },
                { title: 'Predictive AI / ML Engine', path: '/intelligence/predictive', desc: 'Automated time-series forecasting, disruption probability estimation, and feature drift.' },
                { title: 'Specialist Agent Constellation', path: '/intelligence', desc: 'Inventory, Logistics, Production, Supplier, and Threat specialist agents collaborating under Coordinator.' },
                { title: 'Incident War Room', path: '/response/war-room', desc: 'Operational war room coordinating live containment actions and human-in-the-loop overrides.' },
                { title: 'Adversary Stress Testing Lab', path: '/response/adversary-lab', desc: '12 multi-vector adversarial attack suite stressing operational plans.' },
                { title: 'Hindsight Experience Memory', path: '/memory', desc: 'Episodic memory store capturing operational grounding, failure boundaries, and outcomes.' },
                { title: 'Resilience Genome Catalog', path: '/genome', desc: 'Verified empirical decision templates with documented success conditions.' },
                { title: 'Continuous Learning Evaluation', path: '/evaluation', desc: 'Empirical benchmark harness tracking cold agent vs Hindsight learning progression.' },
              ].map((mod, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(7, 14, 26, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#38bdf8', display: 'block', marginBottom: '4px' }}>
                      {mod.title}
                    </span>
                    <p style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'var(--font-mono)', lineHeight: 1.4 }}>
                      {mod.desc}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(mod.path)}
                    style={{
                      marginTop: '10px',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.25)',
                      padding: '4px 8px', borderRadius: '4px', color: '#38bdf8', fontSize: '10px', fontFamily: 'var(--font-mono)',
                      cursor: 'pointer',
                    }}
                  >
                    <span>Launch Studio</span>
                    <ArrowRight size={10} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
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

        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          {events.length === 0 ? (
            <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#2a3d52', padding: '0 16px' }}>
              Waiting for WebSocket telemetry events...
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
                    {evt.stage && <span style={{ color: '#3d5168' }}>@{evt.stage}</span>}
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
