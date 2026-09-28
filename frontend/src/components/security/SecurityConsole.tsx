import React, { useState } from 'react';
import { Shield, Key, Lock, Users, Building, Server, CheckCircle2, AlertCircle, Eye, RefreshCw, Layers } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { SystemRole, Permission } from '../../types/auth';

const ROLE_PERMISSIONS_MAP: Record<SystemRole, Permission[]> = {
  OWNER: [
    'world:read', 'world:mutate', 'risk:evaluate', 'signal:ingest', 'ai:reason',
    'agent:execute', 'plan:generate', 'decision:approve', 'verification:run',
    'evaluation:execute', 'data:read', 'data:ingest', 'data:export', 'data:reset',
    'system:read', 'system:admin', 'security:manage', 'audit:read'
  ],
  ADMIN: [
    'world:read', 'world:mutate', 'risk:evaluate', 'signal:ingest', 'ai:reason',
    'agent:execute', 'plan:generate', 'decision:approve', 'verification:run',
    'evaluation:execute', 'data:read', 'data:ingest', 'data:export',
    'system:read', 'security:manage', 'audit:read'
  ],
  OPERATOR: [
    'world:read', 'world:mutate', 'risk:evaluate', 'signal:ingest', 'ai:reason',
    'agent:execute', 'plan:generate', 'decision:approve', 'verification:run',
    'evaluation:execute', 'data:read', 'system:read', 'audit:read'
  ],
  ANALYST: [
    'world:read', 'risk:evaluate', 'signal:ingest', 'ai:reason',
    'plan:generate', 'verification:run', 'evaluation:execute',
    'data:read', 'data:export', 'system:read', 'audit:read'
  ],
  VIEWER: [
    'world:read', 'data:read', 'system:read'
  ],
  AUDITOR: [
    'world:read', 'data:read', 'system:read', 'audit:read'
  ]
};

const PERSISTENT_MODELS = [
  { name: 'WorldSnapshotModel', table: 'world_snapshots', tenantColumn: 'organization_id', status: 'ISOLATED' },
  { name: 'SignalModel', table: 'signals', tenantColumn: 'organization_id', status: 'ISOLATED' },
  { name: 'RiskSnapshotModel', table: 'risk_snapshots', tenantColumn: 'organization_id', status: 'ISOLATED' },
  { name: 'CandidatePlanModel', table: 'candidate_plans', tenantColumn: 'organization_id', status: 'ISOLATED' },
  { name: 'ApprovalDecisionModel', table: 'approval_decisions', tenantColumn: 'organization_id', status: 'ISOLATED' },
  { name: 'EvaluationRunModel', table: 'evaluation_runs', tenantColumn: 'organization_id', status: 'ISOLATED' },
  { name: 'AuditEventModel', table: 'audit_events', tenantColumn: 'organization_id', status: 'ISOLATED' },
  { name: 'EventHistoryModel', table: 'event_history', tenantColumn: 'organization_id', status: 'ISOLATED' },
  { name: 'DataProvenanceModel', table: 'data_provenance', tenantColumn: 'organization_id', status: 'ISOLATED' },
];

export const SecurityConsole: React.FC = () => {
  const { user, organization, userRole, userPermissions, tokens } = useAuthStore();
  const [selectedRole, setSelectedRole] = useState<SystemRole>(userRole || 'OWNER');

  return (
    <div className="space-y-6 p-6 text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 rounded-xl border border-cyan-500/30 bg-slate-900/80 p-6 shadow-xl backdrop-blur-md md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-400/40 bg-cyan-950/60 shadow-md">
            <Shield className="h-6 w-6 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold tracking-tight text-white">
                SECURITY & IDENTITY CONSOLE
              </h1>
              <span className="rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-[10px] font-mono font-semibold text-cyan-400 border border-cyan-500/30">
                ZERO-TRUST ACTIVE
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Multi-Tenant Data Scoping, PBKDF2 Password Hashing, HMAC-SHA256 JWT & RBAC Policy Matrix
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 font-mono text-xs text-slate-300">
          <div className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5">
            <span className="text-slate-500">PROVIDER: </span>
            <span className="font-semibold text-emerald-400">LOCAL (PBKDF2/JWT)</span>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5">
            <span className="text-slate-500">COGNITO ADAPTER: </span>
            <span className="font-semibold text-cyan-400">READY</span>
          </div>
        </div>
      </div>

      {/* Grid Row 1: Active Context & Rate Limiter */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Active Security Context */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg md:col-span-2">
          <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-white">ACTIVE SECURITY CONTEXT</h3>
            </div>
            <span className="font-mono text-[10px] text-slate-400">SESSION AUTHENTICATED</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-3">
              <div className="text-[10px] font-mono text-slate-400">AUTHENTICATED USER</div>
              <div className="mt-1 font-semibold text-white text-sm">{user?.display_name || 'Administrator'}</div>
              <div className="text-xs text-cyan-400 font-mono">{user?.email || 'admin@fulfillx.io'}</div>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-3">
              <div className="text-[10px] font-mono text-slate-400">ORGANIZATION TENANT ID</div>
              <div className="mt-1 font-semibold text-emerald-400 text-sm">{organization?.name || 'Autonomous Enterprise'}</div>
              <div className="text-xs text-slate-400 font-mono">{user?.organization_id || 'org-enterprise-default'}</div>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-3">
              <div className="text-[10px] font-mono text-slate-400">ASSIGNED PRIMARY ROLE</div>
              <div className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-cyan-950 px-2.5 py-0.5 text-xs font-bold text-cyan-300 border border-cyan-500/30">
                <Shield className="h-3 w-3" />
                {userRole || 'OWNER'}
              </div>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-3">
              <div className="text-[10px] font-mono text-slate-400">ACTIVE PERMISSIONS</div>
              <div className="mt-1 font-mono text-xs text-slate-300">
                {userPermissions.length} Authorized Operations
              </div>
            </div>
          </div>
        </div>

        {/* Rate Limiter & Boundary Protection */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
          <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-white">BOUNDARY DEFENSE</h3>
            </div>
            <span className="font-mono text-[10px] text-emerald-400">ACTIVE</span>
          </div>

          <div className="space-y-3">
            <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Sliding Window Rate Limiter:</span>
                <span className="font-mono font-semibold text-emerald-400">120 req/min</span>
              </div>
              <div className="mt-2 h-1.5 w-full rounded-full bg-slate-800">
                <div className="h-1.5 w-[15%] rounded-full bg-emerald-500"></div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">AI Prompt Injection Guard:</span>
                <span className="font-mono text-cyan-400">Strict Schema Boundary</span>
              </div>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">HTTP Security Headers:</span>
                <span className="font-mono text-emerald-400">nosniff, DENY, 1; mode=block</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Row 2: RBAC Policy Matrix Explorer */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
        <div className="mb-4 flex flex-col gap-3 border-b border-slate-800 pb-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">AUTHORITATIVE RBAC POLICY MATRIX</h3>
          </div>
          <div className="flex flex-wrap gap-1">
            {(['OWNER', 'ADMIN', 'OPERATOR', 'ANALYST', 'VIEWER', 'AUDITOR'] as SystemRole[]).map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRole(r)}
                className={`rounded-md px-3 py-1 text-xs font-mono font-semibold transition-all ${
                  selectedRole === r
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {ROLE_PERMISSIONS_MAP[selectedRole].map((perm) => (
            <div
              key={perm}
              className="flex items-center gap-2 rounded-lg border border-cyan-500/20 bg-slate-950/80 px-3 py-2 text-xs font-mono text-cyan-300"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">{perm}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Grid Row 3: Multi-Tenant Data Isolation Inspector */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
        <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">MULTI-TENANT ORM DATA ISOLATION (9 DOMAIN MODELS)</h3>
          </div>
          <span className="font-mono text-[10px] text-emerald-400">VERIFIED TENANT SCOPING</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {PERSISTENT_MODELS.map((m) => (
            <div key={m.name} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/80 p-3">
              <div>
                <div className="font-semibold text-xs text-white">{m.name}</div>
                <div className="font-mono text-[10px] text-slate-500">table: {m.table}</div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" />
                  {m.tenantColumn}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
