import React, { useState, useEffect } from 'react';
import {
  Activity,
  ShieldCheck,
  Zap,
  Play,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Award,
  Clock,
  FileText,
  Lock,
  Cpu,
  RefreshCw,
  Sliders,
} from 'lucide-react';
import {
  ExecutiveDecisionRecord,
  ResilienceCycleStatus,
  ResilienceScorecard,
  SystemHealthStatus,
} from '../../types/enterprise';
import {
  executeResilienceCycle,
  fetchResilienceScorecard,
  fetchSystemHealthStatus,
} from '../../api/enterpriseApi';

export const ResilienceOSWorkspace: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [scorecard, setScorecard] = useState<ResilienceScorecard | null>(null);
  const [healthStatus, setHealthStatus] = useState<SystemHealthStatus | null>(null);
  const [activeCycle, setActiveCycle] = useState<ResilienceCycleStatus | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sc, hs] = await Promise.all([
        fetchResilienceScorecard().catch(() => null),
        fetchSystemHealthStatus().catch(() => null),
      ]);
      if (sc) setScorecard(sc);
      if (hs) setHealthStatus(hs);
    } catch (err) {
      console.error('Failed to load Resilience OS data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExecuteCycle = async () => {
    setLoading(true);
    try {
      const res = await executeResilienceCycle(['sup-001', 'port-001'], 'Head of Resilience Operations', 'DRY_RUN');
      setActiveCycle(res);
      await loadData();
    } catch (err) {
      alert('Error executing cycle: ' + err);
    } finally {
      setLoading(false);
    }
  };

  const STAGES = [
    'OBSERVING',
    'INTELLIGENCE_READY',
    'RISK_ASSESSMENT',
    'SCENARIO_GENERATION',
    'SIMULATION',
    'AGENT_DELIBERATION',
    'ADVERSARIAL_TEST',
    'PLAN_OPTIMIZATION',
    'VERIFICATION',
    'HUMAN_APPROVAL',
    'EXECUTION_READY',
    'EXECUTING',
    'OUTCOME_CAPTURE',
    'LEARNING',
    'COMPLETE',
  ];

  return (
    <div style={{ padding: '24px', color: '#E2E8F0', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Top Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          background: 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.95) 100%)',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Cpu size={32} color="#38BDF8" />
            <h1 style={{ fontSize: '26px', fontWeight: 800, margin: 0, letterSpacing: '-0.5px', color: '#F8FAFC' }}>
              FULFILL-X RESILIENCE OS
            </h1>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                background: healthStatus?.mode === 'FULL' ? 'rgba(34,197,94,0.2)' : 'rgba(234,179,8,0.2)',
                color: healthStatus?.mode === 'FULL' ? '#4ADE80' : '#FACC15',
                padding: '4px 12px',
                borderRadius: '12px',
                border: `1px solid ${healthStatus?.mode === 'FULL' ? 'rgba(34,197,94,0.4)' : 'rgba(234,179,8,0.4)'}`,
              }}
            >
              {healthStatus?.mode || 'FULL'} OPERATIONAL
            </span>
          </div>
          <p style={{ margin: '8px 0 0 0', color: '#94A3B8', fontSize: '14px' }}>
            Continuous operational intelligence cycle • Multi-tenant enterprise governance • Safe-by-design execution plane.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleExecuteCycle}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
              color: '#FFF',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '14px',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 16px rgba(14,165,233,0.4)',
              transition: 'all 0.2s ease',
            }}
          >
            <Play size={18} />
            {loading ? 'Executing Operational Cycle...' : 'Execute Resilience OS Cycle'}
          </button>
        </div>
      </div>

      {/* 10-Dimensional Resilience Scorecard */}
      {scorecard && (
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0, color: '#F8FAFC' }}>
              Decomposable 10-Dimensional Resilience Scorecard
            </h2>
            <span style={{ fontSize: '12px', color: '#94A3B8' }}>
              Calculated at {new Date(scorecard.calculated_at).toLocaleTimeString()}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' }}>
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(30,41,59,0.9) 0%, rgba(15,23,42,0.9) 100%)',
                padding: '18px',
                borderRadius: '10px',
                border: '1px solid rgba(56,189,248,0.4)',
                boxShadow: '0 4px 14px rgba(56,189,248,0.1)',
              }}
            >
              <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600 }}>OVERALL RESILIENCE SCORE</div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#38BDF8', margin: '4px 0' }}>
                {(scorecard.overall_resilience * 100).toFixed(1)}%
              </div>
              <div style={{ fontSize: '11px', color: '#4ADE80' }}>✓ Weighted Aggregate Benchmark</div>
            </div>

            {[
              { label: 'Service Resilience', value: scorecard.service_resilience },
              { label: 'Recovery Resilience', value: scorecard.recovery_resilience },
              { label: 'Cost Resilience', value: scorecard.cost_resilience },
              { label: 'Supplier Resilience', value: scorecard.supplier_resilience },
              { label: 'Transport Resilience', value: scorecard.transportation_resilience },
              { label: 'Inventory Resilience', value: scorecard.inventory_resilience },
              { label: 'Infrastructure Resilience', value: scorecard.infrastructure_resilience },
              { label: 'Adversarial Resilience', value: scorecard.adversarial_resilience },
              { label: 'Prediction Confidence', value: scorecard.prediction_confidence },
            ].map((metric, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(15,23,42,0.6)',
                  padding: '14px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>{metric.label}</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#F1F5F9', marginTop: '4px' }}>
                  {(metric.value * 100).toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 15-Stage Canonical Cycle State Machine */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '14px', color: '#F8FAFC' }}>
          Canonical 15-Stage Operational Cycle Lifecycle
        </h2>
        <div
          style={{
            background: 'rgba(15,23,42,0.7)',
            borderRadius: '10px',
            padding: '20px',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
            {STAGES.map((st, idx) => {
              const isCurrent = activeCycle?.stage === st;
              const isPast = activeCycle && STAGES.indexOf(activeCycle.stage) > idx;
              return (
                <div
                  key={st}
                  style={{
                    flex: '0 0 auto',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    background: isCurrent
                      ? '#38BDF8'
                      : isPast
                      ? 'rgba(34,197,94,0.2)'
                      : 'rgba(30,41,59,0.6)',
                    color: isCurrent ? '#0F172A' : isPast ? '#4ADE80' : '#94A3B8',
                    border: `1px solid ${isCurrent ? '#38BDF8' : isPast ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.06)'}`,
                  }}
                >
                  #{idx + 1} {st.replace('_', ' ')}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Executive Decision Record Inspector */}
      {activeCycle?.executive_record && (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(30,41,59,0.9) 0%, rgba(15,23,42,0.9) 100%)',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid rgba(56,189,248,0.3)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FileText size={22} color="#38BDF8" />
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#F8FAFC' }}>
                Executive Decision Record — {activeCycle.executive_record.decision_id}
              </h3>
            </div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                background: 'rgba(34,197,94,0.2)',
                color: '#4ADE80',
                padding: '4px 10px',
                borderRadius: '4px',
              }}
            >
              SAFE DRY-RUN EXECUTED
            </span>
          </div>

          <p style={{ fontSize: '14px', color: '#CBD5E1', margin: '0 0 16px 0' }}>
            {activeCycle.executive_record.summary}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', fontSize: '13px', background: 'rgba(15,23,42,0.6)', padding: '16px', borderRadius: '8px' }}>
            <div>Risk Level: <strong style={{ color: '#F87171' }}>{activeCycle.executive_record.risk_level}</strong></div>
            <div>Consensus Status: <strong style={{ color: '#4ADE80' }}>{activeCycle.executive_record.consensus_status}</strong></div>
            <div>Verification: <strong style={{ color: '#4ADE80' }}>{activeCycle.executive_record.verification_passed ? 'PASSED' : 'FAILED'}</strong></div>
            <div>Policy Check: <strong style={{ color: '#38BDF8' }}>{activeCycle.executive_record.policy_evaluation_status}</strong></div>
          </div>
        </div>
      )}
    </div>
  );
};
