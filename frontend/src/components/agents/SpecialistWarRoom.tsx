import React, { useState } from 'react';
import {
  Bot,
  Play,
  RefreshCw,
  X,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Clock,
  DollarSign,
  Zap,
  CheckCircle2,
  Package,
  Truck,
  Factory,
  Leaf,
  ShieldAlert,
  ArrowRight,
  Layers,
  GitMerge,
  Flame,
} from 'lucide-react';
import {
  AgentId,
  AgentMetadata,
  AgentResult,
  AllSpecialistProposalsResponse,
} from '../../types/agent';
import { runAgent, runAllAgents } from '../../api/agentApi';
import { runCoordinator, runAllWithCoordinator } from '../../api/coordinatorApi';
import { runAdversary } from '../../api/adversaryApi';
import { CoordinatorResult, CandidatePlan } from '../../types/coordinator';
import { AdversaryReport } from '../../types/adversary';
import { CoordinationBoard } from './CoordinationBoard';
import { AdversaryBoard } from './AdversaryBoard';


interface SpecialistWarRoomProps {
  isOpen: boolean;
  onClose: () => void;
  selectedNodeId?: string | null;
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
  inventory: <Package size={18} />,
  supplier: <Factory size={18} />,
  transportation: <Truck size={18} />,
  fulfillment: <Layers size={18} />,
  sustainability: <Leaf size={18} />,
  resilience: <ShieldAlert size={18} />,
};

const SPECIALIST_IDS: AgentId[] = [
  'inventory',
  'supplier',
  'transportation',
  'fulfillment',
  'sustainability',
  'resilience',
];

export const SpecialistWarRoom: React.FC<SpecialistWarRoomProps> = ({
  isOpen,
  onClose,
  selectedNodeId,
  onPreviewCandidate,
  selectedCandidateId,
}) => {
  const [mainTab, setMainTab] = useState<'SPECIALISTS' | 'COORDINATOR' | 'ADVERSARY'>('SPECIALISTS');
  const [loadingAll, setLoadingAll] = useState<boolean>(false);
  const [loadingCoordinator, setLoadingCoordinator] = useState<boolean>(false);
  const [loadingAdversary, setLoadingAdversary] = useState<boolean>(false);
  const [runningAgentId, setRunningAgentId] = useState<string | null>(null);
  const [allProposals, setAllProposals] = useState<AllSpecialistProposalsResponse | null>(null);
  const [individualResults, setIndividualResults] = useState<Record<string, AgentResult>>({});
  const [coordinationResult, setCoordinationResult] = useState<CoordinatorResult | null>(null);
  const [adversaryReport, setAdversaryReport] = useState<AdversaryReport | null>(null);
  const [expandedReasoning, setExpandedReasoning] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<'ALL' | AgentId>('ALL');

  if (!isOpen) return null;

  const handleRunAllSpecialists = async () => {
    setLoadingAll(true);
    try {
      const targetIds = selectedNodeId ? [selectedNodeId] : [];
      const res = await runAllAgents(targetIds);
      setAllProposals(res);
      setIndividualResults(res.results);
    } catch (err) {
      console.error('Failed to run all specialist agents:', err);
    } finally {
      setLoadingAll(false);
    }
  };

  const handleRunCoordinator = async () => {
    setLoadingCoordinator(true);
    try {
      const props = Object.values(individualResults)
        .filter((r) => r.status === 'PROPOSED' && r.proposal)
        .map((r) => r.proposal!);

      const res = props.length > 0 ? await runCoordinator(props) : await runAllWithCoordinator();
      setCoordinationResult(res);
      setMainTab('COORDINATOR');
    } catch (err) {
      console.error('Failed to run coordinator reconciliation:', err);
    } finally {
      setLoadingCoordinator(false);
    }
  };

  const handleRunAdversary = async () => {
    setLoadingAdversary(true);
    try {
      const plans = coordinationResult?.candidate_plans || undefined;
      const coordId = coordinationResult?.coordination_id || '';
      const rep = await runAdversary(plans, coordId);
      setAdversaryReport(rep);
      setMainTab('ADVERSARY');
    } catch (err) {
      console.error('Failed to run adversary red-team stress test:', err);
    } finally {
      setLoadingAdversary(false);
    }
  };


  const handleRunSingle = async (agentId: AgentId) => {
    setRunningAgentId(agentId);
    try {
      const targetIds = selectedNodeId ? [selectedNodeId] : [];
      const res = await runAgent(agentId, targetIds);
      setIndividualResults((prev) => ({
        ...prev,
        [agentId]: res,
      }));
    } catch (err) {
      console.error(`Failed to run agent ${agentId}:`, err);
    } finally {
      setRunningAgentId(null);
    }
  };

  const toggleReasoning = (agentId: string) => {
    setExpandedReasoning((prev) => ({
      ...prev,
      [agentId]: !prev[agentId],
    }));
  };

  const activeResults = Object.values(individualResults);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '720px',
        maxWidth: '92vw',
        background: 'rgba(15, 23, 42, 0.96)',
        backdropFilter: 'blur(16px)',
        borderLeft: '1px solid var(--border-default)',
        boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.6)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideInRight 0.3s ease-out',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-default)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(30, 41, 59, 0.5)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(139, 92, 246, 0.4)',
            }}
          >
            <Bot size={22} color="#FFFFFF" />
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '8px' }}>
              SPECIALIST & COORDINATOR WAR ROOM
              <span className="mono" style={{ fontSize: '10px', background: 'rgba(139, 92, 246, 0.2)', color: '#A78BFA', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(139, 92, 246, 0.4)' }}>
                PHASE 06
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#94A3B8' }}>
              Autonomous Multi-Agent Mitigation & Proposal Reconciliation
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#94A3B8',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.2s',
          }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Main Tab Bar: Specialists vs Coordinator */}
      <div
        style={{
          display: 'flex',
          background: 'rgba(15, 23, 42, 0.8)',
          borderBottom: '1px solid var(--border-default)',
          padding: '4px 24px 0 24px',
          gap: '12px',
        }}
      >
        <button
          onClick={() => setMainTab('SPECIALISTS')}
          style={{
            padding: '10px 18px',
            borderRadius: '6px 6px 0 0',
            border: 'none',
            background: mainTab === 'SPECIALISTS' ? 'rgba(30, 41, 59, 0.9)' : 'transparent',
            color: mainTab === 'SPECIALISTS' ? '#FFFFFF' : '#94A3B8',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderBottom: mainTab === 'SPECIALISTS' ? '2px solid #8B5CF6' : '2px solid transparent',
          }}
        >
          <Bot size={16} color={mainTab === 'SPECIALISTS' ? '#A78BFA' : '#94A3B8'} /> Specialist Proposals (6)
        </button>

        <button
          onClick={() => setMainTab('COORDINATOR')}
          style={{
            padding: '10px 18px',
            borderRadius: '6px 6px 0 0',
            border: 'none',
            background: mainTab === 'COORDINATOR' ? 'rgba(30, 41, 59, 0.9)' : 'transparent',
            color: mainTab === 'COORDINATOR' ? '#FFFFFF' : '#94A3B8',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderBottom: mainTab === 'COORDINATOR' ? '2px solid #4ADE80' : '2px solid transparent',
          }}
        >
          <GitMerge size={16} color={mainTab === 'COORDINATOR' ? '#4ADE80' : '#94A3B8'} /> Coordinator & Candidate Plans
        </button>

        <button
          onClick={() => setMainTab('ADVERSARY')}
          style={{
            padding: '10px 18px',
            borderRadius: '6px 6px 0 0',
            border: 'none',
            background: mainTab === 'ADVERSARY' ? 'rgba(30, 41, 59, 0.9)' : 'transparent',
            color: mainTab === 'ADVERSARY' ? '#FFFFFF' : '#94A3B8',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderBottom: mainTab === 'ADVERSARY' ? '2px solid #EF4444' : '2px solid transparent',
          }}
        >
          <Flame size={16} color={mainTab === 'ADVERSARY' ? '#F87171' : '#94A3B8'} /> Adversary Red-Team
        </button>
      </div>

      {/* Safety Banner */}
      <div
        style={{
          background: 'rgba(59, 130, 246, 0.1)',
          borderBottom: '1px solid rgba(59, 130, 246, 0.2)',
          padding: '8px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <ShieldCheck size={16} color="#60A5FA" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: '11px', color: '#93C5FD', lineHeight: '1.4' }}>
          <strong>Non-Authoritative Safety Boundary:</strong> Specialist proposals, Coordinator plans, and Adversary simulations execute on isolated copies without altering World State.
        </span>
      </div>

      {/* Action Control Bar */}
      <div
        style={{
          padding: '14px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleRunAllSpecialists}
            disabled={loadingAll || loadingCoordinator || loadingAdversary}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '6px',
              background: loadingAll ? 'rgba(139, 92, 246, 0.4)' : 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
              border: 'none',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '12px',
              cursor: loadingAll ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
            }}
          >
            {loadingAll ? <RefreshCw size={14} className="spin" /> : <Play size={14} fill="#FFFFFF" />}
            Run All 6 Specialists
          </button>

          <button
            onClick={handleRunCoordinator}
            disabled={loadingCoordinator || loadingAll || loadingAdversary}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '6px',
              background: loadingCoordinator ? 'rgba(34, 197, 94, 0.4)' : 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
              border: 'none',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '12px',
              cursor: loadingCoordinator ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)',
            }}
          >
            {loadingCoordinator ? <RefreshCw size={14} className="spin" /> : <GitMerge size={14} />}
            Run Coordinator
          </button>

          <button
            onClick={handleRunAdversary}
            disabled={loadingAdversary || loadingAll || loadingCoordinator}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '6px',
              background: loadingAdversary ? 'rgba(239, 68, 68, 0.4)' : 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
              border: 'none',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '12px',
              cursor: loadingAdversary ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
            }}
          >
            {loadingAdversary ? <RefreshCw size={14} className="spin" /> : <Zap size={14} />}
            Run Adversary Red-Team
          </button>
        </div>


        {allProposals && (
          <div className="mono" style={{ fontSize: '11px', color: '#94A3B8' }}>
            Success: <span style={{ color: '#4ADE80', fontWeight: 700 }}>{allProposals.successful_count}</span> / {allProposals.total_agents}
          </div>
        )}
      </div>

      {/* TAB CONTENT 1: SPECIALIST PROPOSALS */}
      {mainTab === 'SPECIALISTS' && (
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {/* Specialist Filter Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '6px',
              padding: '12px 24px 0 24px',
              overflowX: 'auto',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            <button
              onClick={() => setActiveTab('ALL')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px 6px 0 0',
                border: 'none',
                background: activeTab === 'ALL' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                color: activeTab === 'ALL' ? '#FFFFFF' : '#94A3B8',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                borderBottom: activeTab === 'ALL' ? '2px solid #8B5CF6' : '2px solid transparent',
              }}
            >
              All (6)
            </button>
            {SPECIALIST_IDS.map((id) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px 6px 0 0',
                  border: 'none',
                  background: activeTab === id ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  color: activeTab === id ? AGENT_COLORS[id] : '#94A3B8',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderBottom: activeTab === id ? `2px solid ${AGENT_COLORS[id]}` : '2px solid transparent',
                }}
              >
                {AGENT_ICONS[id]}
                <span style={{ textTransform: 'capitalize' }}>{id}</span>
              </button>
            ))}
          </div>

          {/* Cards List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {activeResults.length === 0 && !loadingAll ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(30, 41, 59, 0.3)', borderRadius: '12px', border: '1px dashed var(--border-default)' }}>
                <Bot size={48} color="#64748B" style={{ marginBottom: '16px' }} />
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#E2E8F0', marginBottom: '8px' }}>
                  No Specialist Proposals Generated Yet
                </div>
                <div style={{ fontSize: '13px', color: '#94A3B8', maxWidth: '400px', margin: '0 auto 20px auto' }}>
                  Click <strong>"Run All 6 Specialists"</strong> to execute parallel evaluation.
                </div>
                <button
                  onClick={handleRunAllSpecialists}
                  style={{ padding: '8px 18px', borderRadius: '6px', background: '#8B5CF6', color: '#FFF', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                >
                  Execute All Agents Now
                </button>
              </div>
            ) : (
              SPECIALIST_IDS.filter((id) => activeTab === 'ALL' || activeTab === id).map((agentId) => {
                const res = individualResults[agentId];
                const color = AGENT_COLORS[agentId] || '#8B5CF6';
                const icon = AGENT_ICONS[agentId];
                const isRunningThis = runningAgentId === agentId;
                const isExpanded = !!expandedReasoning[agentId];

                return (
                  <div
                    key={agentId}
                    style={{
                      background: 'rgba(30, 41, 59, 0.5)',
                      borderRadius: '12px',
                      border: `1px solid ${res?.status === 'PROPOSED' ? `${color}40` : 'var(--border-default)'}`,
                      overflow: 'hidden',
                      boxShadow: res?.status === 'PROPOSED' ? `0 4px 20px ${color}15` : 'none',
                    }}
                  >
                    <div style={{ padding: '16px 20px', background: 'rgba(15, 23, 42, 0.4)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: `${color}20`, border: `1px solid ${color}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: color }}>
                          {icon}
                        </div>
                        <div>
                          <div style={{ fontSize: '15px', fontWeight: 700, color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ textTransform: 'capitalize' }}>{agentId} Agent</span>
                            {res?.proposal && (
                              <span className="mono" style={{ fontSize: '10px', background: 'rgba(74, 222, 128, 0.15)', color: '#4ADE80', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(74, 222, 128, 0.3)' }}>
                                {(res.proposal.confidence * 100).toFixed(0)}% Confidence
                              </span>
                            )}
                          </div>
                          <div className="mono" style={{ fontSize: '11px', color: '#94A3B8' }}>
                            Objective: {res?.proposal?.objective || `${agentId.toUpperCase()}_OPTIMIZATION`}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {res && (
                          <div style={{ textAlign: 'right' }}>
                            <div className="mono" style={{ fontSize: '11px', fontWeight: 700, color: res.status === 'PROPOSED' ? '#4ADE80' : '#F87171' }}>
                              {res.status}
                            </div>
                            <div className="mono" style={{ fontSize: '10px', color: '#64748B' }}>
                              {res.latency_ms.toFixed(0)}ms • {res.provider_used}
                            </div>
                          </div>
                        )}

                        <button
                          onClick={() => handleRunSingle(agentId)}
                          disabled={isRunningThis || loadingAll}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            background: isRunningThis ? 'rgba(255,255,255,0.1)' : `${color}25`,
                            border: `1px solid ${color}60`,
                            color: color,
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: isRunningThis ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          {isRunningThis ? <RefreshCw size={12} className="spin" /> : <Play size={12} fill={color} />}
                          Run
                        </button>
                      </div>
                    </div>

                    {!res ? (
                      <div style={{ padding: '16px 20px', fontSize: '12px', color: '#64748B', fontStyle: 'italic' }}>
                        Agent ready. Click 'Run' to evaluate context & generate proposal.
                      </div>
                    ) : res.status !== 'PROPOSED' || !res.proposal ? (
                      <div style={{ padding: '16px 20px' }}>
                        <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px', color: '#FCA5A5', fontSize: '12px' }}>
                          <div style={{ fontWeight: 600, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <AlertTriangle size={14} color="#EF4444" /> Proposal Infeasible
                          </div>
                          <ul style={{ margin: 0, paddingLeft: '20px' }}>
                            {res.violations.map((v, idx) => (
                              <li key={idx}>{v}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div style={{ fontSize: '13px', color: '#E2E8F0', lineHeight: '1.5' }}>
                          {res.proposal.summary}
                        </div>

                        <div>
                          <div style={{ fontSize: '11px', fontWeight: 600, color: '#94A3B8', marginBottom: '8px', textTransform: 'uppercase' }}>
                            Proposed Mitigation Actions ({res.proposal.actions.length})
                          </div>
                          <div style={{ background: 'rgba(15, 23, 42, 0.6)', borderRadius: '8px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
                              <thead>
                                <tr style={{ background: 'rgba(30, 41, 59, 0.8)', color: '#94A3B8' }}>
                                  <th style={{ padding: '8px 12px' }}>Action Type</th>
                                  <th style={{ padding: '8px 12px' }}>Target</th>
                                  <th style={{ padding: '8px 12px' }}>Parameters</th>
                                  <th style={{ padding: '8px 12px' }}>Cost</th>
                                  <th style={{ padding: '8px 12px' }}>Delay</th>
                                </tr>
                              </thead>
                              <tbody>
                                {res.proposal.actions.map((act) => (
                                  <tr key={act.action_id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                    <td style={{ padding: '8px 12px', fontWeight: 600, color: color }}>{act.action_type}</td>
                                    <td style={{ padding: '8px 12px' }} className="mono">{act.target_node_id || act.target_edge_id || 'Global'}</td>
                                    <td style={{ padding: '8px 12px' }} className="mono">{JSON.stringify(act.parameters)}</td>
                                    <td style={{ padding: '8px 12px', color: '#4ADE80' }}>${act.estimated_cost.toLocaleString()}</td>
                                    <td style={{ padding: '8px 12px', color: '#FBBF24' }}>+{act.estimated_delay_hours}h</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Reasoning Accordion */}
                        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                          <button
                            onClick={() => toggleReasoning(agentId)}
                            style={{ background: 'transparent', border: 'none', color: '#94A3B8', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            {isExpanded ? 'Hide Reasoning Trace' : `View Reasoning Trace (${res.proposal.reasoning_trace.length} steps)`}
                          </button>

                          {isExpanded && (
                            <div style={{ marginTop: '8px', padding: '10px 12px', background: 'rgba(15, 23, 42, 0.8)', borderRadius: '6px', fontSize: '11px', color: '#CBD5E1', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              {res.proposal.reasoning_trace.map((step, idx) => (
                                <div key={idx} style={{ display: 'flex', gap: '8px' }}>
                                  <span className="mono" style={{ color: color, fontWeight: 700 }}>[{idx + 1}]</span>
                                  <span>{step}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: COORDINATOR & CANDIDATE PLANS */}
      {mainTab === 'COORDINATOR' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          <CoordinationBoard
            coordinationResult={coordinationResult}
            onPreviewCandidate={onPreviewCandidate}
            selectedCandidateId={selectedCandidateId}
          />
        </div>
      )}

      {/* TAB CONTENT 3: ADVERSARY RED-TEAM */}
      {mainTab === 'ADVERSARY' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          <AdversaryBoard
            report={adversaryReport}
            onRunAdversary={handleRunAdversary}
            isLoading={loadingAdversary}
          />
        </div>
      )}
    </div>
  );
};

