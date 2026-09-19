import React, { useState, useEffect } from 'react';
import {
  Play,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Bot,
  Layers,
  Cpu,
  ArrowRight,
  FileText,
  Lock,
  ThumbsUp,
  ThumbsDown,
  XCircle,
  Activity,
  Award,
  Wifi,
  Zap,
} from 'lucide-react';
import {
  DecisionSession,
  DecisionStage,
  DecisionStageRecord,
  EvidenceLink,
} from '../../types/cockpit';
import { CandidatePlan } from '../../types/coordinator';
import {
  createCockpitSession,
  fetchCockpitSession,
  runCockpitLoop,
  runCockpitStage,
  approveCockpitPlan,
  rejectCockpitPlan,
  resetCockpitSession,
} from '../../api/cockpitApi';
import { EvidenceDrawer } from './EvidenceDrawer';
import { useRealtimeStore, realtimeStore } from '../../store/realtimeStore';

interface DecisionCockpitProps {
  isOpen: boolean;
  onClose: () => void;
  onPreviewCandidate?: (candidate: CandidatePlan) => void;
}

const STAGE_ORDER: { stage: DecisionStage; label: string; num: string }[] = [
  { stage: 'OBSERVING', label: 'Observe', num: '01' },
  { stage: 'ANALYZING_RISK', label: 'Risk', num: '02' },
  { stage: 'RUNNING_SPECIALISTS', label: 'Specialists', num: '03' },
  { stage: 'COORDINATING', label: 'Coordinate', num: '04' },
  { stage: 'ADVERSARIAL_TESTING', label: 'Adversary', num: '05' },
  { stage: 'OPTIMIZING', label: 'Optimize', num: '06' },
  { stage: 'VERIFYING', label: 'Verify', num: '07' },
  { stage: 'READY_FOR_APPROVAL', label: 'Approval', num: '08' },
];

export const DecisionCockpit: React.FC<DecisionCockpitProps> = ({
  isOpen,
  onClose,
  onPreviewCandidate,
}) => {
  const [session, setSession] = useState<DecisionSession | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('candidate-a');
  const [approverName, setApproverName] = useState<string>('Chief Supply Chain Officer');
  const [rationale, setRationale] = useState<string>(
    'Plan verified by sandbox simulation with zero capacity errors or stock-out risk.'
  );

  // Evidence Drawer state
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceLink | null>(null);
  const [isEvidenceOpen, setIsEvidenceOpen] = useState<boolean>(false);

  // Real-time Event Store
  const { connectionStatus, events: realtimeEvents, stageStatus: rtStageStatus } = useRealtimeStore();

  useEffect(() => {
    if (isOpen && !session) {
      handleCreateSession();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && session?.session_id) {
      realtimeStore.connectSession(session.session_id);
    }
  }, [isOpen, session?.session_id]);

  if (!isOpen) return null;

  const handleCreateSession = async () => {
    try {
      setLoading(true);
      const sess = await createCockpitSession('double_punch', 42);
      setSession(sess);
      if (sess.coordination_result?.candidate_plans.length) {
        setSelectedPlanId(sess.coordination_result.candidate_plans[0].candidate_id);
      }
    } catch (err) {
      console.error('Failed to create cockpit session:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunFullLoop = async () => {
    if (!session) return;
    try {
      setLoading(true);
      const sess = await runCockpitLoop(session.session_id);
      setSession(sess);
      if (sess.coordination_result?.candidate_plans.length) {
        setSelectedPlanId(sess.coordination_result.candidate_plans[0].candidate_id);
      }
    } catch (err) {
      console.error('Failed to run full cockpit loop:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunStage = async (stage: DecisionStage) => {
    if (!session) return;
    try {
      setLoading(true);
      const sess = await runCockpitStage(session.session_id, stage);
      setSession(sess);
    } catch (err) {
      console.error(`Failed to run stage ${stage}:`, err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!session || !selectedPlanId) return;
    try {
      setLoading(true);
      const sess = await approveCockpitPlan(
        session.session_id,
        selectedPlanId,
        approverName,
        rationale
      );
      setSession(sess);
    } catch (err) {
      console.error('Failed to approve plan:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!session || !selectedPlanId) return;
    try {
      setLoading(true);
      const sess = await rejectCockpitPlan(
        session.session_id,
        selectedPlanId,
        approverName,
        rationale
      );
      setSession(sess);
    } catch (err) {
      console.error('Failed to reject plan:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!session) return;
    try {
      setLoading(true);
      const sess = await resetCockpitSession(session.session_id);
      setSession(sess);
    } catch (err) {
      console.error('Failed to reset session:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStageRecord = (stg: DecisionStage): DecisionStageRecord | undefined => {
    return session?.timeline.stages.find((s) => s.stage === stg);
  };

  const candidatePlans: CandidatePlan[] = session?.coordination_result?.candidate_plans || [];
  const activePlan = candidatePlans.find(
    (p) => p.candidate_id === selectedPlanId || (p as any).plan_id === selectedPlanId
  );

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 90,
        background: 'rgba(10, 14, 23, 0.95)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Top Header */}
      <div
        className="glass-panel"
        style={{
          borderRadius: 0,
          borderLeft: 0,
          borderRight: 0,
          borderTop: 0,
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-canvas)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(124, 58, 237, 0.4)',
            }}
          >
            <Cpu size={22} color="#FFFFFF" />
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              FULFILL<span style={{ color: '#A78BFA' }}>-X</span> DECISION COCKPIT
              <span
                className="mono"
                style={{
                  fontSize: '10px',
                  background: 'rgba(139, 92, 246, 0.15)',
                  color: '#A78BFA',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  border: '1px solid rgba(139, 92, 246, 0.4)',
                }}
              >
                PHASE 10
              </span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Unified End-to-End Decision Console & Provenance Workflow
            </div>
          </div>
        </div>

        {/* Live Workflow Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* WebSocket Live Status */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              background: connectionStatus === 'CONNECTED' ? 'rgba(46, 204, 113, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: `1px solid ${connectionStatus === 'CONNECTED' ? '#2ECC71' : '#EF4444'}`,
            }}
          >
            <Wifi size={14} color={connectionStatus === 'CONNECTED' ? '#2ECC71' : '#EF4444'} className={connectionStatus === 'RECONNECTING' ? 'spin' : ''} />
            <span className="mono" style={{ fontSize: '11px', fontWeight: 700, color: connectionStatus === 'CONNECTED' ? '#2ECC71' : '#EF4444' }}>
              WS: {connectionStatus}
            </span>
          </div>

          <button
            onClick={handleRunFullLoop}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
              border: 'none',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '13px',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 0 14px rgba(124, 58, 237, 0.3)',
            }}
          >
            <Play size={16} fill="#FFFFFF" /> RUN FULL DECISION LOOP
          </button>

          <button
            onClick={handleReset}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              borderRadius: '6px',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '12px',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            <RefreshCw size={14} /> Reset Session
          </button>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '6px',
            }}
          >
            <XCircle size={22} />
          </button>
        </div>
      </div>

      {/* Main Cockpit Body */}
      <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Executive Summary Bar */}
        {session?.summary && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '16px',
            }}
          >
            <div className="glass-panel" style={{ padding: '16px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '6px' }}>
                NETWORK HEALTH
              </div>
              <div className="mono" style={{ fontSize: '24px', fontWeight: 700, color: session.summary.network_health_score >= 0.8 ? 'var(--color-healthy)' : 'var(--color-warning)' }}>
                {(session.summary.network_health_score * 100).toFixed(1)}%
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {session.summary.active_disruption_count} active disruptions
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '16px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '6px' }}>
                RISKS & SPECIALISTS
              </div>
              <div className="mono" style={{ fontSize: '24px', fontWeight: 700, color: '#5B93F6' }}>
                {session.summary.specialist_proposal_count} Proposals
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Across {session.summary.affected_node_count} affected nodes
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '16px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '6px' }}>
                RECONCILED PLANS
              </div>
              <div className="mono" style={{ fontSize: '24px', fontWeight: 700, color: '#A78BFA' }}>
                {session.summary.candidate_plan_count} Candidates
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {session.summary.pareto_candidate_count} Pareto optimal
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '16px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '6px' }}>
                ADVERSARY RED-TEAM
              </div>
              <div className="mono" style={{ fontSize: '24px', fontWeight: 700, color: session.summary.adversarial_vulnerability_count > 0 ? '#FF453A' : 'var(--color-healthy)' }}>
                {session.summary.adversarial_vulnerability_count} Fragilities
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Attack suite evaluated
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '16px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '6px' }}>
                VERIFICATION STATUS
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  className="mono"
                  style={{
                    fontSize: '14px',
                    fontWeight: 800,
                    padding: '4px 10px',
                    borderRadius: '4px',
                    background:
                      session.summary.verification_status === 'VERIFIED'
                        ? 'rgba(46, 204, 113, 0.15)'
                        : 'rgba(231, 76, 60, 0.15)',
                    color:
                      session.summary.verification_status === 'VERIFIED'
                        ? 'var(--color-healthy)'
                        : '#FF453A',
                    border: `1px solid ${
                      session.summary.verification_status === 'VERIFIED'
                        ? 'var(--color-healthy)'
                        : '#FF453A'
                    }`,
                  }}
                >
                  {session.summary.verification_status}
                </span>
                <span className="mono" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {session.summary.verification_pass_rate}% Pass
                </span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Zero state mutation verified
              </div>
            </div>
          </div>
        )}

        {/* Workflow Stage Timeline */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Decision Workflow Timeline
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '12px' }}>
            {STAGE_ORDER.map(({ stage, label, num }) => {
              const rec = getStageRecord(stage);
              const rtInfo = rtStageStatus[stage];
              const isCompleted = rec?.status === 'COMPLETED' || rtInfo?.status === 'COMPLETED';
              const isRunning = rec?.status === 'RUNNING' || rtInfo?.status === 'RUNNING';
              const isFailed = rec?.status === 'FAILED' || rtInfo?.status === 'FAILED';
              const isCurrent = session?.current_stage === stage || isRunning;

              return (
                <div
                  key={stage}
                  onClick={() => handleRunStage(stage)}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    background: isRunning ? 'rgba(139, 92, 246, 0.25)' : isCurrent ? 'rgba(124, 58, 237, 0.15)' : 'var(--bg-canvas)',
                    border: isRunning
                      ? '1px solid #A78BFA'
                      : isCurrent
                      ? '1px solid #8B5CF6'
                      : isCompleted
                      ? '1px solid rgba(46, 204, 113, 0.3)'
                      : '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span className="mono" style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 700 }}>
                      {num}
                    </span>
                    {isCompleted ? (
                      <CheckCircle2 size={14} color="var(--color-healthy)" />
                    ) : isRunning ? (
                      <RefreshCw size={14} color="#A78BFA" className="spin" />
                    ) : isFailed ? (
                      <AlertTriangle size={14} color="#FF453A" />
                    ) : (
                      <Clock size={14} color="var(--text-secondary)" />
                    )}
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: isRunning ? '#A78BFA' : isCurrent ? '#A78BFA' : 'var(--text-primary)' }}>
                    {label}
                  </div>
                  <div className="mono" style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {rtInfo?.duration_ms ? `${rtInfo.duration_ms.toFixed(0)}ms` : rec ? `${rec.duration_ms.toFixed(0)}ms` : isRunning ? 'Executing...' : 'Not Started'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Plan Comparison & Human Approval Split */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
          {/* Candidate Plan Comparison Matrix */}
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Reconciled Candidate Plans (A / B / C)
              </h4>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Multi-objective Pareto Dominance
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {candidatePlans.map((plan) => {
                const pid = plan.candidate_id;
                const isSelected = pid === selectedPlanId;

                return (
                  <div
                    key={pid}
                    onClick={() => {
                      setSelectedPlanId(pid);
                      if (onPreviewCandidate) onPreviewCandidate(plan);
                    }}
                    style={{
                      padding: '16px',
                      borderRadius: '8px',
                      background: isSelected ? 'rgba(124, 58, 237, 0.12)' : 'var(--bg-canvas)',
                      border: isSelected ? '2px solid #8B5CF6' : '1px solid var(--border-default)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className="mono" style={{ fontSize: '12px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: 'rgba(139, 92, 246, 0.2)', color: '#A78BFA' }}>
                          {pid.toUpperCase()}
                        </span>
                        <h5 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {plan.name}
                        </h5>
                      </div>
                      <span className="mono" style={{ fontSize: '11px', color: 'var(--color-healthy)', fontWeight: 600 }}>
                        {plan.status}
                      </span>
                    </div>

                    <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      {plan.description}
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', background: 'var(--bg-surface-elevated)', padding: '10px', borderRadius: '6px' }}>
                      <div>
                        <span className="mono" style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>EST. COST</span>
                        <div className="mono" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                          ${plan.estimated_total_cost.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span className="mono" style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>MAX DELAY</span>
                        <div className="mono" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {plan.estimated_max_delay_hours} hrs
                        </div>
                      </div>
                      <div>
                        <span className="mono" style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>CO2 EMISSIONS</span>
                        <div className="mono" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {plan.estimated_total_emissions_co2_kg} kg
                        </div>
                      </div>
                      <div>
                        <span className="mono" style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>ACTIONS</span>
                        <div className="mono" style={{ fontSize: '12px', fontWeight: 700, color: '#A78BFA' }}>
                          {plan.actions.length} Interventions
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Human Approval Gate Card */}
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-default)', paddingBottom: '12px' }}>
              <Lock size={18} color="#A78BFA" />
              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Human Approval Gate
              </h4>
            </div>

            {/* Immutability Safety Badge */}
            <div style={{ padding: '10px 12px', borderRadius: '6px', background: 'rgba(46, 204, 113, 0.1)', border: '1px solid rgba(46, 204, 113, 0.3)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={16} color="var(--color-healthy)" />
              <span style={{ fontSize: '11px', color: 'var(--color-healthy)', fontWeight: 600 }}>
                NON-DESTRUCTIVE: Approval logs decision without mutating world state.
              </span>
            </div>

            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                SELECTED PLAN FOR APPROVAL
              </label>
              <select
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  background: 'var(--bg-canvas)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-default)',
                  fontSize: '13px',
                }}
              >
                {candidatePlans.map((p) => (
                  <option key={p.candidate_id} value={p.candidate_id}>
                    {p.candidate_id.toUpperCase()}: {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                APPROVER PERSONA
              </label>
              <input
                type="text"
                value={approverName}
                onChange={(e) => setApproverName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  background: 'var(--bg-canvas)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-default)',
                  fontSize: '13px',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                DECISION RATIONALE
              </label>
              <textarea
                value={rationale}
                onChange={(e) => setRationale(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  background: 'var(--bg-canvas)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-default)',
                  fontSize: '12px',
                  resize: 'none',
                }}
              />
            </div>

            {/* Decision Status if decided */}
            {session?.approval_decision && (
              <div
                style={{
                  padding: '12px',
                  borderRadius: '6px',
                  background:
                    session.approval_decision.status === 'APPROVED'
                      ? 'rgba(46, 204, 113, 0.15)'
                      : 'rgba(231, 76, 60, 0.15)',
                  border: `1px solid ${
                    session.approval_decision.status === 'APPROVED'
                      ? 'var(--color-healthy)'
                      : '#FF453A'
                  }`,
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: 700, color: session.approval_decision.status === 'APPROVED' ? 'var(--color-healthy)' : '#FF453A' }}>
                  DECISION: {session.approval_decision.status}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {session.approval_decision.plan_name} • {session.approval_decision.approver}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: 'auto' }}>
              <button
                onClick={handleApprove}
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '10px',
                  borderRadius: '6px',
                  background: 'rgba(46, 204, 113, 0.2)',
                  border: '1px solid var(--color-healthy)',
                  color: 'var(--color-healthy)',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                <ThumbsUp size={16} /> APPROVE PLAN
              </button>

              <button
                onClick={handleReject}
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '10px',
                  borderRadius: '6px',
                  background: 'rgba(231, 76, 60, 0.2)',
                  border: '1px solid #FF453A',
                  color: '#FF453A',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                <ThumbsDown size={16} /> REJECT PLAN
              </button>
            </div>
          </div>
        </div>        {/* Traceable Evidence Chain, Audit Log, and Live WebSocket Stream */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
          {/* Evidence Chain Panel */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h4 style={{ margin: '0 0 14px 0', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Inspectable Evidence Chain
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
              {session?.evidence_chain.map((ev) => (
                <div
                  key={ev.evidence_id}
                  onClick={() => {
                    setSelectedEvidence(ev);
                    setIsEvidenceOpen(true);
                  }}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '6px',
                    background: 'var(--bg-canvas)',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {ev.title}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      Stage: {ev.source_stage} • {ev.entity_type}
                    </div>
                  </div>
                  <ArrowRight size={14} color="#5B93F6" />
                </div>
              ))}
            </div>
          </div>

          {/* Audit Log Panel */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h4 style={{ margin: '0 0 14px 0', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Chronological Audit Trail
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
              {session?.audit_trail.map((evt) => (
                <div
                  key={evt.event_id}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: 'var(--bg-canvas)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <span className="mono" style={{ fontSize: '11px', fontWeight: 700, color: '#A78BFA' }}>
                      {evt.action}
                    </span>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      Actor: {evt.actor} • Stage: {evt.stage}
                    </div>
                  </div>
                  <span className="mono" style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                    {new Date(evt.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Live WebSocket Event Stream Panel */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={14} color="#A78BFA" /> Live Event Stream
              </h4>
              <span className="mono" style={{ fontSize: '10px', color: connectionStatus === 'CONNECTED' ? '#4ADE80' : '#F87171', fontWeight: 700 }}>
                {realtimeEvents.length} events
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
              {realtimeEvents.length === 0 ? (
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }}>
                  Awaiting real-time WebSocket events...
                </div>
              ) : (
                realtimeEvents.map((evt) => (
                  <div
                    key={evt.event_id}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      background: 'var(--bg-canvas)',
                      border: `1px solid ${evt.severity === 'CRITICAL' || evt.severity === 'HIGH' ? 'rgba(239, 68, 68, 0.4)' : 'var(--border-subtle)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="mono" style={{ fontSize: '10px', fontWeight: 700, background: 'rgba(139, 92, 246, 0.2)', color: '#A78BFA', padding: '1px 4px', borderRadius: '3px' }}>
                          #{evt.sequence}
                        </span>
                        <span className="mono" style={{ fontSize: '11px', fontWeight: 700, color: evt.severity === 'CRITICAL' || evt.severity === 'HIGH' ? '#F87171' : 'var(--text-primary)' }}>
                          {evt.event_type}
                        </span>
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Stage: {evt.stage || 'GLOBAL'} • Src: {evt.source}
                      </div>
                    </div>
                    <span className="mono" style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>
                      {new Date(evt.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Inspectable Evidence Drawer */}
      <EvidenceDrawer
        isOpen={isEvidenceOpen}
        onClose={() => setIsEvidenceOpen(false)}
        evidence={selectedEvidence}
        allEvidence={session?.evidence_chain || []}
      />
    </div>
  );
};
