export type EventType =
  | 'SESSION_CREATED'
  | 'SESSION_STARTED'
  | 'STAGE_STARTED'
  | 'STAGE_COMPLETED'
  | 'STAGE_FAILED'
  | 'SESSION_COMPLETED'
  | 'SIGNAL_DETECTED'
  | 'SIGNAL_FUSED'
  | 'RISK_UPDATED'
  | 'SPECIALIST_STARTED'
  | 'SPECIALIST_COMPLETED'
  | 'SPECIALIST_FAILED'
  | 'COORDINATOR_STARTED'
  | 'COORDINATOR_COMPLETED'
  | 'ADVERSARY_STARTED'
  | 'ADVERSARY_FINDING'
  | 'ADVERSARY_COMPLETED'
  | 'PLANNER_STARTED'
  | 'PLAN_GENERATED'
  | 'VERIFICATION_STARTED'
  | 'VERIFICATION_COMPLETED'
  | 'DECISION_READY'
  | 'APPROVAL_REQUESTED'
  | 'DECISION_APPROVED'
  | 'DECISION_REJECTED'
  | 'SYSTEM_WARNING'
  | 'SYSTEM_ERROR';

export type EventSeverity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface EventEnvelope {
  event_id: string;
  event_type: EventType;
  timestamp: string;
  session_id?: string | null;
  stage?: string | null;
  source: string;
  severity: EventSeverity;
  sequence: number;
  payload: Record<string, any>;
  schema_version: string;
}

export type ConnectionStatus = 'CONNECTING' | 'CONNECTED' | 'RECONNECTING' | 'OFFLINE';

export interface ClientWsMessage {
  action: 'SUBSCRIBE' | 'UNSUBSCRIBE' | 'PING';
  session_id?: string | null;
  payload?: Record<string, any>;
}

export interface ToastMessage {
  id: string;
  title: string;
  description: string;
  severity: EventSeverity;
  timestamp: string;
}
