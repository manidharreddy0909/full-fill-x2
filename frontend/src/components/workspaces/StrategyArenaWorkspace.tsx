/**
 * StrategyArenaWorkspace — Phase 1
 *
 * Full-page strategy evaluation and selection surface.
 * Combines: Strategy candidates, transfer assessment,
 * challenge results, governance level, and approval.
 *
 * Future: connected to cockpit, planner, and verification APIs.
 * Now: UI architecture with demo fixtures.
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Target, CheckCircle2, AlertTriangle, Swords, Shield,
  ArrowRight, BarChart3, Zap, TrendingUp, TrendingDown,
  Eye, Clock, ChevronRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { StrategyCandidate } from '../../types/intelligence';

// ─── Demo Fixture ─────────────────────────────────────────────────────────────

const STRATEGIES: StrategyCandidate[] = [
  {
    id: 'str-A',
    name: 'Emergency Inventory Draw',
    description: 'Pull from Warehouse C reserves to cover Warehouse A deficit immediately.',
    recovery: 92,
    recoveryTime: '1.8hr',
    cost: 14200,
    costLabel: '$14.2K',
    costLevel: 'HIGH',
    risk: 'LOW',
    confidence: 0.91,
    evidence: 4,
    transferability: 'TRANSFERABLE' as const,
    challengeStatus: 'ROBUST' as const,
    challengeDimensions: ['capacity_reduction', 'demand_spike'],
    autonomyLevel: 'AUTO' as const,
    recommended: true,
    rationale: 'All success conditions met. High evidence base. Transferable from prior inventory reallocation experience. Challenge test passed.',
  },
  {
    id: 'str-B',
    name: 'Supplier Substitution (Modified)',
    description: 'Substitute to Supplier D with route optimization; add capacity buffer requirement.',
    recovery: 80,
    recoveryTime: '4.5hr',
    cost: 9800,
    costLabel: '$9.8K',
    costLevel: 'MEDIUM',
    risk: 'MEDIUM',
    confidence: 0.74,
    evidence: 5,
    transferability: 'PARTIAL' as const,
    challengeStatus: 'FRAGILE' as const,
    challengeDimensions: ['capacity_reduction'],
    autonomyLevel: 'APPROVAL' as const,
    recommended: false,
    rationale: 'Partial transfer only. Capacity condition violated (28% vs required 40%). Strategy modified to add secondary buffer. Challenge revealed fragility under additional capacity reduction.',
  },
  {
    id: 'str-C',
    name: 'Production Rescheduling',
    description: 'Shift EU factory capacity to Line B to compensate for supply shortage.',
    recovery: 67,
    recoveryTime: '8hr',
    cost: 4200,
    costLabel: '$4.2K',
    costLevel: 'LOW',
    risk: 'MEDIUM',
    confidence: 0.58,
    evidence: 2,
    transferability: 'UNKNOWN' as const,
    challengeStatus: 'UNKNOWN' as const,
    challengeDimensions: [],
    autonomyLevel: 'BLOCKED' as const,
    recommended: false,
    rationale: 'Insufficient evidence for this scenario. Transfer assessment unknown. Challenge not yet run. Requires simulation before consideration.',
  },
];

const AUTONOMY_CONFIG = {
  AUTO:     { color: '#34c77b', label: 'AUTO',              desc: 'System may execute automatically'  },
  MONITOR:  { color: '#38bdf8', label: 'AUTO + MONITOR',    desc: 'Auto with human monitoring'        },
  APPROVAL: { color: '#f5a623', label: 'APPROVAL REQUIRED', desc: 'Human must approve before execution' },
  BLOCKED:  { color: '#e8503a', label: 'BLOCKED',           desc: 'Insufficient evidence or policy violation' },
};

const CHALLENGE_DIMENSIONS = [
  { id: 'capacity_reduction', label: 'Capacity Reduction' },
  { id: 'demand_spike',       label: 'Demand Spike' },
  { id: 'transport_disruption', label: 'Transport Disruption' },
  { id: 'inventory_loss',     label: 'Inventory Loss' },
  { id: 'stale_information',  label: 'Stale Information' },
  { id: 'topology_change',    label: 'Topology Change' },
];

export const StrategyArenaWorkspace: React.FC = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState('str-A');
  const [activeDimensions, setActiveDimensions] = useState<string[]>(['capacity_reduction', 'demand_spike']);
  const strategy = STRATEGIES.find((s) => s.id === selected) ?? STRATEGIES[0];
  const autonomyCfg = AUTONOMY_CONFIG[strategy.autonomyLevel];

  const toggleDimension = (dim: string) => {
    setActiveDimensions((prev) => prev.includes(dim) ? prev.filter((d) => d !== dim) : [...prev, dim]);
  };

  const getTransferBadge = (t: string) => {
    if (t === 'TRANSFERABLE') return { color: '#34c77b', bg: 'rgba(52,199,123,0.12)', border: 'rgba(52,199,123,0.3)' };
    if (t === 'PARTIAL')      return { color: '#f5a623', bg: 'rgba(245,166,35,0.1)',  border: 'rgba(245,166,35,0.28)' };
    if (t === 'NON-TRANSFERABLE') return { color: '#e8503a', bg: 'rgba(232,80,58,0.1)',  border: 'rgba(232,80,58,0.28)' };
    return { color: '#64748b', bg: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.2)' };
  };

  return (
    <div style={{ padding: '20px', background: '#040810', minHeight: 'calc(100vh - 52px)' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
        style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '6px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(91,147,246,0.1)', border: '1px solid rgba(91,147,246,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Target size={20} color="#5b93f6" />
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#c8daea' }}>Strategy Arena</div>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#3d5168', marginTop: '2px' }}>
              Evaluate, challenge, and select the optimal resilience strategy
            </div>
          </div>
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '16px' }}>
        {/* Left: Strategy Cards */}
        <div>
          {/* Strategy Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '16px' }}>
            {STRATEGIES.map((s, idx) => {
              const tb = getTransferBadge(s.transferability);
              const isSelected = selected === s.id;
              return (
                <motion.div key={s.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.07, duration: 0.3 }}>
                  <div
                    className={`strategy-card ${s.recommended ? 'recommended' : ''}`}
                    onClick={() => setSelected(s.id)}
                    style={{
                      borderColor: isSelected ? 'rgba(91,147,246,0.5)' : s.recommended ? 'rgba(52,199,123,0.3)' : 'rgba(255,255,255,0.08)',
                      background: isSelected ? 'rgba(91,147,246,0.06)' : 'rgba(7,14,26,0.85)',
                      boxShadow: isSelected ? '0 0 0 1px rgba(91,147,246,0.3), 0 4px 16px rgba(0,0,0,0.4)' : 'none',
                    }}>
                    {/* Label row */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px', gap: '4px' }}>
                      <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#c8daea', lineHeight: 1.3 }}>{s.name}</div>
                      {s.recommended && (
                        <span style={{ fontSize: '8px', fontFamily: 'var(--font-mono)', fontWeight: 800, padding: '1px 5px', borderRadius: '3px', background: 'rgba(52,199,123,0.15)', color: '#34c77b', border: '1px solid rgba(52,199,123,0.3)', flexShrink: 0 }}>
                          ★ BEST
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#4a5c72', marginBottom: '10px', lineHeight: 1.4 }}>{s.description}</div>

                    {/* Metrics */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', marginBottom: '8px' }}>
                      {[
                        { label: 'Recovery', value: `${s.recovery}%`, color: s.recovery >= 85 ? '#34c77b' : '#f5a623' },
                        { label: 'Time',     value: s.recoveryTime,   color: '#38bdf8' },
                        { label: 'Cost',     value: s.costLabel,      color: s.costLevel === 'LOW' ? '#34c77b' : s.costLevel === 'MEDIUM' ? '#f5a623' : '#e8503a' },
                        { label: 'Risk',     value: s.risk,           color: s.risk === 'LOW' ? '#34c77b' : s.risk === 'MEDIUM' ? '#f5a623' : '#e8503a' },
                      ].map((m) => (
                        <div key={m.label} style={{ padding: '5px 8px', borderRadius: '5px', background: 'rgba(7,14,26,0.7)', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <div style={{ fontSize: '8px', fontFamily: 'var(--font-mono)', color: '#2a3d52', textTransform: 'uppercase', marginBottom: '2px' }}>{m.label}</div>
                          <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: m.color }}>{m.value}</div>
                        </div>
                      ))}
                    </div>

                    {/* Transfer + Challenge */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: 800, padding: '2px 7px', borderRadius: '4px', background: tb.bg, color: tb.color, border: `1px solid ${tb.border}` }}>
                        {s.transferability}
                      </span>
                      <span style={{
                        fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: 700,
                        padding: '2px 7px', borderRadius: '4px',
                        background: s.challengeStatus === 'ROBUST' ? 'rgba(52,199,123,0.1)' : s.challengeStatus === 'FRAGILE' ? 'rgba(232,80,58,0.1)' : 'rgba(100,116,139,0.1)',
                        color: s.challengeStatus === 'ROBUST' ? '#34c77b' : s.challengeStatus === 'FRAGILE' ? '#e8503a' : '#64748b',
                      }}>
                        {s.challengeStatus === 'ROBUST' ? '✓' : s.challengeStatus === 'FRAGILE' ? '⚠' : '?'} {s.challengeStatus}
                      </span>
                    </div>

                    {/* Confidence bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ flex: 1, height: '3px', borderRadius: '2px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${s.confidence * 100}%`, background: s.confidence >= 0.8 ? '#34c77b' : s.confidence >= 0.6 ? '#f5a623' : '#e8503a', borderRadius: '2px' }} />
                      </div>
                      <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: s.confidence >= 0.8 ? '#34c77b' : s.confidence >= 0.6 ? '#f5a623' : '#e8503a' }}>
                        {(s.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Challenge Engine Panel */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.3 }}>
            <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(7,14,26,0.85)', border: '1px solid rgba(232,80,58,0.12)', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Swords size={13} color="#e8503a" />
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#7a90aa', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Challenge Engine
                </span>
                <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#3d5168' }}>
                  — Select dimensions to challenge the selected strategy
                </span>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {CHALLENGE_DIMENSIONS.map((d) => (
                  <button key={d.id} onClick={() => toggleDimension(d.id)}
                    className={`challenge-dim ${activeDimensions.includes(d.id) ? 'active' : ''}`}>
                    <Swords size={9} />
                    {d.label}
                  </button>
                ))}
              </div>
              {activeDimensions.length > 0 && (
                <div style={{ marginTop: '10px', padding: '10px', borderRadius: '7px', background: 'rgba(232,80,58,0.05)', border: '1px solid rgba(232,80,58,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#4a5c72' }}>
                    {activeDimensions.length} dimensions selected — ready to challenge
                  </span>
                  <button
                    onClick={() => navigate('/response/adversary')}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '5px',
                      padding: '6px 12px', borderRadius: '6px',
                      background: 'rgba(232,80,58,0.1)', border: '1px solid rgba(232,80,58,0.3)',
                      color: '#e8503a', fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 700, cursor: 'pointer',
                    }}>
                    <Swords size={11} /> Run Challenge <ArrowRight size={10} />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Right: Strategy Detail + Governance */}
        <motion.div key={selected} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Strategy Detail */}
            <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(7,14,26,0.85)', border: '1px solid rgba(91,147,246,0.2)' }}>
              <div style={{ fontSize: '14px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#c8daea', marginBottom: '4px' }}>{strategy.name}</div>
              <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#4a5c72', marginBottom: '12px', lineHeight: 1.5 }}>{strategy.description}</div>

              <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#3d5168', textTransform: 'uppercase', marginBottom: '6px' }}>Rationale</div>
              <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#7a90aa', lineHeight: 1.6, marginBottom: '12px' }}>{strategy.rationale}</div>

              {/* Evidence */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '7px', background: 'rgba(56,189,248,0.05)', border: '1px solid rgba(56,189,248,0.12)' }}>
                <BarChart3 size={12} color="#38bdf8" />
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#4a5c72' }}>
                  {strategy.evidence} supporting experiences · {(strategy.confidence * 100).toFixed(0)}% confidence
                </span>
              </div>
            </div>

            {/* Governance / Trust Gate */}
            <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(7,14,26,0.85)', border: `1px solid ${autonomyCfg.color}20` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Shield size={13} color="#a78bfa" />
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#7a90aa', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Decision Governance</span>
              </div>

              <div className={`autonomy-level ${strategy.autonomyLevel === 'APPROVAL' ? 'approval' : strategy.autonomyLevel === 'AUTO' ? 'auto' : strategy.autonomyLevel === 'MONITOR' ? 'monitor' : 'blocked'}`}
                style={{ justifyContent: 'center', marginBottom: '10px' }}>
                <Shield size={12} />
                {autonomyCfg.label}
              </div>
              <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#4a5c72', textAlign: 'center', marginBottom: '12px' }}>
                {autonomyCfg.desc}
              </div>

              {/* All 4 levels */}
              {Object.entries(AUTONOMY_CONFIG).map(([key, cfg]) => (
                <div key={key} style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '5px 9px', borderRadius: '5px', marginBottom: '4px',
                  background: key === strategy.autonomyLevel ? `${cfg.color}0d` : 'transparent',
                  border: key === strategy.autonomyLevel ? `1px solid ${cfg.color}25` : '1px solid transparent',
                }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: key === strategy.autonomyLevel ? cfg.color : '#2a3d52', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: key === strategy.autonomyLevel ? cfg.color : '#2a3d52', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{cfg.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {strategy.autonomyLevel !== 'BLOCKED' && (
                <button style={{
                  width: '100%', padding: '11px', borderRadius: '8px',
                  background: 'rgba(52,199,123,0.1)', border: '1px solid rgba(52,199,123,0.3)',
                  color: '#34c77b', fontSize: '12px', fontFamily: 'var(--font-mono)',
                  fontWeight: 700, cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', gap: '6px',
                }}>
                  <CheckCircle2 size={14} />
                  {strategy.autonomyLevel === 'AUTO' ? 'Execute Strategy' : 'Approve Strategy'}
                </button>
              )}
              <button
                onClick={() => navigate('/decision/verification')}
                style={{
                  width: '100%', padding: '9px', borderRadius: '8px',
                  background: 'transparent', border: '1px solid rgba(255,255,255,0.09)',
                  color: '#4a5c72', fontSize: '11px', fontFamily: 'var(--font-mono)',
                  fontWeight: 600, cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', gap: '6px',
                }}>
                <Eye size={12} /> View Verification <ChevronRight size={10} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
