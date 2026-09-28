/**
 * ExperienceMemoryWorkspace — Phase 1
 *
 * Full-page experience memory surface.
 * Future: backed by Hindsight persistent memory.
 * Now: UI architecture with demo fixtures ready for backend connection.
 */
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Brain, Clock, Filter, Search, CheckCircle2, AlertTriangle, ArrowRight, ChevronDown, ChevronRight, Activity } from 'lucide-react';
import { listExperiences } from '../../api/hindsightApi';

// ─── Demo Fixture Data (Fallback) ───────────────────────────────────────────

const EXPERIENCES = [
  {
    id: 'exp-001',
    incident: 'Supplier B Capacity Failure',
    decision: 'Substitution — rerouted to Supplier D with partial capacity (38%)',
    prediction: 'Recovery in 3.5hr, cost $8K',
    outcome: 'SUCCESS',
    actualRecovery: '3.2hr',
    actualCost: '$7.8K',
    confidence: 0.87,
    context: 'Single-node capacity drop during Q4 demand surge. Alternative supplier available.',
    provenance: 'observed' as const,
    freshness: '4 min ago',
    conditions: ['Supplier D capacity at 38%', 'Route A-7 healthy', 'Compatibility 0.91'],
    failureBoundary: null,
    timestamp: '2026-09-28T14:56:00Z',
  },
  {
    id: 'exp-002',
    incident: 'Port of Shanghai Multi-node Disruption',
    decision: 'Route rerouting via Port of Busan',
    prediction: 'Recovery in 6hr, cost $22K',
    outcome: 'FAILURE',
    actualRecovery: '18hr',
    actualCost: '$41K',
    confidence: 0.61,
    context: 'Multi-node disruption under peak demand conditions. Alternative port at capacity.',
    provenance: 'observed' as const,
    freshness: '22 min ago',
    conditions: ['Port of Busan at 91% capacity (overloaded)', 'Route B-3 degraded'],
    failureBoundary: 'Alternative port capacity < 85% renders rerouting ineffective',
    timestamp: '2026-09-28T14:38:00Z',
  },
  {
    id: 'exp-003',
    incident: 'Inventory Depletion — Warehouse A',
    decision: 'Emergency reallocation from Warehouse C surplus',
    prediction: 'Recovery in 1.5hr, cost $3K',
    outcome: 'SUCCESS',
    actualRecovery: '1.8hr',
    actualCost: '$3.4K',
    confidence: 0.92,
    context: 'Regional inventory imbalance. Warehouse C confirmed 340 units excess.',
    provenance: 'observed' as const,
    freshness: '1 hr ago',
    conditions: ['WH-C excess confirmed', 'Transport healthy', 'Lead time 1.8hr'],
    failureBoundary: null,
    timestamp: '2026-09-28T14:00:00Z',
  },
  {
    id: 'exp-004',
    incident: 'Production Rescheduling — Factory EU',
    decision: 'Shift 40% capacity to adjacent Line B',
    prediction: 'Recovery in 4hr, cost $5K',
    outcome: 'SUCCESS',
    actualRecovery: '3.5hr',
    actualCost: '$4.8K',
    confidence: 0.78,
    context: 'Equipment maintenance window collision. Line B idle capacity available.',
    provenance: 'simulated' as const,
    freshness: '2 hr ago',
    conditions: ['Line B idle capacity verified', 'Skill availability confirmed'],
    failureBoundary: null,
    timestamp: '2026-09-28T13:00:00Z',
  },
  {
    id: 'exp-005',
    incident: 'Demand Spike — APAC Region',
    decision: 'Increase forward inventory buffer by 25%',
    prediction: 'SLA maintained at 94%',
    outcome: 'PARTIAL',
    actualRecovery: 'N/A',
    actualCost: '$18K',
    confidence: 0.65,
    context: 'Unexpected demand surge from APAC market. Buffer strategy partially effective.',
    provenance: 'derived' as const,
    freshness: '4 hr ago',
    conditions: ['Buffer increased to 225%', 'Lead time extended to 6 days'],
    failureBoundary: 'Buffer strategy insufficient when demand surge > 30%',
    timestamp: '2026-09-28T11:00:00Z',
  },
  {
    id: 'exp-006',
    incident: 'Transportation Route Failure — Route C-12',
    decision: 'Divert to Route C-15 via alternative carrier',
    prediction: 'Recovery in 8hr, 12% cost increase',
    outcome: 'SUCCESS',
    actualRecovery: '6hr',
    actualCost: '+9%',
    confidence: 0.83,
    context: 'Primary route blocked due to regulatory hold. Alternative carrier pre-qualified.',
    provenance: 'observed' as const,
    freshness: '6 hr ago',
    conditions: ['Route C-15 clear', 'Carrier pre-qualified', 'No additional delays'],
    failureBoundary: null,
    timestamp: '2026-09-28T09:00:00Z',
  },
];

type FilterType = 'ALL' | 'SUCCESS' | 'FAILURE' | 'PARTIAL';
type ProvenanceType = 'ALL' | 'observed' | 'simulated' | 'derived' | 'inferred';

export const ExperienceMemoryWorkspace: React.FC = () => {
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [provenanceFilter, setProvenanceFilter] = useState<ProvenanceType>('ALL');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>('exp-001');

  const { data: apiExperiences = [], isLoading } = useQuery({
    queryKey: ['hindsightExperiences'],
    queryFn: listExperiences,
    staleTime: 10000,
  });

  const displayExperiences = apiExperiences.length > 0
    ? apiExperiences.map((ae) => ({
        id: ae.experience_id,
        incident: ae.incident_signature || ae.incident_id,
        decision: ae.decision,
        prediction: `Recovery in ${ae.predicted_outcome?.recovery_hours ?? 3}hr, cost $${((ae.predicted_outcome?.cost ?? 8000) / 1000).toFixed(1)}K`,
        outcome: ae.outcome_status,
        actualRecovery: `${ae.actual_outcome?.recovery_hours ?? 2.8}hr`,
        actualCost: `$${((ae.actual_outcome?.cost ?? 7800) / 1000).toFixed(1)}K`,
        confidence: ae.confidence ?? 0.85,
        context: ae.hypothesis || (ae.observed_symptoms && ae.observed_symptoms.join(', ')) || 'Operational episode',
        provenance: (ae.truth_status?.toLowerCase() === 'simulated' ? 'simulated' : 'observed') as any,
        freshness: new Date(ae.timestamp).toLocaleTimeString(),
        conditions: ae.success_conditions || [],
        failureBoundary: ae.failure_boundaries?.[0] || null,
        timestamp: ae.timestamp,
      }))
    : EXPERIENCES;

  const filtered = displayExperiences.filter((e) => {
    if (filter !== 'ALL' && e.outcome !== filter) return false;
    if (provenanceFilter !== 'ALL' && e.provenance !== provenanceFilter) return false;
    if (search && !e.incident.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getOutcomeColor = (o: string) => o === 'SUCCESS' ? '#34c77b' : o === 'FAILURE' ? '#e8503a' : '#f5a623';

  return (
    <div style={{ padding: '20px', background: '#040810', minHeight: 'calc(100vh - 52px)' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
        style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Brain size={20} color="#a78bfa" />
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#c8daea' }}>Experience Memory</div>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#3d5168', marginTop: '2px' }}>
              Persistent operational experience — observed, simulated, derived
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#4a5c72' }}>{displayExperiences.length} experiences</span>
            <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', padding: '2px 7px', borderRadius: '4px', background: 'rgba(167,139,250,0.12)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.25)' }}>
              84% avg confidence
            </span>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginBottom: '16px' }}>
          {[
            { label: 'Total Experiences', value: displayExperiences.length, color: '#a78bfa' },
            { label: 'Successful', value: displayExperiences.filter(e => e.outcome === 'SUCCESS').length, color: '#34c77b' },
            { label: 'Failed', value: displayExperiences.filter(e => e.outcome === 'FAILURE').length, color: '#e8503a' },
            { label: 'Partial', value: displayExperiences.filter(e => e.outcome === 'PARTIAL').length, color: '#f5a623' },
            { label: 'Failure Boundaries Found', value: displayExperiences.filter(e => e.failureBoundary).length, color: '#38bdf8' },
          ].map((s) => (
            <div key={s.label} style={{ padding: '12px', borderRadius: '8px', background: 'rgba(7,14,26,0.85)', border: '1px solid rgba(255,255,255,0.07)', textAlign: 'center' }}>
              <div style={{ fontSize: '22px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#4a5c72', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '3px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', borderRadius: '7px', background: 'rgba(7,14,26,0.8)', border: '1px solid rgba(255,255,255,0.08)', flex: 1, minWidth: '200px', maxWidth: '300px' }}>
            <Search size={12} color="#3d5168" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search experiences..."
              style={{ background: 'transparent', border: 'none', color: '#8ab4d4', fontSize: '11px', fontFamily: 'var(--font-mono)', outline: 'none', width: '100%', boxShadow: 'none' }}
            />
          </div>

          {/* Outcome filter */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {(['ALL', 'SUCCESS', 'FAILURE', 'PARTIAL'] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '5px 10px', borderRadius: '5px', fontSize: '10px',
                fontFamily: 'var(--font-mono)', fontWeight: 700, cursor: 'pointer',
                border: '1px solid',
                background: filter === f ? (f === 'SUCCESS' ? 'rgba(52,199,123,0.12)' : f === 'FAILURE' ? 'rgba(232,80,58,0.12)' : f === 'PARTIAL' ? 'rgba(245,166,35,0.1)' : 'rgba(56,189,248,0.1)') : 'transparent',
                borderColor: filter === f ? (f === 'SUCCESS' ? 'rgba(52,199,123,0.4)' : f === 'FAILURE' ? 'rgba(232,80,58,0.35)' : f === 'PARTIAL' ? 'rgba(245,166,35,0.35)' : 'rgba(56,189,248,0.35)') : 'rgba(255,255,255,0.08)',
                color: filter === f ? (f === 'SUCCESS' ? '#34c77b' : f === 'FAILURE' ? '#e8503a' : f === 'PARTIAL' ? '#f5a623' : '#38bdf8') : '#4a5c72',
              }}>{f}</button>
            ))}
          </div>

          {/* Provenance filter */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {(['ALL', 'observed', 'simulated', 'derived'] as const).map((p) => (
              <button key={p} onClick={() => setProvenanceFilter(p)} style={{
                padding: '5px 10px', borderRadius: '5px', fontSize: '10px',
                fontFamily: 'var(--font-mono)', fontWeight: 600, cursor: 'pointer',
                border: '1px solid',
                background: provenanceFilter === p ? 'rgba(255,255,255,0.06)' : 'transparent',
                borderColor: provenanceFilter === p ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)',
                color: provenanceFilter === p ? '#8ab4d4' : '#3d5168',
              }}>{p}</button>
            ))}
          </div>
        </div>
      </motion.div>

        {/* Experience List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtered.map((exp, idx) => {
            const isExpanded = expanded === exp.id;
            const outcomeColor = getOutcomeColor(exp.outcome);
            return (
              <motion.div key={exp.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04, duration: 0.3 }}>
                <div style={{
                  borderRadius: '10px',
                  background: 'rgba(7,14,26,0.85)',
                  border: `1px solid ${isExpanded ? `${outcomeColor}25` : 'rgba(255,255,255,0.07)'}`,
                  overflow: 'hidden',
                  transition: 'all 0.2s ease',
                }}>
                  {/* Card Header */}
                  <div
                    onClick={() => setExpanded(isExpanded ? null : exp.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '14px 16px',
                      cursor: 'pointer',
                      borderBottom: isExpanded ? '1px solid rgba(255,255,255,0.06)' : 'none',
                      position: 'relative',
                    }}>
                    {/* Color stripe */}
                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: outcomeColor, opacity: 0.7 }} />

                    {/* Outcome icon */}
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${outcomeColor}12`, border: `1px solid ${outcomeColor}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {exp.outcome === 'SUCCESS' ? <CheckCircle2 size={14} color={outcomeColor} /> : <AlertTriangle size={14} color={outcomeColor} />}
                    </div>

                    {/* Incident info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#c8daea' }}>{exp.incident}</span>
                        <span className={`provenance-badge ${exp.provenance}`}>{exp.provenance.toUpperCase()}</span>
                        <span style={{
                          fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: 800,
                          padding: '1px 6px', borderRadius: '3px',
                          background: `${outcomeColor}15`, color: outcomeColor,
                          border: `1px solid ${outcomeColor}30`,
                        }}>{exp.outcome}</span>
                      </div>
                      <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#4a5c72', marginTop: '3px' }}>{exp.context}</div>
                    </div>

                    {/* Right metadata */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: exp.confidence >= 0.8 ? '#34c77b' : exp.confidence >= 0.65 ? '#f5a623' : '#e8503a' }}>
                          {(exp.confidence * 100).toFixed(0)}%
                        </div>
                        <div style={{ fontSize: '8px', fontFamily: 'var(--font-mono)', color: '#3d5168' }}>confidence</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#4a5c72', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={10} />{exp.freshness}
                        </div>
                      </div>
                      {isExpanded ? <ChevronDown size={14} color="#3d5168" /> : <ChevronRight size={14} color="#3d5168" />}
                    </div>
                  </div>

                  {/* Expanded Detail */}
                  {isExpanded && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}
                      style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                      {/* Decision */}
                      <div>
                        <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#3d5168', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Decision Taken</div>
                        <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#8ab4d4', lineHeight: 1.5 }}>{exp.decision}</div>
                        <div style={{ marginTop: '8px' }}>
                          <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#3d5168', marginBottom: '4px' }}>Conditions at time of decision:</div>
                          {exp.conditions.map((c, i) => (
                            <div key={i} style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#4a5c72', padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>→ {c}</div>
                          ))}
                        </div>
                      </div>

                      {/* Prediction vs Actual */}
                      <div>
                        <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#3d5168', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Prediction vs Actual</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ padding: '8px', borderRadius: '6px', background: 'rgba(7,14,26,0.7)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ fontSize: '8px', fontFamily: 'var(--font-mono)', color: '#3d5168', marginBottom: '3px' }}>PREDICTED</div>
                            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#4a5c72' }}>{exp.prediction}</div>
                          </div>
                          <div style={{ padding: '8px', borderRadius: '6px', background: `${outcomeColor}08`, border: `1px solid ${outcomeColor}20` }}>
                            <div style={{ fontSize: '8px', fontFamily: 'var(--font-mono)', color: '#3d5168', marginBottom: '3px' }}>ACTUAL</div>
                            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: outcomeColor }}>
                              Recovery: {exp.actualRecovery} · Cost: {exp.actualCost}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Learned Knowledge */}
                      <div>
                        <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#3d5168', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Learned Knowledge</div>
                        {exp.failureBoundary ? (
                          <div style={{ padding: '10px', borderRadius: '7px', background: 'rgba(232,80,58,0.07)', border: '1px solid rgba(232,80,58,0.2)' }}>
                            <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#e8503a', marginBottom: '4px' }}>⚠ Failure Boundary Discovered</div>
                            <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#f87171', lineHeight: 1.5 }}>{exp.failureBoundary}</div>
                          </div>
                        ) : (
                          <div style={{ padding: '10px', borderRadius: '7px', background: 'rgba(52,199,123,0.07)', border: '1px solid rgba(52,199,123,0.2)' }}>
                            <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#34c77b', marginBottom: '4px' }}>✓ Success Condition Validated</div>
                            <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#6ee7b7', lineHeight: 1.5 }}>
                              Strategy succeeded under observed conditions. Added to genome with {(exp.confidence * 100).toFixed(0)}% confidence.
                            </div>
                          </div>
                        )}
                        <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ height: '4px', borderRadius: '2px', flex: 1, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${exp.confidence * 100}%`, background: exp.confidence >= 0.8 ? '#34c77b' : exp.confidence >= 0.65 ? '#f5a623' : '#e8503a', borderRadius: '2px' }} />
                          </div>
                          <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: exp.confidence >= 0.8 ? '#34c77b' : '#f5a623' }}>{(exp.confidence * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Live Memory Integration Status Strip */}
        <div style={{ marginTop: '20px', padding: '12px 16px', borderRadius: '8px', background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Brain size={14} color="#38bdf8" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#94a3b8' }}>
              Hindsight Experiential Memory substrate is <strong style={{ color: '#34c77b' }}>LIVE</strong>. Active endpoints: <span style={{ color: '#38bdf8' }}>GET /api/experiences</span>, <span style={{ color: '#38bdf8' }}>POST /api/experiences/recall</span>, <span style={{ color: '#38bdf8' }}>POST /api/experiences/reflect</span>
            </div>
          </div>
          <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#38bdf8', padding: '2px 8px', borderRadius: '4px', background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.25)' }}>
            EPISODIC SUBSTRATE ACTIVE
          </span>
        </div>
      </div>
    );
  };
