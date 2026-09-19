import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  GitMerge,
  Layers,
  Sparkles,
  TrendingUp,
  DollarSign,
  Clock,
  Leaf,
  ChevronDown,
  ChevronRight,
  Eye,
  Bot,
  Package,
  Truck,
  Factory,
  ShieldAlert,
} from 'lucide-react';
import {
  CoordinatorResult,
  CandidatePlan,
  Agreement,
  Conflict,
  ObjectiveImpact,
} from '../../types/coordinator';
import { AgentId } from '../../types/agent';

interface CoordinationBoardProps {
  coordinationResult: CoordinatorResult | null;
  onPreviewCandidate?: (candidate: CandidatePlan) => void;
  selectedCandidateId?: string | null;
}

const AGENT_COLORS: Record<string, string> = {
  inventory: '#4A90D9',
  supplier: '#7BC67E',
  transportation: '#E8A24A',
  fulfillment: '#9B7FE8',
  sustainability: '#52B788',
  resilience: '#E8574A',
};

const AGENT_ICONS: Record<string, React.ReactNode> = {
  inventory: <Package size={14} />,
  supplier: <Factory size={14} />,
  transportation: <Truck size={14} />,
  fulfillment: <Layers size={14} />,
  sustainability: <Leaf size={14} />,
  resilience: <ShieldAlert size={14} />,
};

export const CoordinationBoard: React.FC<CoordinationBoardProps> = ({
  coordinationResult,
  onPreviewCandidate,
  selectedCandidateId,
}) => {
  const [activeSection, setActiveSection] = useState<'CANDIDATES' | 'AGREEMENTS' | 'CONFLICTS' | 'MATRIX'>('CANDIDATES');
  const [expandedTradeoffs, setExpandedTradeoffs] = useState<Record<string, boolean>>({});

  if (!coordinationResult) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: 'rgba(30, 41, 59, 0.3)',
          borderRadius: '12px',
          border: '1px dashed var(--border-default)',
          color: '#94A3B8',
        }}
      >
        <GitMerge size={48} color="#8B5CF6" style={{ marginBottom: '16px' }} />
        <div style={{ fontSize: '16px', fontWeight: 600, color: '#E2E8F0', marginBottom: '8px' }}>
          Coordinator Reconciliation Not Yet Executed
        </div>
        <div style={{ fontSize: '13px', color: '#94A3B8', maxWidth: '420px', margin: '0 auto' }}>
          Execute all 6 specialist agents and click <strong>"Run Coordinator Reconciliation"</strong> to synthesize candidate plans and detect agreements & conflicts.
        </div>
      </div>
    );
  }

  const toggleTradeoff = (candId: string) => {
    setExpandedTradeoffs((prev) => ({ ...prev, [candId]: !prev[candId] }));
  };

  const getImpactColor = (score: number) => {
    if (score >= 0.5) return '#4ADE80';
    if (score > 0) return '#93C5FD';
    if (score === 0) return '#94A3B8';
    return '#F87171';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Metrics Summary Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '14px 16px', borderRadius: '10px', border: '1px solid var(--border-default)' }}>
          <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>Candidate Plans</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#8B5CF6', marginTop: '4px' }}>
            {coordinationResult.candidate_plans.length}
          </div>
          <div style={{ fontSize: '10px', color: '#CBD5E1', marginTop: '2px' }}>Structured Options</div>
        </div>

        <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '14px 16px', borderRadius: '10px', border: '1px solid var(--border-default)' }}>
          <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>Agreements</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#4ADE80', marginTop: '4px' }}>
            {coordinationResult.agreements.length}
          </div>
          <div style={{ fontSize: '10px', color: '#CBD5E1', marginTop: '2px' }}>Reinforcing Objectives</div>
        </div>

        <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '14px 16px', borderRadius: '10px', border: '1px solid var(--border-default)' }}>
          <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>Conflicts</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#F87171', marginTop: '4px' }}>
            {coordinationResult.conflicts.length}
          </div>
          <div style={{ fontSize: '10px', color: '#CBD5E1', marginTop: '2px' }}>Multi-Agent Opposition</div>
        </div>

        <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '14px 16px', borderRadius: '10px', border: '1px solid var(--border-default)' }}>
          <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>Execution Status</div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#60A5FA', marginTop: '8px' }} className="mono">
            {coordinationResult.status}
          </div>
          <div style={{ fontSize: '10px', color: '#CBD5E1', marginTop: '2px' }}>{coordinationResult.latency_ms.toFixed(0)}ms latency</div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
        <button
          onClick={() => setActiveSection('CANDIDATES')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            background: activeSection === 'CANDIDATES' ? '#8B5CF6' : 'rgba(30, 41, 59, 0.5)',
            color: activeSection === 'CANDIDATES' ? '#FFF' : '#94A3B8',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Candidate Plans ({coordinationResult.candidate_plans.length})
        </button>

        <button
          onClick={() => setActiveSection('AGREEMENTS')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            background: activeSection === 'AGREEMENTS' ? '#4ADE80' : 'rgba(30, 41, 59, 0.5)',
            color: activeSection === 'AGREEMENTS' ? '#0F172A' : '#94A3B8',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Agreements ({coordinationResult.agreements.length})
        </button>

        <button
          onClick={() => setActiveSection('CONFLICTS')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            background: activeSection === 'CONFLICTS' ? '#EF4444' : 'rgba(30, 41, 59, 0.5)',
            color: activeSection === 'CONFLICTS' ? '#FFF' : '#94A3B8',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Conflicts ({coordinationResult.conflicts.length})
        </button>

        <button
          onClick={() => setActiveSection('MATRIX')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            background: activeSection === 'MATRIX' ? '#3B82F6' : 'rgba(30, 41, 59, 0.5)',
            color: activeSection === 'MATRIX' ? '#FFF' : '#94A3B8',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Trade-off Matrix (6 Objectives)
        </button>
      </div>

      {/* SECTION 1: CANDIDATE PLANS */}
      {activeSection === 'CANDIDATES' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {coordinationResult.candidate_plans.map((cand) => {
            const isSelected = selectedCandidateId === cand.candidate_id;

            return (
              <div
                key={cand.candidate_id}
                style={{
                  background: 'rgba(30, 41, 59, 0.6)',
                  borderRadius: '12px',
                  border: isSelected ? '2px solid #8B5CF6' : '1px solid var(--border-default)',
                  boxShadow: isSelected ? '0 0 20px rgba(139, 92, 246, 0.3)' : 'none',
                  overflow: 'hidden',
                  transition: 'all 0.2s',
                }}
              >
                {/* Plan Header */}
                <div
                  style={{
                    padding: '16px 20px',
                    background: isSelected ? 'rgba(139, 92, 246, 0.15)' : 'rgba(15, 23, 42, 0.4)',
                    borderBottom: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {cand.name}
                      <span
                        className="mono"
                        style={{
                          fontSize: '10px',
                          background: cand.status === 'VALID' ? 'rgba(74, 222, 128, 0.15)' : 'rgba(248, 113, 113, 0.15)',
                          color: cand.status === 'VALID' ? '#4ADE80' : '#F87171',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          border: `1px solid ${cand.status === 'VALID' ? 'rgba(74, 222, 128, 0.3)' : 'rgba(248, 113, 113, 0.3)'}`,
                        }}
                      >
                        {cand.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>
                      {cand.description}
                    </div>
                  </div>

                  {onPreviewCandidate && (
                    <button
                      onClick={() => onPreviewCandidate(cand)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        background: isSelected ? '#8B5CF6' : 'rgba(139, 92, 246, 0.2)',
                        border: '1px solid #8B5CF6',
                        color: '#FFF',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      <Eye size={14} /> {isSelected ? 'Previewing on Map' : 'Preview Candidate'}
                    </button>
                  )}
                </div>

                {/* Metrics Summary Strip */}
                <div style={{ display: 'flex', padding: '12px 20px', gap: '24px', background: 'rgba(15, 23, 42, 0.2)', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#94A3B8' }}>Est. Cost: </span>
                    <span className="mono" style={{ fontSize: '12px', fontWeight: 700, color: '#4ADE80' }}>${cand.estimated_total_cost.toLocaleString()}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#94A3B8' }}>Max Transit Delay: </span>
                    <span className="mono" style={{ fontSize: '12px', fontWeight: 700, color: '#FBBF24' }}>+{cand.estimated_max_delay_hours}h</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#94A3B8' }}>CO₂ Footprint: </span>
                    <span className="mono" style={{ fontSize: '12px', fontWeight: 700, color: '#60A5FA' }}>{cand.estimated_total_emissions_co2_kg.toLocaleString()} kg</span>
                  </div>
                </div>

                {/* Supporting Agents & Actions */}
                <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Supporting Agent Badges */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>Supporting Specialists:</span>
                    {cand.supporting_agents.map((agId) => (
                      <span
                        key={agId}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          background: `${AGENT_COLORS[agId]}20`,
                          border: `1px solid ${AGENT_COLORS[agId]}50`,
                          color: AGENT_COLORS[agId],
                          fontSize: '11px',
                          fontWeight: 600,
                          textTransform: 'capitalize',
                        }}
                      >
                        {AGENT_ICONS[agId]} {agId}
                      </span>
                    ))}
                  </div>

                  {/* Actions Table */}
                  <div style={{ background: 'rgba(15, 23, 42, 0.6)', borderRadius: '8px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ background: 'rgba(30, 41, 59, 0.8)', color: '#94A3B8' }}>
                          <th style={{ padding: '8px 12px' }}>Action</th>
                          <th style={{ padding: '8px 12px' }}>Target</th>
                          <th style={{ padding: '8px 12px' }}>Parameters</th>
                          <th style={{ padding: '8px 12px' }}>Cost</th>
                          <th style={{ padding: '8px 12px' }}>Delay</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cand.actions.map((act) => (
                          <tr key={act.normalized_id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                            <td style={{ padding: '8px 12px', fontWeight: 600, color: '#8B5CF6' }}>{act.action_type}</td>
                            <td style={{ padding: '8px 12px' }} className="mono">{act.target_node_ids.join(', ') || act.target_edge_ids.join(', ') || 'Global'}</td>
                            <td style={{ padding: '8px 12px' }} className="mono">{JSON.stringify(act.parameters)}</td>
                            <td style={{ padding: '8px 12px', color: '#4ADE80' }}>${act.estimated_cost.toLocaleString()}</td>
                            <td style={{ padding: '8px 12px', color: '#FBBF24' }}>+{act.estimated_delay_hours}h</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Trade-off Explanation Toggle */}
                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                    <button
                      onClick={() => toggleTradeoff(cand.candidate_id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#94A3B8',
                        fontSize: '11px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '2px 0',
                      }}
                    >
                      {expandedTradeoffs[cand.candidate_id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      {expandedTradeoffs[cand.candidate_id] ? 'Hide Trade-off Explanation' : 'View Trade-off Comparison'}
                    </button>

                    {expandedTradeoffs[cand.candidate_id] && (
                      <div style={{ marginTop: '8px', padding: '10px 14px', background: 'rgba(15, 23, 42, 0.8)', borderRadius: '6px', fontSize: '11px', color: '#CBD5E1', border: '1px solid var(--border-subtle)' }}>
                        {cand.tradeoff.explanation}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SECTION 2: AGREEMENTS */}
      {activeSection === 'AGREEMENTS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {coordinationResult.agreements.map((agree) => (
            <div
              key={agree.agreement_id}
              style={{
                background: 'rgba(34, 197, 94, 0.08)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                borderRadius: '10px',
                padding: '14px 18px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#4ADE80', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color="#4ADE80" /> {agree.shared_intent}
                </div>
                <span className="mono" style={{ fontSize: '10px', background: 'rgba(34, 197, 94, 0.2)', color: '#4ADE80', padding: '2px 6px', borderRadius: '4px' }}>
                  {agree.agreement_id}
                </span>
              </div>

              <div style={{ fontSize: '12px', color: '#E2E8F0', lineHeight: '1.5', marginBottom: '10px' }}>
                {agree.reason}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '11px', color: '#94A3B8' }}>Coordinated Agents:</span>
                  {agree.agent_ids.map((agId) => (
                    <span
                      key={agId}
                      style={{
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: `${AGENT_COLORS[agId]}20`,
                        border: `1px solid ${AGENT_COLORS[agId]}50`,
                        color: AGENT_COLORS[agId],
                        fontSize: '10px',
                        fontWeight: 600,
                        textTransform: 'capitalize',
                      }}
                    >
                      {agId}
                    </span>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '11px', color: '#94A3B8' }}>Original Proposals:</span>
                  {agree.proposal_ids.map((pId) => (
                    <span key={pId} className="mono" style={{ fontSize: '10px', background: 'rgba(255,255,255,0.1)', color: '#94A3B8', padding: '2px 6px', borderRadius: '4px' }}>
                      {pId}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SECTION 3: CONFLICTS */}
      {activeSection === 'CONFLICTS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {coordinationResult.conflicts.map((conf) => (
            <div
              key={conf.conflict_id}
              style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '10px',
                padding: '16px 20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#FCA5A5', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={16} color="#EF4444" /> Operational Conflict: {conf.conflict_type}
                </div>
                <span className="mono" style={{ fontSize: '10px', background: 'rgba(239, 68, 68, 0.2)', color: '#FCA5A5', padding: '2px 6px', borderRadius: '4px' }}>
                  {conf.conflict_id}
                </span>
              </div>

              {/* Agent A vs Agent B Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: 'rgba(15, 23, 42, 0.6)', padding: '12px', borderRadius: '8px', marginBottom: '10px' }}>
                <div style={{ borderRight: '1px solid rgba(255,255,255,0.1)', paddingRight: '12px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: AGENT_COLORS[conf.agent_id_a], textTransform: 'capitalize' }}>
                    Agent A: {conf.agent_id_a}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
                    Objective: {conf.objective_a}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: AGENT_COLORS[conf.agent_id_b], textTransform: 'capitalize' }}>
                    Agent B: {conf.agent_id_b}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
                    Objective: {conf.objective_b}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '12px', color: '#E2E8F0', lineHeight: '1.5' }}>
                <strong>Reason: </strong>{conf.reason}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SECTION 4: 6-OBJECTIVE IMPACT MATRIX */}
      {activeSection === 'MATRIX' && (
        <div style={{ background: 'rgba(15, 23, 42, 0.6)', borderRadius: '12px', padding: '20px', border: '1px solid var(--border-default)' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#F8FAFC', marginBottom: '16px' }}>
            Multi-Objective Candidate Performance Matrix
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(30, 41, 59, 0.8)', color: '#94A3B8', borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '10px 12px' }}>Candidate Plan</th>
                <th style={{ padding: '10px 12px' }}>Stockout Risk</th>
                <th style={{ padding: '10px 12px' }}>Supplier Disruption</th>
                <th style={{ padding: '10px 12px' }}>Delay & Cost</th>
                <th style={{ padding: '10px 12px' }}>Service Level</th>
                <th style={{ padding: '10px 12px' }}>Emissions</th>
                <th style={{ padding: '10px 12px' }}>Resilience</th>
              </tr>
            </thead>
            <tbody>
              {coordinationResult.candidate_plans.map((cand) => {
                const matrixMap = new Map(cand.objective_impact_matrix.map((m) => [m.objective, m.impact_score]));

                return (
                  <tr key={cand.candidate_id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: '#8B5CF6' }}>{cand.name}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: getImpactColor(matrixMap.get('MINIMIZE_STOCKOUT_RISK' as any) || 0) }} className="mono">
                      {(matrixMap.get('MINIMIZE_STOCKOUT_RISK' as any) || 0) >= 0 ? '+' : ''}{(matrixMap.get('MINIMIZE_STOCKOUT_RISK' as any) || 0).toFixed(2)}
                    </td>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: getImpactColor(matrixMap.get('REDUCE_SUPPLIER_DISRUPTION' as any) || 0) }} className="mono">
                      {(matrixMap.get('REDUCE_SUPPLIER_DISRUPTION' as any) || 0) >= 0 ? '+' : ''}{(matrixMap.get('REDUCE_SUPPLIER_DISRUPTION' as any) || 0).toFixed(2)}
                    </td>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: getImpactColor(matrixMap.get('REDUCE_DELAY_AND_COST' as any) || 0) }} className="mono">
                      {(matrixMap.get('REDUCE_DELAY_AND_COST' as any) || 0) >= 0 ? '+' : ''}{(matrixMap.get('REDUCE_DELAY_AND_COST' as any) || 0).toFixed(2)}
                    </td>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: getImpactColor(matrixMap.get('PROTECT_SERVICE_LEVEL' as any) || 0) }} className="mono">
                      {(matrixMap.get('PROTECT_SERVICE_LEVEL' as any) || 0) >= 0 ? '+' : ''}{(matrixMap.get('PROTECT_SERVICE_LEVEL' as any) || 0).toFixed(2)}
                    </td>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: getImpactColor(matrixMap.get('REDUCE_EMISSIONS' as any) || 0) }} className="mono">
                      {(matrixMap.get('REDUCE_EMISSIONS' as any) || 0) >= 0 ? '+' : ''}{(matrixMap.get('REDUCE_EMISSIONS' as any) || 0).toFixed(2)}
                    </td>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: getImpactColor(matrixMap.get('REDUCE_SYSTEMIC_FRAGILITY' as any) || 0) }} className="mono">
                      {(matrixMap.get('REDUCE_SYSTEMIC_FRAGILITY' as any) || 0) >= 0 ? '+' : ''}{(matrixMap.get('REDUCE_SYSTEMIC_FRAGILITY' as any) || 0).toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
