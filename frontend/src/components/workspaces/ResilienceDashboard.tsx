/**
 * ResilienceDashboard — Phase 1 Primary Dashboard
 *
 * The central operational intelligence experience:
 * "AI learns from operational experience."
 *
 * Data: worldSummary + riskMap + realtimeStore
 * New surfaces: Experience Memory, Resilience Genome, Transfer Intelligence,
 *               Strategy Arena, Governance, Learning Delta
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { fetchWorldSummary } from '../../api/worldApi';
import { fetchRiskMap } from '../../api/riskApi';
import { useRealtimeStore } from '../../store/realtimeStore';
import { COLOR, riskColor } from '../../visual/tokens';
import {
  Brain, GitBranch, Shuffle, Target, Shield, Zap,
  AlertTriangle, CheckCircle2, TrendingUp, TrendingDown,
  ArrowRight, ArrowDown, BarChart3, Activity, Clock,
  ChevronRight, Eye, Swords, BookOpen, Radio,
} from 'lucide-react';

// ─── Demo fixture data (UI-only — not fabricating backend behavior) ────────────

const DEMO_EXPERIENCES = [
  {
    id: 'exp-001',
    incident: 'Supplier B Capacity Failure',
    decision: 'Supplier substitution — reroute to Supplier D',
    outcome: 'SUCCESS',
    confidence: 0.87,
    context: 'Single-node capacity drop during Q4 surge',
    freshness: '4 min ago',
    provenance: 'observed' as const,
    conditions: ['Capacity > 40%', 'Compatible routes verified'],
  },
  {
    id: 'exp-002',
    incident: 'Port of Shanghai Disruption',
    decision: 'Route rerouting via alternative port',
    outcome: 'FAILURE',
    confidence: 0.61,
    context: 'Multi-node disruption under demand peak',
    freshness: '22 min ago',
    provenance: 'observed' as const,
    conditions: ['Route alternatives available'],
  },
  {
    id: 'exp-003',
    incident: 'Inventory Depletion — Warehouse A',
    decision: 'Emergency reallocation from Warehouse C',
    outcome: 'SUCCESS',
    confidence: 0.92,
    context: 'Regional inventory imbalance',
    freshness: '1 hr ago',
    provenance: 'observed' as const,
    conditions: ['Excess stock confirmed', 'Transport healthy'],
  },
  {
    id: 'exp-004',
    incident: 'Production Rescheduling — Factory EU',
    decision: 'Shift capacity to adjacent production line',
    outcome: 'SUCCESS',
    confidence: 0.78,
    context: 'Equipment maintenance window collision',
    freshness: '2 hr ago',
    provenance: 'simulated' as const,
    conditions: ['Adjacent capacity available'],
  },
];

const DEMO_GENOME = {
  strategy: 'Supplier Substitution',
  successConditions: [
    { text: 'Substitute capacity > 40%', verified: true },
    { text: 'Compatibility score verified', verified: true },
    { text: 'Transport route healthy', verified: true },
    { text: 'Lead time < 14 days', verified: true },
  ],
  failureBoundaries: [
    { text: 'Capacity < 40% at substitute', verified: true },
    { text: 'Route disruption active', verified: true },
    { text: 'Supplier data stale > 6 hrs', verified: false },
  ],
  supportingEvidence: 7,
  contradictingEvidence: 2,
  confidence: 0.84,
  freshness: '12 min ago',
  status: 'VALIDATED' as const,
};

const DEMO_TRANSFER = {
  pastExperience: 'Supplier B substitution — Supplier D · Q3 2025',
  currentSimilarity: 0.78,
  transferability: 'PARTIAL' as const,
  reason: 'Current Supplier B capacity (28%) violates the learned success boundary (capacity > 40%). Partial transfer: route intelligence transfers, capacity logic does not.',
  currentConditions: [
    { name: 'Supplier B Capacity', value: '28%', threshold: '> 40%', status: 'FAIL' },
    { name: 'Route Health',        value: 'OK',  threshold: 'Healthy', status: 'PASS' },
    { name: 'Compatibility',       value: '0.91', threshold: '> 0.7', status: 'PASS' },
    { name: 'Data Freshness',      value: '4 min', threshold: '< 6 hr', status: 'PASS' },
  ],
};

const DEMO_STRATEGIES = [
  {
    id: 'str-A',
    name: 'Supplier Substitution',
    description: 'Switch to Supplier D with partial capacity',
    recovery: 85,
    cost: 'Medium',
    risk: 'Low',
    confidence: 0.79,
    evidence: 7,
    transferability: 'PARTIAL' as const,
    challengeStatus: 'ROBUST' as const,
    recommended: false,
  },
  {
    id: 'str-B',
    name: 'Emergency Inventory Draw',
    description: 'Pull from Warehouse C reserves',
    recovery: 92,
    cost: 'High',
    risk: 'Low',
    confidence: 0.91,
    evidence: 4,
    transferability: 'TRANSFERABLE' as const,
    challengeStatus: 'ROBUST' as const,
    recommended: true,
  },
  {
    id: 'str-C',
    name: 'Production Rescheduling',
    description: 'Shift EU factory line allocation',
    recovery: 67,
    cost: 'Low',
    risk: 'Medium',
    confidence: 0.58,
    evidence: 2,
    transferability: 'UNKNOWN' as const,
    challengeStatus: 'FRAGILE' as const,
    recommended: false,
  },
];

// ─── Sub-Components ───────────────────────────────────────────────────────────

const SectionHeader: React.FC<{
  icon: React.ReactNode;
  title: string;
  action?: { label: string; path: string };
  navigate?: ReturnType<typeof useNavigate>;
}> = ({ icon, title, action, navigate }) => (
  <div className="platform-section-header" style={{ marginBottom: '12px' }}>
    <span style={{ color: '#38bdf8' }}>{icon}</span>
    <span className="platform-section-title">{title}</span>
    {action && navigate && (
      <button
        onClick={() => navigate(action.path)}
        style={{
          display: 'flex', alignItems: 'center', gap: '4px',
          marginLeft: 'auto', padding: '3px 8px', borderRadius: '4px',
          background: 'transparent', border: '1px solid rgba(255,255,255,0.08)',
          color: '#3d5168', fontSize: '9px', fontFamily: 'var(--font-mono)',
          fontWeight: 600, cursor: 'pointer', letterSpacing: '0.05em',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = '#38bdf8'; e.currentTarget.style.borderColor = 'rgba(56,189,248,0.3)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = '#3d5168'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
      >
        {action.label} <ChevronRight size={9} />
      </button>
    )}
  </div>
);

const ConfidenceBar: React.FC<{ value: number; color?: string }> = ({ value, color = '#38bdf8' }) => (
  <div className="confidence-bar-track" style={{ marginTop: '6px' }}>
    <div
      className="confidence-bar-fill"
      style={{ width: `${value * 100}%`, background: `linear-gradient(90deg, ${color}80, ${color})` }}
    />
  </div>
);

const ProvenanceBadge: React.FC<{ type: 'observed' | 'simulated' | 'derived' | 'inferred' | 'hypothesis' | 'stale' }> = ({ type }) => (
  <span className={`provenance-badge ${type}`}>
    {type === 'observed' && '● '}
    {type === 'simulated' && '◇ '}
    {type === 'derived' && '△ '}
    {type === 'inferred' && '◈ '}
    {type === 'hypothesis' && '? '}
    {type === 'stale' && '⊗ '}
    {type.toUpperCase()}
  </span>
);

const OutcomeBadge: React.FC<{ outcome: string }> = ({ outcome }) => {
  const isSuccess = outcome === 'SUCCESS';
  const isFailure = outcome === 'FAILURE';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '2px 7px', borderRadius: '4px',
      background: isSuccess ? 'rgba(52,199,123,0.15)' : isFailure ? 'rgba(232,80,58,0.12)' : 'rgba(245,166,35,0.12)',
      color: isSuccess ? '#34c77b' : isFailure ? '#e8503a' : '#f5a623',
      border: `1px solid ${isSuccess ? 'rgba(52,199,123,0.3)' : isFailure ? 'rgba(232,80,58,0.25)' : 'rgba(245,166,35,0.25)'}`,
      fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: 800, letterSpacing: '0.06em',
    }}>
      {isSuccess ? <CheckCircle2 size={9} /> : isFailure ? <AlertTriangle size={9} /> : null}
      {outcome}
    </span>
  );
};

const TransferBadge: React.FC<{ state: 'TRANSFERABLE' | 'PARTIAL' | 'NON-TRANSFERABLE' | 'UNKNOWN' }> = ({ state }) => {
  const cls = state === 'TRANSFERABLE' ? 'transferable' : state === 'PARTIAL' ? 'partial' : state === 'NON-TRANSFERABLE' ? 'non-transferable' : 'unknown';
  return <span className={`transfer-badge ${cls}`}>{state}</span>;
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const ResilienceDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { events, networkHealth, connectionStatus } = useRealtimeStore();
  const [selectedStrategy, setSelectedStrategy] = useState('str-B');

  const { data: summary } = useQuery({ queryKey: ['worldSummary'], queryFn: fetchWorldSummary });
  const { data: riskMap } = useQuery({ queryKey: ['riskMap'], queryFn: fetchRiskMap });

  const health = networkHealth > 0 ? networkHealth : riskMap?.network_health ?? summary?.network_health_score ?? 0.94;
  const disruptedCount = (summary?.disrupted_nodes_count ?? 0) + (summary?.disrupted_edges_count ?? 0) || 2;
  const nodeCount = summary?.total_nodes ?? 12;
  const edgeCount = summary?.total_edges ?? 18;
  const healthColor = health >= 0.85 ? COLOR.healthy : health >= 0.6 ? COLOR.warning : COLOR.critical;
  const wsLive = connectionStatus === 'CONNECTED';

  const fadeIn = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: 'easeOut' as const },
  };

  return (
    <div style={{ padding: '20px', background: '#040810', minHeight: 'calc(100vh - 52px)' }}>
      {/* ── HEADER HERO ── */}
      <motion.div {...fadeIn} style={{ marginBottom: '20px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          padding: '20px 24px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, rgba(7,14,26,0.9) 0%, rgba(10,18,32,0.9) 100%)',
          border: '1px solid rgba(56,189,248,0.12)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Background accent */}
          <div style={{
            position: 'absolute', top: 0, right: 0, bottom: 0,
            width: '30%',
            background: 'radial-gradient(ellipse at right, rgba(56,189,248,0.04), transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div>
            <div style={{
              fontSize: '22px',
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
              color: '#c8daea',
              letterSpacing: '0.02em',
              lineHeight: 1.2,
            }}>
              Resilience Intelligence
            </div>
            <div style={{
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              color: '#4a5c72',
              marginTop: '4px',
            }}>
              Operational intelligence that learns from experience.
            </div>
          </div>

          {/* System Status Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 12px', borderRadius: '6px',
              background: 'rgba(52,199,123,0.1)', border: '1px solid rgba(52,199,123,0.25)',
            }}>
              <span className="status-dot operational" />
              <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#34c77b' }}>
                OPERATIONAL
              </span>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 12px', borderRadius: '6px',
              background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)',
            }}>
              <Brain size={12} color="#a78bfa" />
              <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#a78bfa' }}>
                12 Experiences
              </span>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 12px', borderRadius: '6px',
              background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.2)',
            }}>
              <Zap size={12} color="#38bdf8" />
              <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#38bdf8' }}>
                7 Active Skills
              </span>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 12px', borderRadius: '6px',
              background: `${healthColor}10`, border: `1px solid ${healthColor}25`,
            }}>
              <Activity size={12} color={healthColor} />
              <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: healthColor }}>
                {(health * 100).toFixed(0)}% Confidence
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── TOP METRICS ROW ── */}
      <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.05 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Active Disruptions', value: disruptedCount, color: disruptedCount > 0 ? COLOR.critical : COLOR.healthy, icon: <AlertTriangle size={16} />, sub: `of ${nodeCount} nodes` },
          { label: 'Protected Operations', value: nodeCount - disruptedCount, color: COLOR.healthy, icon: <Shield size={16} />, sub: `${((nodeCount - disruptedCount) / nodeCount * 100).toFixed(0)}% coverage` },
          { label: 'Learned Experiences', value: 12, color: '#a78bfa', icon: <Brain size={16} />, sub: '84% avg confidence' },
          { label: 'Active Skills', value: 7, color: '#38bdf8', icon: <Zap size={16} />, sub: '3 validated, 4 candidate' },
        ].map((m, i) => (
          <motion.div key={m.label} {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.05 + i * 0.04 }}>
            <div style={{
              padding: '16px',
              borderRadius: '10px',
              background: 'rgba(7,14,26,0.85)',
              border: `1px solid ${m.color}18`,
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, ${m.color}60, transparent)` }} />
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ color: `${m.color}80` }}>{m.icon}</span>
                <span style={{ fontSize: '24px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: m.color }}>{m.value}</span>
              </div>
              <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#7a90aa', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{m.label}</div>
              <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#3d5168', marginTop: '2px' }}>{m.sub}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── MAIN DASHBOARD GRID ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>

        {/* ── CURRENT WORLD (col-span 2) ── */}
        <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.12 }}
          style={{ gridColumn: 'span 2' }}>
          <div style={{
            padding: '16px',
            borderRadius: '10px',
            background: 'rgba(7,14,26,0.85)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <SectionHeader icon={<Radio size={13} />} title="Current World" action={{ label: 'Live View', path: '/command' }} navigate={navigate} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px' }}>
              {[
                { label: 'Suppliers', count: 4, disrupted: disruptedCount > 0 ? 1 : 0, color: '#3b82f6' },
                { label: 'Warehouses', count: 3, disrupted: 0, color: '#06b6d4' },
                { label: 'Ports', count: 2, disrupted: disruptedCount > 1 ? 1 : 0, color: '#8b5cf6' },
                { label: 'Fulfillment', count: 2, disrupted: 0, color: '#10b981' },
                { label: 'Transport', count: edgeCount, disrupted: 0, color: '#f5a623' },
                { label: 'Network Health', count: `${(health * 100).toFixed(0)}%`, disrupted: health < 0.85 ? 1 : 0, color: healthColor },
              ].map((item) => (
                <div key={item.label} style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: item.disrupted > 0 ? 'rgba(232,80,58,0.06)' : 'rgba(7,14,26,0.6)',
                  border: `1px solid ${item.disrupted > 0 ? 'rgba(232,80,58,0.2)' : 'rgba(255,255,255,0.06)'}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#4a5c72', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.label}</span>
                    {item.disrupted > 0 && <span style={{ fontSize: '8px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#e8503a', background: 'rgba(232,80,58,0.1)', padding: '1px 4px', borderRadius: '3px' }}>⚡ ALERT</span>}
                  </div>
                  <div style={{ fontSize: '20px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: item.color }}>{item.count}</div>
                  <div style={{ height: '2px', borderRadius: '1px', background: 'rgba(255,255,255,0.05)', marginTop: '6px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: item.disrupted > 0 ? '35%' : '88%', background: item.disrupted > 0 ? '#e8503a' : item.color, borderRadius: '1px' }} />
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate('/world')}
              style={{
                marginTop: '12px', width: '100%', padding: '8px', borderRadius: '7px',
                background: 'transparent', border: '1px solid rgba(255,255,255,0.07)',
                color: '#3d5168', fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 600,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#38bdf8'; e.currentTarget.style.borderColor = 'rgba(56,189,248,0.3)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#3d5168'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}
            >
              Open 3D Digital Twin <ArrowRight size={11} />
            </button>
          </div>
        </motion.div>

        {/* ── GOVERNANCE / TRUST GATE ── */}
        <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.14 }}>
          <div style={{
            padding: '16px',
            borderRadius: '10px',
            background: 'rgba(7,14,26,0.85)',
            border: '1px solid rgba(167,139,250,0.15)',
            height: '100%',
          }}>
            <SectionHeader icon={<Shield size={13} />} title="Decision Governance" action={{ label: 'Full View', path: '/governance/policies' }} navigate={navigate} />

            {/* Active level */}
            <div className="autonomy-level approval" style={{ marginBottom: '12px', justifyContent: 'center' }}>
              <Shield size={13} />
              APPROVAL REQUIRED
            </div>

            <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#4a5c72', textAlign: 'center', marginBottom: '12px' }}>
              High-impact strategy pending human review
            </div>

            {/* Level selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {[
                { level: 'AUTO', desc: 'Confidence > 90%, low risk', color: '#34c77b', active: false },
                { level: 'AUTO + MONITOR', desc: 'Confidence 75–90%', color: '#38bdf8', active: false },
                { level: 'APPROVAL REQUIRED', desc: 'Confidence < 75% or high impact', color: '#f5a623', active: true },
                { level: 'BLOCKED', desc: 'Violates policy', color: '#e8503a', active: false },
              ].map((l) => (
                <div key={l.level} style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '6px 9px', borderRadius: '6px',
                  background: l.active ? `${l.color}0d` : 'transparent',
                  border: l.active ? `1px solid ${l.color}30` : '1px solid transparent',
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: l.active ? l.color : '#2a3d52', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: l.active ? l.color : '#2a3d52', letterSpacing: '0.05em' }}>{l.level}</div>
                    <div style={{ fontSize: '8px', fontFamily: 'var(--font-mono)', color: '#2a3d52' }}>{l.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── EXPERIENCE MEMORY ── */}
        <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.18 }}>
          <div style={{
            padding: '16px',
            borderRadius: '10px',
            background: 'rgba(7,14,26,0.85)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <SectionHeader icon={<Brain size={13} />} title="Experience Memory" action={{ label: 'Full Memory', path: '/memory' }} navigate={navigate} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {DEMO_EXPERIENCES.map((exp) => (
                <div key={exp.id} className={`exp-memory-card ${exp.outcome === 'SUCCESS' ? 'success' : exp.outcome === 'FAILURE' ? 'failure' : 'partial'}`}
                  style={{ padding: '10px 12px', cursor: 'pointer' }}
                  onClick={() => navigate('/memory')}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '4px', gap: '6px' }}>
                    <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#b8d0e8', flex: 1, lineHeight: 1.3 }}>
                      {exp.incident}
                    </span>
                    <OutcomeBadge outcome={exp.outcome} />
                  </div>
                  <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#4a5c72', marginBottom: '6px' }}>
                    {exp.context}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <ProvenanceBadge type={exp.provenance} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#38bdf8', fontWeight: 700 }}>
                        {(exp.confidence * 100).toFixed(0)}%
                      </span>
                      <span style={{ fontSize: '8px', fontFamily: 'var(--font-mono)', color: '#2a3d52' }}>
                        <Clock size={9} style={{ display: 'inline', marginRight: '3px' }} />{exp.freshness}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── RESILIENCE GENOME ── */}
        <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.2 }}>
          <div className="genome-card">
            <SectionHeader icon={<GitBranch size={13} />} title="Resilience Genome" action={{ label: 'Full Genome', path: '/genome' }} navigate={navigate} />

            <div style={{ marginBottom: '10px' }}>
              <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#c8daea', marginBottom: '2px' }}>
                {DEMO_GENOME.strategy}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: 800,
                  padding: '1px 6px', borderRadius: '3px',
                  background: 'rgba(52,199,123,0.15)', color: '#34c77b',
                  border: '1px solid rgba(52,199,123,0.3)',
                }}>
                  {DEMO_GENOME.status}
                </span>
                <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#3d5168' }}>
                  <Clock size={9} style={{ display: 'inline', marginRight: '3px' }} />{DEMO_GENOME.freshness}
                </span>
              </div>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#34c77b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '5px' }}>
                Success Conditions
              </div>
              {DEMO_GENOME.successConditions.map((c, i) => (
                <div key={i} className="genome-condition success" style={{ marginBottom: '3px' }}>
                  <CheckCircle2 size={10} />
                  {c.text}
                </div>
              ))}
            </div>

            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#e8503a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '5px' }}>
                Failure Boundaries
              </div>
              {DEMO_GENOME.failureBoundaries.map((c, i) => (
                <div key={i} className="genome-condition failure" style={{ marginBottom: '3px' }}>
                  <AlertTriangle size={10} />
                  {c.text}
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              {[
                { label: 'Evidence', value: `${DEMO_GENOME.supportingEvidence}↑ ${DEMO_GENOME.contradictingEvidence}↓`, color: '#38bdf8' },
                { label: 'Confidence', value: `${(DEMO_GENOME.confidence * 100).toFixed(0)}%`, color: '#a78bfa' },
                { label: 'Freshness', value: DEMO_GENOME.freshness, color: '#34c77b' },
              ].map((m) => (
                <div key={m.label} style={{ textAlign: 'center', padding: '6px', borderRadius: '6px', background: 'rgba(7,14,26,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: m.color }}>{m.value}</div>
                  <div style={{ fontSize: '8px', fontFamily: 'var(--font-mono)', color: '#3d5168', marginTop: '2px', textTransform: 'uppercase' }}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── TRANSFER INTELLIGENCE ── */}
        <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.22 }}>
          <div style={{
            padding: '16px',
            borderRadius: '10px',
            background: 'rgba(7,14,26,0.85)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <SectionHeader icon={<Shuffle size={13} />} title="Transfer Intelligence" action={{ label: 'Full Analysis', path: '/transfer' }} navigate={navigate} />

            <div style={{ marginBottom: '10px', padding: '10px', borderRadius: '8px', background: 'rgba(7,14,26,0.7)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#3d5168', textTransform: 'uppercase', marginBottom: '4px' }}>Past Experience</div>
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#8ab4d4' }}>{DEMO_TRANSFER.pastExperience}</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '10px' }}>
              <div style={{ height: '1px', flex: 1, background: 'rgba(255,255,255,0.06)' }} />
              <ArrowDown size={12} color="#4a5c72" />
              <div style={{ height: '1px', flex: 1, background: 'rgba(255,255,255,0.06)' }} />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#3d5168', textTransform: 'uppercase' }}>Transfer Assessment</span>
                <TransferBadge state={DEMO_TRANSFER.transferability} />
              </div>
              <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#4a5c72', lineHeight: 1.5 }}>
                {DEMO_TRANSFER.reason}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {DEMO_TRANSFER.currentConditions.map((c) => (
                <div key={c.name} style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '5px 8px', borderRadius: '5px',
                  background: c.status === 'PASS' ? 'rgba(52,199,123,0.05)' : 'rgba(232,80,58,0.07)',
                  border: `1px solid ${c.status === 'PASS' ? 'rgba(52,199,123,0.15)' : 'rgba(232,80,58,0.2)'}`,
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: c.status === 'PASS' ? '#34c77b' : '#e8503a', flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#7a90aa' }}>{c.name}</span>
                  <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: c.status === 'PASS' ? '#34c77b' : '#e8503a' }}>{c.value}</span>
                  <span style={{ fontSize: '8px', fontFamily: 'var(--font-mono)', color: '#3d5168' }}>req {c.threshold}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── STRATEGY ARENA ── */}
        <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.24 }}
          style={{ gridColumn: 'span 2' }}>
          <div style={{
            padding: '16px',
            borderRadius: '10px',
            background: 'rgba(7,14,26,0.85)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <SectionHeader icon={<Target size={13} />} title="Strategy Arena" action={{ label: 'Full Arena', path: '/arena' }} navigate={navigate} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginBottom: '12px' }}>
              {DEMO_STRATEGIES.map((s) => (
                <div key={s.id}
                  className={`strategy-card ${s.recommended ? 'recommended' : ''}`}
                  onClick={() => setSelectedStrategy(s.id)}
                  style={{
                    borderColor: selectedStrategy === s.id ? 'rgba(91,147,246,0.5)' : s.recommended ? 'rgba(52,199,123,0.3)' : 'rgba(255,255,255,0.08)',
                    background: selectedStrategy === s.id ? 'rgba(91,147,246,0.06)' : 'rgba(7,14,26,0.85)',
                  }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '6px', gap: '4px' }}>
                    <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#c8daea', lineHeight: 1.3 }}>{s.name}</div>
                    {s.recommended && <span style={{ fontSize: '8px', fontFamily: 'var(--font-mono)', fontWeight: 800, padding: '1px 5px', borderRadius: '3px', background: 'rgba(52,199,123,0.15)', color: '#34c77b', border: '1px solid rgba(52,199,123,0.3)', flexShrink: 0 }}>★ BEST</span>}
                  </div>
                  <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#4a5c72', marginBottom: '8px' }}>{s.description}</div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginBottom: '8px' }}>
                    {[
                      { label: 'Recovery', value: `${s.recovery}%`, color: s.recovery >= 85 ? '#34c77b' : '#f5a623' },
                      { label: 'Cost', value: s.cost, color: s.cost === 'Low' ? '#34c77b' : s.cost === 'Medium' ? '#f5a623' : '#e8503a' },
                      { label: 'Risk', value: s.risk, color: s.risk === 'Low' ? '#34c77b' : s.risk === 'Medium' ? '#f5a623' : '#e8503a' },
                      { label: 'Evidence', value: s.evidence, color: '#38bdf8' },
                    ].map((m) => (
                      <div key={m.label} style={{ padding: '4px 6px', borderRadius: '4px', background: 'rgba(7,14,26,0.7)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#2a3d52', textTransform: 'uppercase' }}>{m.label}</div>
                        <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: m.color }}>{m.value}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <TransferBadge state={s.transferability} />
                    <span style={{
                      fontSize: '8px', fontFamily: 'var(--font-mono)', fontWeight: 700,
                      padding: '1px 5px', borderRadius: '3px',
                      background: s.challengeStatus === 'ROBUST' ? 'rgba(52,199,123,0.1)' : 'rgba(232,80,58,0.1)',
                      color: s.challengeStatus === 'ROBUST' ? '#34c77b' : '#e8503a',
                    }}>
                      {s.challengeStatus === 'ROBUST' ? '✓' : '⚠'} {s.challengeStatus}
                    </span>
                  </div>
                  <ConfidenceBar value={s.confidence} color={s.confidence >= 0.8 ? '#34c77b' : s.confidence >= 0.6 ? '#f5a623' : '#e8503a'} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => navigate('/arena')}
                style={{
                  flex: 1, padding: '9px', borderRadius: '7px',
                  background: 'rgba(52,199,123,0.1)', border: '1px solid rgba(52,199,123,0.3)',
                  color: '#34c77b', fontSize: '11px', fontFamily: 'var(--font-mono)',
                  fontWeight: 700, cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', gap: '6px',
                }}>
                <CheckCircle2 size={13} /> Approve Selected Strategy
              </button>
              <button
                onClick={() => navigate('/response/adversary')}
                style={{
                  padding: '9px 16px', borderRadius: '7px',
                  background: 'rgba(232,80,58,0.08)', border: '1px solid rgba(232,80,58,0.2)',
                  color: '#e8503a', fontSize: '11px', fontFamily: 'var(--font-mono)',
                  fontWeight: 700, cursor: 'pointer', display: 'flex',
                  alignItems: 'center', gap: '6px',
                }}>
                <Swords size={13} /> Challenge
              </button>
            </div>
          </div>
        </motion.div>

        {/* ── LEARNING DELTA ── */}
        <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.26 }}>
          <div style={{
            padding: '16px',
            borderRadius: '10px',
            background: 'rgba(7,14,26,0.85)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <SectionHeader icon={<BookOpen size={13} />} title="Learning Delta" action={{ label: 'History', path: '/governance/resilience' }} navigate={navigate} />

            <div className="learning-delta-before" style={{ marginBottom: '6px' }}>
              <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#3d5168', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                Before Experience
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#4a5c72' }}>→ Supplier substitution always viable</div>
                <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#4a5c72' }}>→ No capacity threshold known</div>
                <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#4a5c72' }}>→ Confidence: 52%</div>
              </div>
            </div>

            <div className="learning-delta-connector">
              ↓ observed outcome → memory → generalization
            </div>

            <div className="learning-delta-after" style={{ marginBottom: '10px' }}>
              <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#34c77b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                After Experience
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#34c77b' }}>→ Capacity boundary discovered: 40%</div>
                <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#34c77b' }}>→ Route dependency confirmed</div>
                <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#34c77b' }}>→ Confidence: 84% (+32%)</div>
              </div>
            </div>

            <div style={{
              padding: '8px 10px', borderRadius: '7px',
              background: 'rgba(52,199,123,0.06)',
              border: '1px solid rgba(52,199,123,0.15)',
            }}>
              <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#34c77b', textTransform: 'uppercase', marginBottom: '3px' }}>
                Changed Decision
              </div>
              <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#4a5c72' }}>
                Next substitution decision now checks capacity boundary first.
                Non-transferable when below threshold.
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── PREDICTION vs ACTUAL ── */}
        <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.28 }}>
          <div style={{
            padding: '16px',
            borderRadius: '10px',
            background: 'rgba(7,14,26,0.85)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <SectionHeader icon={<BarChart3 size={13} />} title="Prediction vs Actual" action={{ label: 'Outcomes', path: '/decision/cockpit' }} navigate={navigate} />

            {[
              { label: 'Recovery Time', predicted: '4.2 hr', actual: '3.8 hr', delta: '+10%', positive: true },
              { label: 'Cost Impact', predicted: '$12K', actual: '$14.2K', delta: '-15%', positive: false },
              { label: 'Risk Reduction', predicted: '68%', actual: '71%', delta: '+4%', positive: true },
              { label: 'SLA Protection', predicted: '89%', actual: '91%', delta: '+2%', positive: true },
            ].map((row) => (
              <div key={row.label} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 10px', borderRadius: '6px', marginBottom: '5px',
                background: 'rgba(7,14,26,0.6)', border: '1px solid rgba(255,255,255,0.05)',
              }}>
                <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#7a90aa', flex: 1 }}>{row.label}</span>
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#3d5168', marginRight: '8px' }}>{row.predicted}</span>
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#c8daea', marginRight: '8px' }}>{row.actual}</span>
                <span style={{
                  fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: 800,
                  display: 'flex', alignItems: 'center', gap: '2px',
                  color: row.positive ? '#34c77b' : '#e8503a',
                }}>
                  {row.positive ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                  {row.delta}
                </span>
              </div>
            ))}

            <div style={{ marginTop: '10px', padding: '8px', borderRadius: '6px', background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.15)' }}>
              <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#3d5168', marginBottom: '4px', textTransform: 'uppercase' }}>Learning Delta</div>
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#38bdf8' }}>
                Model accuracy improved by 8.3% from this experience
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── UNKNOWN ZONE ── */}
        <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.3 }}>
          <div style={{
            padding: '16px',
            borderRadius: '10px',
            background: 'rgba(7,14,26,0.85)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <SectionHeader icon={<Eye size={13} />} title="Operational Certainty" />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { zone: 'KNOWN',     count: 5, desc: 'Validated by direct observation',  cls: 'known'     },
                { zone: 'PROBABLE',  count: 4, desc: 'High-confidence inference',         cls: 'probable'  },
                { zone: 'UNCERTAIN', count: 2, desc: 'Limited or conflicting evidence',   cls: 'uncertain' },
                { zone: 'UNKNOWN',   count: 1, desc: 'No validated experience exists',    cls: 'unknown'   },
              ].map((z) => (
                <div key={z.zone} className={`knowledge-zone ${z.cls}`} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '3px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <span>{z.zone}</span>
                    <span style={{ fontSize: '14px', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{z.count}</span>
                  </div>
                  <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#4a5c72', fontWeight: 400, textTransform: 'none', letterSpacing: '0' }}>
                    {z.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

      </div>{/* End dashboard grid */}
    </div>
  );
};
