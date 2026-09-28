/**
 * ContextBar — Global Resilience Situational Awareness Strip (Phase 6C)
 *
 * Persists active incident, node, and Hindsight memory context across all workspaces.
 * Provides instant one-click deep links with context carryover to deep studios.
 */
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useIncidentContextStore } from '../../store/incidentContextStore';
import { TruthTag } from './TruthTag';
import {
  AlertTriangle,
  GitFork,
  GitBranch,
  ShieldAlert,
  Bot,
  Eye,
  Brain,
  X,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const ContextBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    activeIncident,
    selectedNodeId,
    selectedStrategy,
    recalledExperienceIds,
    selectedGenomeId,
    truthMode,
    clearActiveIncident,
    setActiveIncident,
  } = useIncidentContextStore();

  const handleDeepLink = (path: string) => {
    const url = selectedNodeId ? `${path}?node=${encodeURIComponent(selectedNodeId)}` : path;
    navigate(url);
  };

  const handleSimulateDisruption = () => {
    setActiveIncident({
      id: 'INC-2026-SUP002',
      title: 'Supplier B (sup-002) Production Shock',
      severity: 'HIGH',
      affectedNodes: ['sup-002', 'wh-001', 'port-001'],
      symptoms: ['Throughput drop > 60%', 'Inbound supply delay'],
      detectedAt: new Date().toISOString(),
      status: 'ACTIVE',
      presetKey: 'double_punch',
    });
  };

  const isNominal = !activeIncident;

  return (
    <div
      className="context-bar"
      style={{
        background: isNominal ? 'rgba(7, 13, 26, 0.7)' : 'rgba(15, 8, 12, 0.88)',
        borderBottom: `1px solid ${isNominal ? 'rgba(255, 255, 255, 0.06)' : 'rgba(232, 80, 58, 0.25)'}`,
        padding: '5px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '11px',
        fontFamily: 'var(--font-mono)',
        backdropFilter: 'blur(8px)',
        zIndex: 20,
        position: 'relative',
        minHeight: '34px',
        gap: '12px',
        flexWrap: 'wrap',
      }}
    >
      {/* Left: Active Incident Context */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
        {isNominal ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
            <ShieldCheck size={13} color="#34c77b" />
            <span style={{ fontWeight: 700, color: '#34c77b', fontSize: '10px' }}>SYSTEM NOMINAL</span>
            <span style={{ color: '#334155' }}>·</span>
            <span style={{ fontSize: '10px', color: '#64748b' }}>No active disruption thread</span>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 6px',
                borderRadius: '4px',
                background: activeIncident.severity === 'CRITICAL' ? 'rgba(232, 80, 58, 0.2)' : 'rgba(245, 166, 35, 0.2)',
                color: activeIncident.severity === 'CRITICAL' ? '#f87171' : '#fb923c',
                border: `1px solid ${activeIncident.severity === 'CRITICAL' ? 'rgba(232, 80, 58, 0.4)' : 'rgba(245, 166, 35, 0.4)'}`,
                fontWeight: 800,
                fontSize: '9px',
                letterSpacing: '0.05em',
                flexShrink: 0,
              }}
            >
              <AlertTriangle size={10} />
              {activeIncident.severity}
            </div>

            <span
              style={{
                fontWeight: 700,
                color: '#e2e8f0',
                fontSize: '11px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {activeIncident.title}
            </span>

            {selectedNodeId && (
              <span
                onClick={() => navigate(`/world/node/${selectedNodeId}`)}
                title="Click to view node details"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  padding: '1px 6px',
                  borderRadius: '3px',
                  background: 'rgba(56, 189, 248, 0.1)',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  fontSize: '9px',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                NODE: {selectedNodeId}
              </span>
            )}

            {selectedStrategy && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  padding: '1px 6px',
                  borderRadius: '3px',
                  background: 'rgba(124, 58, 237, 0.12)',
                  color: '#c4b5fd',
                  border: '1px solid rgba(124, 58, 237, 0.25)',
                  fontSize: '9px',
                  fontWeight: 600,
                }}
              >
                PLAN: {selectedStrategy.name}
              </span>
            )}

            {recalledExperienceIds.length > 0 && (
              <span
                onClick={() => navigate('/memory')}
                title="Inspect recalled Hindsight memory episodes"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  padding: '1px 6px',
                  borderRadius: '3px',
                  background: 'rgba(167, 139, 250, 0.1)',
                  color: '#a78bfa',
                  border: '1px solid rgba(167, 139, 250, 0.25)',
                  fontSize: '9px',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                <Brain size={10} />
                MEMORY: {recalledExperienceIds[0]}
              </span>
            )}

            <TruthTag mode={truthMode} size="sm" />
          </div>
        )}
      </div>

      {/* Right: Studio Deep-Links with Preserved Context */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
        {isNominal ? (
          <button
            onClick={handleSimulateDisruption}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              borderRadius: '4px',
              background: 'rgba(232, 80, 58, 0.12)',
              border: '1px solid rgba(232, 80, 58, 0.3)',
              color: '#f87171',
              fontSize: '10px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <AlertTriangle size={10} />
            Simulate Disruption
          </button>
        ) : (
          <>
            <span style={{ fontSize: '9px', color: '#475569', textTransform: 'uppercase' }}>Cross-Studio:</span>

            <button
              onClick={() => handleDeepLink('/intelligence/gnn')}
              title="Open GNN Propagation Studio with active node"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                padding: '2px 6px',
                borderRadius: '4px',
                background: 'rgba(124, 58, 237, 0.12)',
                border: '1px solid rgba(124, 58, 237, 0.3)',
                color: '#c4b5fd',
                fontSize: '9px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <GitFork size={10} />
              GNN
            </button>

            <button
              onClick={() => handleDeepLink('/intelligence/causal')}
              title="Open Causal DAG Studio with active node"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                padding: '2px 6px',
                borderRadius: '4px',
                background: 'rgba(56, 189, 248, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                color: '#38bdf8',
                fontSize: '9px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <GitBranch size={10} />
              Causal
            </button>

            <button
              onClick={() => handleDeepLink('/intelligence/risk')}
              title="Open Risk Explorer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                padding: '2px 6px',
                borderRadius: '4px',
                background: 'rgba(245, 166, 35, 0.1)',
                border: '1px solid rgba(245, 166, 35, 0.25)',
                color: '#f5a623',
                fontSize: '9px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <ShieldAlert size={10} />
              Risk
            </button>

            <button
              onClick={() => navigate('/response/war-room')}
              title="Open Incident War Room"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                padding: '2px 6px',
                borderRadius: '4px',
                background: 'rgba(232, 80, 58, 0.12)',
                border: '1px solid rgba(232, 80, 58, 0.3)',
                color: '#f87171',
                fontSize: '9px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Bot size={10} />
              War Room
            </button>

            <button
              onClick={() => navigate('/decision/cockpit')}
              title="Open Decision Cockpit"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                padding: '2px 6px',
                borderRadius: '4px',
                background: 'rgba(59, 130, 246, 0.12)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                color: '#60a5fa',
                fontSize: '9px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Eye size={10} />
              Cockpit
            </button>

            <button
              onClick={clearActiveIncident}
              title="Clear active incident context"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '2px 5px',
                borderRadius: '4px',
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#64748b',
                fontSize: '9px',
                cursor: 'pointer',
                marginLeft: '4px',
              }}
            >
              <X size={10} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
