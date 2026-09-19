import React, { useState, useEffect } from 'react';
import {
  Shield,
  Lock,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  FileText,
  RotateCcw,
  Zap,
  Activity,
  Cpu,
} from 'lucide-react';
import {
  ModelCard,
  PolicyEvaluationResult,
  SystemHealthStatus,
  SystemOperationalMode,
} from '../../types/enterprise';
import {
  authorizeExecution,
  clearChaosFaults,
  evaluatePolicy,
  fetchModelCard,
  fetchSystemHealthStatus,
  injectChaosFault,
  setSystemOperationalMode,
} from '../../api/enterpriseApi';

export const GovernanceCenter: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [healthStatus, setHealthStatus] = useState<SystemHealthStatus | null>(null);
  const [modelCard, setModelCard] = useState<ModelCard | null>(null);
  const [policyResult, setPolicyResult] = useState<PolicyEvaluationResult | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [hs, mc, pol] = await Promise.all([
        fetchSystemHealthStatus().catch(() => null),
        fetchModelCard('DemandForecastModel').catch(() => null),
        evaluatePolicy('DEC-GOV-01', { total_cost: 45000.0 }, { expected_service_level: 0.94 }).catch(() => null),
      ]);
      if (hs) setHealthStatus(hs);
      if (mc) setModelCard(mc);
      if (pol) setPolicyResult(pol);
    } catch (err) {
      console.error('Failed to load Governance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSetMode = async (mode: SystemOperationalMode) => {
    try {
      const updated = await setSystemOperationalMode(mode);
      setHealthStatus(updated);
    } catch (err) {
      alert('Error setting operational mode: ' + err);
    }
  };

  const handleInjectFault = async (faultType: string) => {
    try {
      const updated = await injectChaosFault(faultType, 'ollama_provider');
      setHealthStatus(updated);
    } catch (err) {
      alert('Error injecting fault: ' + err);
    }
  };

  const handleClearFaults = async () => {
    try {
      const updated = await clearChaosFaults();
      setHealthStatus(updated);
    } catch (err) {
      alert('Error clearing faults: ' + err);
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
          background: 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.95) 100%)',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Shield size={30} color="#10B981" />
            <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>
              Enterprise Governance & Policy Control Center
            </h1>
          </div>
          <p style={{ margin: '6px 0 0 0', color: '#94A3B8', fontSize: '13px' }}>
            Deterministic Policy Engine • Safe-by-design Execution Plane • Fault Injection & Degradation Management.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => handleSetMode('FULL')}
            style={{
              background: healthStatus?.mode === 'FULL' ? '#10B981' : 'rgba(30,41,59,0.8)',
              color: '#FFF',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            FULL Mode
          </button>
          <button
            onClick={() => handleSetMode('SAFE_MODE')}
            style={{
              background: healthStatus?.mode === 'SAFE_MODE' ? '#EF4444' : 'rgba(30,41,59,0.8)',
              color: '#FFF',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            SAFE Mode
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Section 1: Policy Engine */}
        <div
          style={{
            background: 'rgba(15,23,42,0.7)',
            borderRadius: '10px',
            padding: '20px',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <h3 style={{ margin: '0 0 14px 0', fontSize: '16px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={18} /> Deterministic Server-Side Policy Rules
          </h3>
          {policyResult ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '13px', color: '#94A3B8' }}>Overall Evaluation Result</span>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    background: policyResult.overall_status === 'PASS' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
                    color: policyResult.overall_status === 'PASS' ? '#4ADE80' : '#F87171',
                    padding: '2px 8px',
                    borderRadius: '4px',
                  }}
                >
                  {policyResult.overall_status}
                </span>
              </div>
              {policyResult.evaluations.map((ev, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(30,41,59,0.5)',
                    padding: '12px',
                    borderRadius: '6px',
                    borderLeft: `3px solid ${ev.status === 'PASS' ? '#4ADE80' : '#F87171'}`,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600 }}>
                    <span>{ev.policy_name}</span>
                    <span>{ev.status}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>{ev.explanation}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: '#94A3B8', fontSize: '13px' }}>Loading Policy Engine...</div>
          )}
        </div>

        {/* Section 2: Fault Injection & Degradation */}
        <div
          style={{
            background: 'rgba(15,23,42,0.7)',
            borderRadius: '10px',
            padding: '20px',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <h3 style={{ margin: '0 0 14px 0', fontSize: '16px', color: '#F59E0B', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={18} /> Chaos Fault Injection & System Degradation
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '13px', color: '#CBD5E1' }}>
              Current Mode: <strong style={{ color: '#38BDF8' }}>{healthStatus?.mode || 'FULL'}</strong>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => handleInjectFault('AI_TIMEOUT')}
                style={{
                  background: 'rgba(245,158,11,0.2)',
                  color: '#F59E0B',
                  border: '1px solid rgba(245,158,11,0.4)',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Inject AI Timeout Fault
              </button>
              <button
                onClick={() => handleInjectFault('DATA_ADAPTER_FAIL')}
                style={{
                  background: 'rgba(239,68,68,0.2)',
                  color: '#F87171',
                  border: '1px solid rgba(239,68,68,0.4)',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Inject Data Adapter Fault
              </button>
              <button
                onClick={handleClearFaults}
                style={{
                  background: '#10B981',
                  color: '#FFF',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Clear All Faults
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Standardized Model Card */}
      {modelCard && (
        <div
          style={{
            background: 'rgba(15,23,42,0.8)',
            borderRadius: '10px',
            padding: '20px',
            border: '1px solid rgba(255,255,255,0.08)',
            marginTop: '20px',
          }}
        >
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#38BDF8', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} /> Audit-Ready Standardized Model Card — {modelCard.model_name} (v{modelCard.version})
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', fontSize: '12px', color: '#94A3B8' }}>
            <div>Model ID: <strong style={{ color: '#F1F5F9' }}>{modelCard.model_id}</strong></div>
            <div>Dataset Version: <strong style={{ color: '#F1F5F9' }}>{modelCard.dataset_version}</strong></div>
            <div>Status: <strong style={{ color: '#4ADE80' }}>{modelCard.status}</strong></div>
          </div>
        </div>
      )}
    </div>
  );
};
