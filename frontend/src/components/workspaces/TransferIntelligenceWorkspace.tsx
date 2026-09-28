/**
 * TransferIntelligenceWorkspace — Phase 1
 *
 * Full-page experience transferability assessment.
 * The core product differentiator: "Does past experience apply here?"
 *
 * Future: backed by transfer assessment from the learning agent.
 * Now: UI architecture with demo fixtures.
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shuffle, CheckCircle2, AlertTriangle, ArrowDown, Clock, Brain, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useIncidentContextStore } from '../../store/incidentContextStore';
import { TruthTag } from '../common/TruthTag';

// ─── Demo Fixture ─────────────────────────────────────────────────────────────

const ASSESSMENTS = [
  {
    id: 'ta-001',
    pastExperience: {
      incident: 'Supplier B Capacity Failure — Q3 2025',
      decision: 'Substitution via Supplier D',
      outcome: 'SUCCESS',
      context: 'Supplier D capacity at 43%, Route A-7 healthy, full compatibility',
    },
    currentSituation: {
      incident: 'Supplier B Capacity Failure — Q4 2026',
      conditions: [
        { name: 'Supplier B Capacity',   current: '28%',   required: '> 40%',    pass: false },
        { name: 'Route A-7 Health',      current: 'OK',    required: 'Healthy',   pass: true  },
        { name: 'Compatibility Score',   current: '0.91',  required: '> 0.7',     pass: true  },
        { name: 'Data Freshness',        current: '4 min', required: '< 6 hr',    pass: true  },
        { name: 'Alternative Capacity',  current: 'N/A',   required: 'Available', pass: false },
      ],
    },
    transferability: 'PARTIAL' as const,
    similarity: 0.78,
    reason: 'Route intelligence and compatibility assessment transfer. Capacity logic does NOT transfer — current Supplier B capacity (28%) violates the learned success boundary (> 40%). Strategy requires modification before application.',
    recommendation: 'Apply route and compatibility components. Identify additional supplier with > 40% capacity before proceeding.',
    confidence: 0.74,
  },
  {
    id: 'ta-002',
    pastExperience: {
      incident: 'Inventory Depletion — Warehouse A Q2 2025',
      decision: 'Emergency reallocation from Warehouse C',
      outcome: 'SUCCESS',
      context: 'WH-C had 340 units excess, transport available, 1.8hr lead time',
    },
    currentSituation: {
      incident: 'Inventory Depletion — Warehouse A Q4 2026',
      conditions: [
        { name: 'WH-C Excess Stock',     current: '420 units', required: '> 120% safety', pass: true  },
        { name: 'Destination Deficit',   current: '38%',       required: '> 30%',          pass: true  },
        { name: 'Transport Available',   current: '2.1hr',     required: '< 4hr',          pass: true  },
        { name: 'Route Health',          current: 'OK',        required: 'Healthy',         pass: true  },
      ],
    },
    transferability: 'TRANSFERABLE' as const,
    similarity: 0.94,
    reason: 'All success conditions match current state. Past experience transfers fully — Warehouse C excess confirmed, transport available, deficit level matches. High confidence recommendation to apply strategy directly.',
    recommendation: 'Apply strategy directly. No modifications required. Proceed with reallocation.',
    confidence: 0.92,
  },
  {
    id: 'ta-003',
    pastExperience: {
      incident: 'Port of Shanghai Disruption — Q1 2025',
      decision: 'Route rerouting via Port of Busan',
      outcome: 'FAILURE',
      context: 'Port of Busan at 91% capacity — overloaded, unable to absorb additional volume',
    },
    currentSituation: {
      incident: 'Port of Shanghai Disruption — Q4 2026',
      conditions: [
        { name: 'Port of Busan Capacity', current: '93%', required: '< 85%', pass: false },
        { name: 'Transit Time Delta',     current: '+65%', required: '< +50%', pass: false },
        { name: 'Route C Availability',   current: 'OK',  required: 'Available', pass: true },
      ],
    },
    transferability: 'NON-TRANSFERABLE' as const,
    similarity: 0.62,
    reason: 'Past experience was a FAILURE case. Identical failure conditions are present: Port of Busan still above learned capacity boundary (> 85%). Applying this strategy is expected to fail. A different strategy is required.',
    recommendation: 'Do NOT apply rerouting via Port of Busan. Explore alternative ports or hold until capacity clears.',
    confidence: 0.89,
  },
  {
    id: 'ta-004',
    pastExperience: {
      incident: 'APAC Demand Surge Response — Q2 2025',
      decision: 'Forward inventory buffer increase',
      outcome: 'PARTIAL',
      context: 'Limited historical data on APAC surge patterns, buffer partially effective',
    },
    currentSituation: {
      incident: 'APAC Demand Surge — Q4 2026',
      conditions: [
        { name: 'Surge Magnitude',  current: '35%', required: '< 30% for buffer efficacy', pass: false },
        { name: 'Lead Time',        current: '6d',  required: '< 5d', pass: false },
        { name: 'Historical Data',  current: '3 events', required: '> 5 for pattern', pass: false },
      ],
    },
    transferability: 'UNKNOWN' as const,
    similarity: 0.41,
    reason: 'Insufficient validated experience for this magnitude of demand surge. Only 3 APAC surge events in memory. Pattern confidence below threshold for reliable transfer assessment. Recommend simulation before committing.',
    recommendation: 'Run Monte Carlo simulation. Gather more operational data. Do not rely solely on past experience.',
    confidence: 0.41,
  },
];

const TRANSFER_CONFIG = {
  TRANSFERABLE: {
    color: '#34c77b',
    bg: 'rgba(52,199,123,0.12)',
    border: 'rgba(52,199,123,0.3)',
    label: 'TRANSFERABLE',
    description: 'Past experience applies directly to current situation.',
  },
  PARTIAL: {
    color: '#f5a623',
    bg: 'rgba(245,166,35,0.1)',
    border: 'rgba(245,166,35,0.28)',
    label: 'PARTIAL',
    description: 'Some components transfer. Strategy requires modification.',
  },
  'NON-TRANSFERABLE': {
    color: '#e8503a',
    bg: 'rgba(232,80,58,0.1)',
    border: 'rgba(232,80,58,0.28)',
    label: 'NON-TRANSFERABLE',
    description: 'Current conditions violate learned boundaries.',
  },
  UNKNOWN: {
    color: '#64748b',
    bg: 'rgba(100,116,139,0.1)',
    border: 'rgba(100,116,139,0.2)',
    label: 'UNKNOWN',
    description: 'Insufficient experience to make a reliable assessment.',
  },
};

export const TransferIntelligenceWorkspace: React.FC = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState('ta-001');
  const assessment = ASSESSMENTS.find((a) => a.id === selected) ?? ASSESSMENTS[0];
  const tcfg = TRANSFER_CONFIG[assessment.transferability];

  return (
    <div style={{ padding: '20px', background: '#040810', minHeight: 'calc(100vh - 52px)' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
        style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '6px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shuffle size={20} color="#f5a623" />
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#c8daea' }}>Transfer Intelligence</div>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#3d5168', marginTop: '2px' }}>
              Does past operational experience apply to the current situation?
            </div>
          </div>
        </div>

        {/* Summary pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {Object.entries(TRANSFER_CONFIG).map(([key, cfg]) => {
            const count = ASSESSMENTS.filter(a => a.transferability === key).length;
            return (
              <span key={key} style={{
                fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 800,
                padding: '4px 10px', borderRadius: '5px',
                background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
              }}>
                {key}: {count}
              </span>
            );
          })}
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px' }}>
        {/* Left: Assessment List */}
        <div>
          <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#2a3d52', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
            Transfer Assessments
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {ASSESSMENTS.map((a) => {
              const cfg = TRANSFER_CONFIG[a.transferability];
              return (
                <button key={a.id} onClick={() => setSelected(a.id)} style={{
                  padding: '12px 14px', borderRadius: '9px',
                  background: selected === a.id ? 'rgba(56,189,248,0.06)' : 'rgba(7,14,26,0.85)',
                  border: selected === a.id ? '1px solid rgba(56,189,248,0.25)' : '1px solid rgba(255,255,255,0.07)',
                  cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.15s',
                }}>
                  <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: selected === a.id ? '#c8daea' : '#7a90aa', marginBottom: '5px', lineHeight: 1.3 }}>
                    {a.currentSituation.incident}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: 800, padding: '1px 5px', borderRadius: '3px', background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                      {cfg.label}
                    </span>
                    <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#3d5168' }}>
                      {(a.similarity * 100).toFixed(0)}% similar
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Assessment Detail */}
        <motion.div key={selected} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          <div style={{ padding: '20px', borderRadius: '12px', background: 'rgba(7,14,26,0.85)', border: `1px solid ${tcfg.border}` }}>
            {/* Transfer result banner */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '14px 18px', borderRadius: '10px', marginBottom: '20px',
              background: tcfg.bg, border: `1px solid ${tcfg.border}`,
            }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: `${tcfg.color}15`, border: `2px solid ${tcfg.color}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {assessment.transferability === 'TRANSFERABLE' ? <CheckCircle2 size={18} color={tcfg.color} /> :
                 assessment.transferability === 'NON-TRANSFERABLE' ? <AlertTriangle size={18} color={tcfg.color} /> :
                 <Shuffle size={18} color={tcfg.color} />}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                  <span style={{ fontSize: '16px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: tcfg.color, letterSpacing: '0.05em' }}>
                    {tcfg.label}
                  </span>
                  <TruthTag mode="LEARNED" size="sm" />
                </div>
                <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#4a5c72' }}>{tcfg.description}</div>
              </div>
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <div style={{ fontSize: '22px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: tcfg.color }}>
                  {(assessment.similarity * 100).toFixed(0)}%
                </div>
                <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#3d5168', textTransform: 'uppercase' }}>Similarity</div>
              </div>
            </div>

            {/* Past → Current Comparison */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '12px', alignItems: 'start', marginBottom: '20px' }}>
              {/* Past */}
              <div style={{ padding: '14px', borderRadius: '9px', background: 'rgba(7,14,26,0.7)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#3d5168', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                  Past Experience
                </div>
                <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#8ab4d4', marginBottom: '6px', lineHeight: 1.3 }}>
                  {assessment.pastExperience.incident}
                </div>
                <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#4a5c72', marginBottom: '8px', lineHeight: 1.5 }}>
                  {assessment.pastExperience.context}
                </div>
                <span style={{
                  fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: 800, padding: '2px 7px', borderRadius: '4px',
                  background: assessment.pastExperience.outcome === 'SUCCESS' ? 'rgba(52,199,123,0.15)' : 'rgba(232,80,58,0.12)',
                  color: assessment.pastExperience.outcome === 'SUCCESS' ? '#34c77b' : '#e8503a',
                  border: `1px solid ${assessment.pastExperience.outcome === 'SUCCESS' ? 'rgba(52,199,123,0.3)' : 'rgba(232,80,58,0.25)'}`,
                }}>
                  {assessment.pastExperience.outcome}
                </span>
              </div>

              {/* Arrow */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', paddingTop: '40px' }}>
                <ArrowRight size={18} color={tcfg.color} />
                <span style={{ fontSize: '8px', fontFamily: 'var(--font-mono)', color: '#2a3d52', textTransform: 'uppercase' }}>Transfer</span>
              </div>

              {/* Current */}
              <div style={{ padding: '14px', borderRadius: '9px', background: `${tcfg.color}06`, border: `1px solid ${tcfg.border}` }}>
                <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#3d5168', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                  Current Situation
                </div>
                <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#c8daea', marginBottom: '10px', lineHeight: 1.3 }}>
                  {assessment.currentSituation.incident}
                </div>
                {/* Condition checks */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {assessment.currentSituation.conditions.map((c) => (
                    <div key={c.name} style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '5px 8px', borderRadius: '5px',
                      background: c.pass ? 'rgba(52,199,123,0.06)' : 'rgba(232,80,58,0.08)',
                      border: `1px solid ${c.pass ? 'rgba(52,199,123,0.15)' : 'rgba(232,80,58,0.2)'}`,
                    }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: c.pass ? '#34c77b' : '#e8503a', flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#7a90aa' }}>{c.name}</span>
                      <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: c.pass ? '#34c77b' : '#e8503a' }}>{c.current}</span>
                      <span style={{ fontSize: '8px', fontFamily: 'var(--font-mono)', color: '#2a3d52' }}>req {c.required}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Reasoning */}
            <div style={{ marginBottom: '16px', padding: '14px', borderRadius: '9px', background: 'rgba(7,14,26,0.7)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#3d5168', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                Transfer Reasoning
              </div>
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#8ab4d4', lineHeight: 1.6 }}>
                {assessment.reason}
              </div>
            </div>

            {/* Recommendation */}
            <div style={{ padding: '14px', borderRadius: '9px', background: `${tcfg.color}08`, border: `1px solid ${tcfg.border}` }}>
              <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: tcfg.color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                Recommended Action
              </div>
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: tcfg.color, lineHeight: 1.5 }}>
                {assessment.recommendation}
              </div>
            </div>

            {/* Confidence */}
            <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#3d5168', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Assessment Confidence</span>
              <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${assessment.confidence * 100}%` }} transition={{ delay: 0.3, duration: 0.7 }}
                  style={{ height: '100%', borderRadius: '2px', background: tcfg.color }} />
              </div>
              <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: tcfg.color }}>
                {(assessment.confidence * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
