/**
 * ResilienceGenomeWorkspace — Phase 1
 *
 * Full-page Resilience Genome surface showing learned
 * success conditions, failure boundaries, evidence, and skill state.
 *
 * Future: backed by genome service from learning agents.
 * Now: UI architecture with demo fixtures.
 */
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { GitBranch, CheckCircle2, AlertTriangle, BarChart3, Clock, ChevronRight, Zap, Brain } from 'lucide-react';
import { listGenomes } from '../../api/hindsightApi';

// ─── Demo Fixture (Fallback when backend returns no genomes) ──────────────────

const GENOMES = [
  {
    id: 'gen-001',
    strategy: 'Supplier Substitution',
    description: 'Replace a disrupted supplier with a pre-qualified alternative.',
    status: 'VALIDATED' as const,
    confidence: 0.84,
    freshness: '12 min ago',
    successConditions: [
      { text: 'Substitute capacity > 40%',         evidenceCount: 5, strength: 0.92 },
      { text: 'Compatibility score > 0.7',          evidenceCount: 7, strength: 0.88 },
      { text: 'Transport route healthy',             evidenceCount: 6, strength: 0.85 },
      { text: 'Lead time < 14 days',                evidenceCount: 4, strength: 0.79 },
    ],
    failureBoundaries: [
      { text: 'Substitute capacity < 40%',          discoveredBy: 'exp-002', strength: 0.91 },
      { text: 'Route disruption active',             discoveredBy: 'exp-005', strength: 0.83 },
      { text: 'Supplier data stale > 6 hrs',         discoveredBy: 'simulation', strength: 0.72 },
    ],
    supportingEvidence: 7,
    contradictingEvidence: 2,
    appliedCount: 5,
    successRate: 0.80,
  },
  {
    id: 'gen-002',
    strategy: 'Inventory Reallocation',
    description: 'Move surplus inventory from low-demand to high-demand locations.',
    status: 'VALIDATED' as const,
    confidence: 0.92,
    freshness: '1 hr ago',
    successConditions: [
      { text: 'Source has > 120% of safety stock',  evidenceCount: 4, strength: 0.95 },
      { text: 'Destination deficit > 30%',           evidenceCount: 4, strength: 0.91 },
      { text: 'Transport available within 4hr',      evidenceCount: 3, strength: 0.88 },
    ],
    failureBoundaries: [
      { text: 'Source stock within 110% of safety',  discoveredBy: 'exp-009', strength: 0.85 },
    ],
    supportingEvidence: 4,
    contradictingEvidence: 0,
    appliedCount: 3,
    successRate: 1.0,
  },
  {
    id: 'gen-003',
    strategy: 'Route Rerouting',
    description: 'Divert shipments via alternative transportation routes.',
    status: 'CANDIDATE' as const,
    confidence: 0.61,
    freshness: '3 hr ago',
    successConditions: [
      { text: 'Alternative route capacity < 85%',   evidenceCount: 2, strength: 0.78 },
      { text: 'Route transit time < +50% overhead', evidenceCount: 2, strength: 0.71 },
    ],
    failureBoundaries: [
      { text: 'Alternative route at > 85% capacity', discoveredBy: 'exp-002', strength: 0.89 },
      { text: 'Transit time overhead > 50%',          discoveredBy: 'simulation', strength: 0.76 },
    ],
    supportingEvidence: 2,
    contradictingEvidence: 2,
    appliedCount: 2,
    successRate: 0.50,
  },
  {
    id: 'gen-004',
    strategy: 'Production Rescheduling',
    description: 'Shift production capacity to alternative lines during disruptions.',
    status: 'CANDIDATE' as const,
    confidence: 0.71,
    freshness: '2 hr ago',
    successConditions: [
      { text: 'Alternate line idle capacity available', evidenceCount: 2, strength: 0.82 },
      { text: 'Product compatibility > 0.85',           evidenceCount: 1, strength: 0.74 },
      { text: 'Skilled operators available',             evidenceCount: 2, strength: 0.79 },
    ],
    failureBoundaries: [
      { text: 'Cross-product compatibility < 0.7',   discoveredBy: 'simulation', strength: 0.68 },
    ],
    supportingEvidence: 3,
    contradictingEvidence: 1,
    appliedCount: 2,
    successRate: 0.75,
  },
];

const STATUS_CONFIG = {
  VALIDATED: { color: '#34c77b', bg: 'rgba(52,199,123,0.12)', border: 'rgba(52,199,123,0.3)' },
  CANDIDATE: { color: '#f5a623', bg: 'rgba(245,166,35,0.1)',  border: 'rgba(245,166,35,0.28)' },
  CHALLENGED: { color: '#fb923c', bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.28)' },
  RETIRED:   { color: '#3d5168', bg: 'rgba(61,81,104,0.1)',   border: 'rgba(61,81,104,0.2)' },
};

export const ResilienceGenomeWorkspace: React.FC = () => {
  const [selected, setSelected] = useState('gen-001');

  const { data: apiGenomes = [] } = useQuery({
    queryKey: ['hindsightGenomes'],
    queryFn: listGenomes,
    staleTime: 15000,
  });

  const displayGenomes = apiGenomes.length > 0
    ? apiGenomes.map((ag) => ({
        id: ag.genome_id,
        strategy: ag.strategy_name,
        description: ag.description || 'Learned operational resilience strategy',
        status: (ag.status === 'VALIDATED' ? 'VALIDATED' : ag.status === 'DEPRECATED' ? 'RETIRED' : 'CANDIDATE') as keyof typeof STATUS_CONFIG,
        confidence: ag.confidence ?? 0.8,
        freshness: new Date(ag.last_reflected_at || Date.now()).toLocaleTimeString(),
        successConditions: ag.success_conditions?.map((sc) => ({
          text: sc.text,
          evidenceCount: sc.evidence_count ?? 1,
          strength: sc.confidence ?? 0.8,
        })) ?? [],
        failureBoundaries: ag.failure_boundaries?.map((fb) => ({
          text: fb.text,
          discoveredBy: fb.boundary_id || 'memory',
          strength: fb.confidence ?? 0.8,
        })) ?? [],
        supportingEvidence: ag.supporting_evidence_ids?.length ?? 0,
        contradictingEvidence: ag.contradicting_evidence_ids?.length ?? 0,
        appliedCount: 0,
        successRate: ag.confidence ?? 0.8,
      }))
    : GENOMES;

  const genome = displayGenomes.find((g) => g.id === selected) ?? displayGenomes[0];
  const statusCfg = STATUS_CONFIG[genome?.status ?? 'CANDIDATE'];

  return (
    <div style={{ padding: '20px', background: '#040810', minHeight: 'calc(100vh - 52px)' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
        style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '6px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GitBranch size={20} color="#a78bfa" />
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#c8daea' }}>Resilience Genome</div>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#3d5168', marginTop: '2px' }}>
              Learned success conditions, failure boundaries, and operational knowledge
            </div>
          </div>
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '16px' }}>
        {/* Left: Genome List */}
        <div>
          <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#2a3d52', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
            Resilience Strategies
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {displayGenomes.map((g) => {
              const cfg = STATUS_CONFIG[g.status] ?? STATUS_CONFIG['CANDIDATE'];
              return (
                <button key={g.id} onClick={() => setSelected(g.id)} style={{
                  padding: '12px 14px', borderRadius: '9px',
                  background: selected === g.id ? 'rgba(56,189,248,0.08)' : 'rgba(7,14,26,0.85)',
                  border: selected === g.id ? '1px solid rgba(56,189,248,0.3)' : '1px solid rgba(255,255,255,0.07)',
                  cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.15s',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: selected === g.id ? '#c8daea' : '#7a90aa' }}>
                      {g.strategy}
                    </span>
                    {selected === g.id && <ChevronRight size={12} color="#38bdf8" />}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: 800, padding: '1px 5px', borderRadius: '3px', background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                      {g.status}
                    </span>
                    <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#3d5168' }}>
                      {(g.confidence * 100).toFixed(0)}% conf
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Genome Detail */}
        <motion.div key={selected} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          <div className="genome-card" style={{ padding: '20px' }}>
            {/* Genome Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '18px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#c8daea', marginBottom: '4px' }}>
                  {genome.strategy}
                </div>
                <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#4a5c72' }}>{genome.description}</div>
              </div>
              <div style={{ display: 'flex', flex: 'column', gap: '6px', alignItems: 'flex-end', flexShrink: 0 }}>
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 800, padding: '3px 10px', borderRadius: '5px', background: statusCfg.bg, color: statusCfg.color, border: `1px solid ${statusCfg.border}` }}>
                  {genome.status}
                </span>
                <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#3d5168', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={9} />{genome.freshness}
                </span>
              </div>
            </div>

            {/* Top Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', marginBottom: '20px' }}>
              {[
                { label: 'Confidence', value: `${(genome.confidence * 100).toFixed(0)}%`, color: genome.confidence >= 0.8 ? '#34c77b' : '#f5a623' },
                { label: 'Supporting Evidence', value: genome.supportingEvidence, color: '#38bdf8' },
                { label: 'Contradicting', value: genome.contradictingEvidence, color: genome.contradictingEvidence > 2 ? '#e8503a' : '#4a5c72' },
                { label: 'Success Rate', value: `${(genome.successRate * 100).toFixed(0)}%`, color: genome.successRate >= 0.8 ? '#34c77b' : '#f5a623' },
              ].map((s) => (
                <div key={s.label} style={{ padding: '12px', borderRadius: '8px', background: 'rgba(7,14,26,0.7)', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#3d5168', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '3px' }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {/* Success Conditions */}
              <div>
                <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#34c77b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={13} /> Success Conditions
                </div>
                {genome.successConditions.map((c, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                    <div className="genome-condition success" style={{ marginBottom: '6px' }}>
                      <CheckCircle2 size={11} style={{ flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ marginBottom: '3px' }}>{c.text}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ flex: 1, height: '2px', borderRadius: '1px', background: 'rgba(52,199,123,0.15)', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${c.strength * 100}%`, background: '#34c77b', borderRadius: '1px' }} />
                          </div>
                          <span style={{ fontSize: '8px', fontFamily: 'var(--font-mono)', color: '#34c77b', flexShrink: 0 }}>
                            {c.evidenceCount}× evidence · {(c.strength * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Failure Boundaries */}
              <div>
                <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#e8503a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertTriangle size={13} /> Failure Boundaries
                </div>
                {genome.failureBoundaries.map((b, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                    <div className="genome-condition failure" style={{ marginBottom: '6px' }}>
                      <AlertTriangle size={11} style={{ flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ marginBottom: '3px' }}>{b.text}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ flex: 1, height: '2px', borderRadius: '1px', background: 'rgba(232,80,58,0.15)', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${b.strength * 100}%`, background: '#e8503a', borderRadius: '1px' }} />
                          </div>
                          <span style={{ fontSize: '8px', fontFamily: 'var(--font-mono)', color: '#e8503a', flexShrink: 0 }}>
                            {(b.strength * 100).toFixed(0)}% confidence
                          </span>
                        </div>
                        <div style={{ fontSize: '8px', fontFamily: 'var(--font-mono)', color: '#3d5168', marginTop: '2px' }}>
                          Discovered by: {b.discoveredBy}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Applied history note */}
            <div style={{ marginTop: '16px', padding: '12px', borderRadius: '8px', background: 'rgba(56,189,248,0.05)', border: '1px solid rgba(56,189,248,0.12)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <BarChart3 size={14} color="#38bdf8" />
              <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#4a5c72' }}>
                Applied {genome.appliedCount} times · {(genome.successRate * 100).toFixed(0)}% success rate ·
                {genome.supportingEvidence} supporting, {genome.contradictingEvidence} contradicting experiences
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Note */}
      <div style={{ marginTop: '16px', padding: '12px 16px', borderRadius: '8px', background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <GitBranch size={14} color="#a78bfa" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#94a3b8' }}>
            Resilience Genomes are continuously synthesized by Hindsight Reflection Engine. Live endpoints: <span style={{ color: '#a78bfa' }}>GET /api/genomes</span>, <span style={{ color: '#a78bfa' }}>POST /api/experiences/reflect</span>
          </span>
        </div>
        <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#a78bfa', padding: '2px 8px', borderRadius: '4px', background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)' }}>
          SYNTHESIS ENGINE LIVE
        </span>
      </div>
    </div>
  );
};
