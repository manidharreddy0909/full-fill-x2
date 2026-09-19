import { useState, useEffect } from 'react';
import { EventEnvelope, ConnectionStatus, ToastMessage, EventType } from '../types/events';
import { realtimeClient } from '../api/websocket';

export interface RealtimeStoreState {
  connectionStatus: ConnectionStatus;
  activeSessionId: string | null;
  events: EventEnvelope[];
  latestEvent: EventEnvelope | null;
  stageStatus: Record<string, { status: string; duration_ms?: number }>;
  agentStatus: Record<string, { status: string; confidence?: number }>;
  nodeRisks: Record<string, { composite: number }>;
  networkHealth: number;
  toasts: ToastMessage[];
}

class RealtimeStore {
  private state: RealtimeStoreState = {
    connectionStatus: 'OFFLINE',
    activeSessionId: null,
    events: [],
    latestEvent: null,
    stageStatus: {},
    agentStatus: {},
    nodeRisks: {},
    networkHealth: 0.94,
    toasts: [],
  };

  private listeners: Set<() => void> = new Set();
  private initialized = false;

  constructor() {
    this.init();
  }

  public init(): void {
    if (this.initialized) return;
    this.initialized = true;

    realtimeClient.onStatusChange((status) => {
      this.state.connectionStatus = status;
      this.notify();
    });

    realtimeClient.onMessage((event) => {
      this.handleIncomingEvent(event);
    });
  }

  public connectSession(sessionId: string): void {
    this.state.activeSessionId = sessionId;
    realtimeClient.connect(sessionId);
    this.notify();
  }

  public disconnect(): void {
    realtimeClient.disconnect();
    this.state.activeSessionId = null;
    this.notify();
  }

  public removeToast(id: string): void {
    this.state.toasts = this.state.toasts.filter((t) => t.id !== id);
    this.notify();
  }

  public clearEvents(): void {
    this.state.events = [];
    this.state.latestEvent = null;
    this.state.stageStatus = {};
    this.state.agentStatus = {};
    this.notify();
  }

  public getState(): RealtimeStoreState {
    return this.state;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }

  private handleIncomingEvent(event: EventEnvelope): void {
    this.state.latestEvent = event;
    this.state.events = [event, ...this.state.events].slice(0, 100);

    const { event_type, stage, payload, severity } = event;

    // 1. Stage Timeline Updates
    if (event_type === 'STAGE_STARTED' && stage) {
      this.state.stageStatus = {
        ...this.state.stageStatus,
        [stage]: { status: 'RUNNING' },
      };
    } else if (event_type === 'STAGE_COMPLETED' && stage) {
      this.state.stageStatus = {
        ...this.state.stageStatus,
        [stage]: { status: 'COMPLETED', duration_ms: payload.duration_ms },
      };
    } else if (event_type === 'STAGE_FAILED' && stage) {
      this.state.stageStatus = {
        ...this.state.stageStatus,
        [stage]: { status: 'FAILED' },
      };
    }

    // 2. Agent Execution Updates
    if (event_type === 'SPECIALIST_STARTED' && payload.agent_id) {
      this.state.agentStatus = {
        ...this.state.agentStatus,
        [payload.agent_id]: { status: 'RUNNING' },
      };
    } else if (event_type === 'SPECIALIST_COMPLETED' && payload.agent_id) {
      this.state.agentStatus = {
        ...this.state.agentStatus,
        [payload.agent_id]: { status: 'PROPOSED', confidence: payload.confidence },
      };
    }

    // 3. Risk & Network Updates
    if (event_type === 'RISK_UPDATED') {
      if (payload.node_id && payload.composite_risk !== undefined) {
        this.state.nodeRisks = {
          ...this.state.nodeRisks,
          [payload.node_id]: { composite: payload.composite_risk },
        };
      }
      if (payload.network_health !== undefined) {
        this.state.networkHealth = payload.network_health;
      }
    }

    // 4. Toast Notifications for HIGH/CRITICAL events
    if (severity === 'HIGH' || severity === 'CRITICAL' || event_type === 'DECISION_READY' || event_type === 'VERIFICATION_COMPLETED') {
      const toast: ToastMessage = {
        id: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: this.getToastTitle(event_type),
        description: payload.summary || payload.title || payload.error || `${event_type} event received`,
        severity: severity,
        timestamp: new Date().toLocaleTimeString(),
      };
      this.state.toasts = [toast, ...this.state.toasts].slice(0, 5);
    }

    this.notify();
  }

  private getToastTitle(eventType: EventType): string {
    switch (eventType) {
      case 'SIGNAL_DETECTED': return '⚠ High-Risk Signal Detected';
      case 'SPECIALIST_COMPLETED': return '✓ Specialist Agent Proposal Ready';
      case 'ADVERSARY_FINDING': return '⚠ Adversary Discovered Fragility';
      case 'VERIFICATION_COMPLETED': return '✓ Sandbox Verification Complete';
      case 'DECISION_READY': return '⚡ Decision Cockpit Ready for Approval';
      case 'DECISION_APPROVED': return '✓ Candidate Plan Approved';
      case 'DECISION_REJECTED': return '✕ Candidate Plan Rejected';
      default: return `Event: ${eventType}`;
    }
  }
}

export const realtimeStore = new RealtimeStore();

export function useRealtimeStore(): RealtimeStoreState {
  const [state, setState] = useState<RealtimeStoreState>(realtimeStore.getState());

  useEffect(() => {
    const unsubscribe = realtimeStore.subscribe(() => {
      setState({ ...realtimeStore.getState() });
    });
    return unsubscribe;
  }, []);

  return state;
}
