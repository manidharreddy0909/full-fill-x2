import React, { useState, useEffect } from 'react';
import {
  Brain,
  ShieldCheck,
  Zap,
  Activity,
  GitCommit,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  PlusCircle,
  Clock,
  Layers,
  Award,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import {
  AgentMemory,
  AgentPerformanceRecord,
  ChallengerModelRecord,
  DeliberationSession,
  FeedbackRecord,
  LearningDataset,
  OutcomeRecord,
} from '../../types/learning';
import {
  activateChallengerModel,
  addAgentMemory,
  fetchAgentMemories,
  fetchAgentPerformance,
  fetchChallengerModels,
  fetchFeedbackRecords,
  fetchLearningDatasets,
  fetchOutcomes,
  recordOutcome,
  rollbackModel,
  trainChallengerModel,
  triggerDeliberation,
  validateAgentMemory,
} from '../../api/learningApi';

export const ResilienceAgentsWorkspace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'WAR_ROOM' | 'DEBATE' | 'MEMORY' | 'OUTCOMES' | 'LEARNING'>('WAR_ROOM');
  const [loading, setLoading] = useState<boolean>(false);

  // Subsystem States
  const [performances, setPerformances] = useState<AgentPerformanceRecord[]>([]);
  const [session, setSession] = useState<DeliberationSession | null>(null);
  const [memories, setMemories] = useState<AgentMemory[]>([]);
  const [outcomes, setOutcomes] = useState<OutcomeRecord[]>([]);
  const [feedbackList, setFeedbackList] = useState<FeedbackRecord[]>([]);
  const [datasets, setDatasets] = useState<LearningDataset[]>([]);
  const [challengers, setChallengers] = useState<ChallengerModelRecord[]>([]);

  // Forms State
  const [newLesson, setNewLesson] = useState<string>('');
  const [newAgentId, setNewAgentId] = useState<string>('inventory');
  const [newDecisionId, setNewDecisionId] = useState<string>('DEC-LIVE-' + Math.floor(Math.random() * 1000));
  const [expectedSla, setExpectedSla] = useState<number>(0.95);
  const [actualSla, setActualSla] = useState<number>(0.92);
  const [expectedCost, setExpectedCost] = useState<number>(45000);
  const [actualCost, setActualCost] = useState<number>(48500);

  const loadData = async () => {
    try {
      setLoading(true);
      const [perfs, mems, outs, fbs, dsets, chals] = await Promise.all([
        fetchAgentPerformance().catch(() => []),
        fetchAgentMemories().catch(() => []),
        fetchOutcomes().catch(() => []),
        fetchFeedbackRecords().catch(() => []),
        fetchLearningDatasets().catch(() => []),
        fetchChallengerModels().catch(() => []),
      ]);
      setPerformances(perfs);
      setMemories(mems);
      setOutcomes(outs);
      setFeedbackList(fbs);
      setDatasets(dsets);
      setChallengers(chals);
    } catch (err) {
      console.error('Failed to load resilience workspace data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTriggerDeliberation = async () => {
    setLoading(true);
    try {
      const res = await triggerDeliberation(['sup-001', 'port-001']);
      setSession(res);
      setActiveTab('DEBATE');
      await loadData();
    } catch (err) {
      alert('Error triggering deliberation: ' + err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLesson.trim()) return;
    try {
      await addAgentMemory({
        agent_id: newAgentId,
        lesson: newLesson,
        confidence: 0.85,
      });
      setNewLesson('');
      await loadData();
    } catch (err) {
      alert('Error adding memory: ' + err);
    }
  };

  const handleValidateMemory = async (memId: string) => {
    try {
      await validateAgentMemory(memId);
      await loadData();
    } catch (err) {
      alert('Error validating memory: ' + err);
    }
  };

  const handleRecordOutcome = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await recordOutcome({
        decision_id: newDecisionId,
        expected_service_level: expectedSla,
        actual_service_level: actualSla,
        expected_cost: expectedCost,
        actual_cost: actualCost,
        expected_recovery_hours: 24,
        actual_recovery_hours: 26,
      });
      setNewDecisionId('DEC-LIVE-' + Math.floor(Math.random() * 1000));
      await loadData();
    } catch (err) {
      alert('Error recording outcome: ' + err);
    }
  };

  const handleRetrainChallenger = async () => {
    setLoading(true);
    try {
      await trainChallengerModel('DemandOutcomeDataset', 'DemandForecastModel');
      await loadData();
      setActiveTab('LEARNING');
    } catch (err) {
      alert('Error retraining challenger model: ' + err);
    } finally {
      setLoading(false);
    }
  };

  const handleActivateChallenger = async (chalId: string) => {
    try {
      await activateChallengerModel(chalId, 'Head of AI Operations', 'Validated lower MAE baseline');
      await loadData();
    } catch (err) {
      alert('Error activating challenger: ' + err);
    }
  };

  const handleRollback = async () => {
    try {
      await rollbackModel('DemandForecastModel', 'Head of Operations');
      await loadData();
    } catch (err) {
      alert('Error rolling back model: ' + err);
    }
  };

  return (
    <div style={{ padding: '24px', color: '#E2E8F0', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          background: 'linear-gradient(135deg, rgba(15,23,42,0.9) 0%, rgba(30,41,59,0.9) 100%)',
          padding: '20px 24px',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Brain size={28} color="#818CF8" />
            <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, letterSpacing: '-0.5px' }}>
              Multi-Agent Resilience & Continuous Learning Platform
            </h1>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                background: 'rgba(99,102,241,0.2)',
                color: '#A5B4FC',
                padding: '4px 10px',
                borderRadius: '12px',
                border: '1px solid rgba(99,102,241,0.4)',
              }}
            >
              PHASE 9 OPERATIONAL
            </span>
          </div>
          <p style={{ margin: '6px 0 0 0', color: '#94A3B8', fontSize: '13px' }}>
            Evidence-first agent deliberation, structured memory provenance, expected vs actual outcome capture, & challenger model retraining.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleTriggerDeliberation}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
              color: '#FFF',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
              transition: 'all 0.2s ease',
            }}
          >
            <Zap size={16} />
            {loading ? 'Deliberating...' : 'Trigger Agent Deliberation'}
          </button>

          <button
            onClick={handleRetrainChallenger}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(30,41,59,0.8)',
              color: '#38BDF8',
              border: '1px solid rgba(56,189,248,0.4)',
              padding: '10px 18px',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <Sparkles size={16} />
            Retrain Challenger Model
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '20px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          paddingBottom: '12px',
        }}
      >
        {[
          { key: 'WAR_ROOM', label: 'Agent War Room Calibration', icon: <Award size={16} /> },
          { key: 'DEBATE', label: 'Live Deliberation & Debate', icon: <Activity size={16} /> },
          { key: 'MEMORY', label: 'Structured Agent Memory', icon: <Brain size={16} /> },
          { key: 'OUTCOMES', label: 'Outcome Explorer & Feedback', icon: <CheckCircle2 size={16} /> },
          { key: 'LEARNING', label: 'Continuous Learning Console', icon: <GitCommit size={16} /> },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === tab.key ? 'rgba(99,102,241,0.2)' : 'transparent',
              color: activeTab === tab.key ? '#818CF8' : '#94A3B8',
              fontWeight: activeTab === tab.key ? 600 : 400,
              cursor: 'pointer',
              borderBottom: activeTab === tab.key ? '2px solid #818CF8' : 'none',
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: WAR ROOM CALIBRATION */}
      {activeTab === 'WAR_ROOM' && (
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: '#F8FAFC' }}>
            Specialist Agent Calibration & Survival Metrics
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {performances.map((perf) => (
              <div
                key={perf.agent_id}
                style={{
                  background: 'rgba(15,23,42,0.6)',
                  borderRadius: '10px',
                  padding: '16px',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0, textTransform: 'capitalize' }}>
                    {perf.agent_id} Agent
                  </h3>
                  <span
                    style={{
                      fontSize: '11px',
                      background: perf.survival_rate >= 0.8 ? 'rgba(34,197,94,0.2)' : 'rgba(234,179,8,0.2)',
                      color: perf.survival_rate >= 0.8 ? '#4ADE80' : '#FACC15',
                      padding: '2px 8px',
                      borderRadius: '4px',
                    }}
                  >
                    {(perf.survival_rate * 100).toFixed(0)}% Survival Rate
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: '#94A3B8', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div>Total Proposals: <strong style={{ color: '#F1F5F9' }}>{perf.proposals_count}</strong></div>
                  <div>Avg Confidence: <strong style={{ color: '#F1F5F9' }}>{(perf.avg_confidence * 100).toFixed(1)}%</strong></div>
                  <div>Calibration MAE: <strong style={{ color: '#38BDF8' }}>{perf.calibration_mae.toFixed(4)}</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: LIVE DEBATE & DELIBERATION */}
      {activeTab === 'DEBATE' && (
        <div>
          {!session ? (
            <div
              style={{
                textAlign: 'center',
                padding: '48px',
                background: 'rgba(15,23,42,0.4)',
                borderRadius: '12px',
                border: '1px dashed rgba(255,255,255,0.1)',
              }}
            >
              <Activity size={36} color="#6366F1" style={{ marginBottom: '12px' }} />
              <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>No Active Deliberation Session</h3>
              <p style={{ margin: '0 0 16px 0', color: '#94A3B8', fontSize: '13px' }}>
                Click "Trigger Agent Deliberation" above to launch bounded multi-agent debate across inventory, supplier, and resilience agents.
              </p>
              <button
                onClick={handleTriggerDeliberation}
                style={{
                  background: '#6366F1',
                  color: '#FFF',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Launch Deliberation Now
              </button>
            </div>
          ) : (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(15,23,42,0.8)',
                  padding: '16px 20px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div>
                  <span style={{ fontSize: '12px', color: '#94A3B8' }}>DELIBERATION SESSION ID</span>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: '#F8FAFC' }}>{session.deliberation_id}</div>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: '#94A3B8' }}>CONSENSUS STATUS</span>
                  <div>
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        background: 'rgba(34,197,94,0.2)',
                        color: '#4ADE80',
                        padding: '4px 10px',
                        borderRadius: '4px',
                      }}
                    >
                      {session.consensus_status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rounds */}
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Multi-Agent Bounded Debate Rounds</h3>
              {session.rounds.map((round) => (
                <div
                  key={round.round_number}
                  style={{
                    background: 'rgba(15,23,42,0.6)',
                    borderRadius: '10px',
                    padding: '16px',
                    marginBottom: '16px',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#818CF8', marginBottom: '10px' }}>
                    Round #{round.round_number} Debate Messages
                  </div>
                  {round.messages.map((msg, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: 'rgba(30,41,59,0.5)',
                        borderRadius: '6px',
                        padding: '12px',
                        marginBottom: '8px',
                        borderLeft: `3px solid ${msg.agent_id === 'adversary' ? '#EF4444' : msg.agent_id === 'verification' ? '#10B981' : '#6366F1'}`,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <strong style={{ textTransform: 'capitalize', color: '#F1F5F9' }}>{msg.agent_id} Agent</strong>
                        <span style={{ fontSize: '12px', color: '#94A3B8' }}>Confidence: {(msg.confidence * 100).toFixed(0)}%</span>
                      </div>
                      <p style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#CBD5E1' }}>{msg.argument}</p>
                      {msg.counter_argument && (
                        <div style={{ fontSize: '12px', color: '#F87171', background: 'rgba(239,68,68,0.1)', padding: '6px 10px', borderRadius: '4px' }}>
                          <strong>Counter-Finding:</strong> {msg.counter_argument}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}

              {/* Evidence Bundle */}
              {session.evidence_bundle && (
                <div
                  style={{
                    background: 'linear-gradient(135deg, rgba(30,41,59,0.8) 0%, rgba(15,23,42,0.9) 100%)',
                    borderRadius: '10px',
                    padding: '16px',
                    border: '1px solid rgba(99,102,241,0.3)',
                    marginTop: '20px',
                  }}
                >
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '15px', color: '#818CF8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck size={18} /> Decision Evidence Bundle Provenance
                  </h4>
                  <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#E2E8F0' }}>
                    Hypothesis: <strong>{session.evidence_bundle.primary_hypothesis}</strong>
                  </p>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#94A3B8' }}>
                    <div>Monte Carlo Resilience Score: <strong style={{ color: '#4ADE80' }}>{(session.evidence_bundle.monte_carlo_resilience_score * 100).toFixed(1)}%</strong></div>
                    <div>Verification Status: <strong style={{ color: session.evidence_bundle.verification_passed ? '#4ADE80' : '#F87171' }}>{session.evidence_bundle.verification_passed ? 'PASSED' : 'FAILED'}</strong></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: STRUCTURED AGENT MEMORY */}
      {activeTab === 'MEMORY' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: '#F8FAFC' }}>
                Active Operational Memories & Lessons Learned
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {memories.map((mem) => (
                  <div
                    key={mem.memory_id}
                    style={{
                      background: 'rgba(15,23,42,0.6)',
                      borderRadius: '8px',
                      padding: '14px',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#818CF8', textTransform: 'uppercase' }}>
                        {mem.agent_id} • {mem.memory_type}
                      </span>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', color: '#94A3B8' }}>Decay: {(mem.decay_factor * 100).toFixed(0)}%</span>
                        <span
                          style={{
                            fontSize: '11px',
                            background: mem.status === 'VALIDATED' ? 'rgba(34,197,94,0.2)' : 'rgba(234,179,8,0.2)',
                            color: mem.status === 'VALIDATED' ? '#4ADE80' : '#FACC15',
                            padding: '2px 6px',
                            borderRadius: '4px',
                          }}
                        >
                          {mem.status}
                        </span>
                        {mem.status !== 'VALIDATED' && (
                          <button
                            onClick={() => handleValidateMemory(mem.memory_id)}
                            style={{
                              background: 'transparent',
                              border: '1px solid #4ADE80',
                              color: '#4ADE80',
                              borderRadius: '4px',
                              fontSize: '10px',
                              padding: '2px 6px',
                              cursor: 'pointer',
                            }}
                          >
                            Validate
                          </button>
                        )}
                      </div>
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: '#E2E8F0' }}>{mem.lesson}</p>
                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '6px' }}>
                      ID: {mem.memory_id} | Confidence: {(mem.confidence * 100).toFixed(0)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <div style={{ background: 'rgba(15,23,42,0.8)', padding: '20px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 style={{ margin: '0 0 14px 0', fontSize: '15px' }}>Record Agent Lesson</h3>
              <form onSubmit={handleAddMemory} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Target Agent</label>
                  <select
                    value={newAgentId}
                    onChange={(e) => setNewAgentId(e.target.value)}
                    style={{ width: '100%', padding: '8px', background: '#1E293B', color: '#FFF', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px' }}
                  >
                    <option value="inventory">Inventory Specialist</option>
                    <option value="supplier">Supplier Specialist</option>
                    <option value="transportation">Transportation Specialist</option>
                    <option value="resilience">Resilience Specialist</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Operational Lesson Learned</label>
                  <textarea
                    rows={4}
                    value={newLesson}
                    onChange={(e) => setNewLesson(e.target.value)}
                    placeholder="e.g. Increase safety buffer on Port-001 during weather alerts"
                    style={{ width: '100%', padding: '8px', background: '#1E293B', color: '#FFF', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px' }}
                  />
                </div>
                <button
                  type="submit"
                  style={{
                    background: '#6366F1',
                    color: '#FFF',
                    border: 'none',
                    padding: '10px',
                    borderRadius: '6px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Record Memory
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: OUTCOME EXPLORER & FEEDBACK */}
      {activeTab === 'OUTCOMES' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: '#F8FAFC' }}>
                Captured Operational Outcomes vs Expectations
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {outcomes.map((out) => (
                  <div
                    key={out.outcome_id}
                    style={{
                      background: 'rgba(15,23,42,0.6)',
                      borderRadius: '8px',
                      padding: '14px',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <strong style={{ fontSize: '14px', color: '#38BDF8' }}>Decision: {out.decision_id}</strong>
                      <span style={{ fontSize: '11px', color: '#94A3B8' }}>{new Date(out.recorded_at).toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', fontSize: '12px' }}>
                      <div>
                        SLA Expected vs Actual:
                        <div><strong style={{ color: '#F1F5F9' }}>{(out.expected_service_level * 100).toFixed(0)}%</strong> vs <strong style={{ color: '#4ADE80' }}>{(out.actual_service_level * 100).toFixed(0)}%</strong></div>
                      </div>
                      <div>
                        Cost Expected vs Actual:
                        <div><strong style={{ color: '#F1F5F9' }}>${out.expected_cost}</strong> vs <strong style={{ color: '#FACC15' }}>${out.actual_cost}</strong></div>
                      </div>
                      <div>
                        Deviations:
                        <div><span style={{ color: out.deviation_service_level >= 0 ? '#4ADE80' : '#F87171' }}>SLA: {(out.deviation_service_level * 100).toFixed(1)}%</span></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Record Outcome Form */}
            <div style={{ background: 'rgba(15,23,42,0.8)', padding: '20px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 style={{ margin: '0 0 14px 0', fontSize: '15px' }}>Record Actual Decision Outcome</h3>
              <form onSubmit={handleRecordOutcome} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#94A3B8' }}>Decision ID</label>
                  <input
                    type="text"
                    value={newDecisionId}
                    onChange={(e) => setNewDecisionId(e.target.value)}
                    style={{ width: '100%', padding: '6px', background: '#1E293B', color: '#FFF', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: '#94A3B8' }}>Expected SLA</label>
                    <input type="number" step="0.01" value={expectedSla} onChange={(e) => setExpectedSla(parseFloat(e.target.value))} style={{ width: '100%', padding: '6px', background: '#1E293B', color: '#FFF', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#94A3B8' }}>Actual SLA</label>
                    <input type="number" step="0.01" value={actualSla} onChange={(e) => setActualSla(parseFloat(e.target.value))} style={{ width: '100%', padding: '6px', background: '#1E293B', color: '#FFF', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px' }} />
                  </div>
                </div>
                <button
                  type="submit"
                  style={{
                    background: '#10B981',
                    color: '#FFF',
                    border: 'none',
                    padding: '8px',
                    borderRadius: '6px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    marginTop: '8px',
                  }}
                >
                  Save Outcome Record
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: CONTINUOUS LEARNING CONSOLE */}
      {activeTab === 'LEARNING' && (
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: '#F8FAFC' }}>
            Challenger Model Governance & Controlled Retraining
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {challengers.map((chal) => (
              <div
                key={chal.challenger_id}
                style={{
                  background: 'rgba(15,23,42,0.7)',
                  borderRadius: '10px',
                  padding: '18px',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div>
                    <strong style={{ fontSize: '16px', color: '#38BDF8' }}>{chal.model_name} (v{chal.version})</strong>
                    <div style={{ fontSize: '12px', color: '#94A3B8' }}>Challenger ID: {chal.challenger_id}</div>
                  </div>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      background: chal.status === 'PROMOTED' ? 'rgba(34,197,94,0.2)' : 'rgba(234,179,8,0.2)',
                      color: chal.status === 'PROMOTED' ? '#4ADE80' : '#FACC15',
                      padding: '4px 10px',
                      borderRadius: '4px',
                    }}
                  >
                    {chal.status}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', background: 'rgba(30,41,59,0.5)', padding: '12px', borderRadius: '6px', marginBottom: '14px' }}>
                  <div>Baseline Active MAE: <strong style={{ color: '#F87171' }}>{chal.baseline_metric.toFixed(4)}</strong></div>
                  <div>Challenger MAE: <strong style={{ color: '#4ADE80' }}>{chal.challenger_metric.toFixed(4)}</strong></div>
                  <div>Checksum: <code style={{ color: '#CBD5E1', fontSize: '11px' }}>{chal.checksum.substring(0, 12)}...</code></div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  {chal.status === 'CANDIDATE' && (
                    <button
                      onClick={() => handleActivateChallenger(chal.challenger_id)}
                      style={{
                        background: '#10B981',
                        color: '#FFF',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <CheckCircle2 size={16} /> Human Gate Approval & Activate
                    </button>
                  )}
                  <button
                    onClick={handleRollback}
                    style={{
                      background: 'rgba(239,68,68,0.2)',
                      color: '#F87171',
                      border: '1px solid rgba(239,68,68,0.4)',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <RotateCcw size={16} /> One-Click Rollback Model
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
