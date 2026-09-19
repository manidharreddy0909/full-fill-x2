/**
 * FULFILL-X Enterprise Identity & RBAC Types (Phase 3)
 */

export type SystemRole = 'OWNER' | 'ADMIN' | 'OPERATOR' | 'ANALYST' | 'VIEWER' | 'AUDITOR';

export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';

export type Permission =
  | 'world:read'
  | 'world:mutate'
  | 'risk:evaluate'
  | 'signal:ingest'
  | 'ai:reason'
  | 'agent:execute'
  | 'plan:generate'
  | 'decision:approve'
  | 'verification:run'
  | 'evaluation:execute'
  | 'data:read'
  | 'data:ingest'
  | 'data:export'
  | 'data:reset'
  | 'system:read'
  | 'system:admin'
  | 'security:manage'
  | 'audit:read';

export interface AuthUser {
  id: string;
  email: string;
  display_name: string;
  status: UserStatus;
  primary_role: SystemRole;
  organization_id: string;
  created_at: string;
  updated_at: string;
  permissions: Permission[];
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  member_count: number;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user_id: string;
  organization_id: string;
  role: SystemRole;
}

export interface SecurityContext {
  user_id: string;
  email: string;
  organization_id: string;
  role: SystemRole;
  permissions: Permission[];
  authenticated: boolean;
  token_id?: string;
  session_started_at: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  display_name: string;
  password: string;
  organization_name: string;
}

export interface SecurityAuditItem {
  id: string;
  timestamp: string;
  event_type: string;
  actor_email: string;
  role: SystemRole;
  organization_id: string;
  ip_address: string;
  outcome: 'SUCCESS' | 'DENIED' | 'RATE_LIMITED';
  details: string;
}
