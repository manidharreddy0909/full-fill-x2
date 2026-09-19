"""
FULFILL-X Auth & Security Pydantic Schemas (Phase 3)
Matching docs/DATA_MODEL.md & docs/IDENTITY_ARCHITECTURE.md
"""
from datetime import datetime, timezone
from enum import Enum
from typing import Dict, List, Optional, Any
from uuid import uuid4
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from app.models.identity import SystemRole, UserStatus, OrganizationStatus


class Permission(str, Enum):
    WORLD_READ = "world:read"
    WORLD_WRITE = "world:write"
    SIGNALS_READ = "signals:read"
    SIGNALS_INGEST = "signals:ingest"
    SIGNALS_DELETE = "signals:delete"
    RISK_READ = "risk:read"
    RISK_RUN = "risk:run"
    AGENTS_READ = "agents:read"
    AGENTS_RUN = "agents:run"
    PLANS_READ = "plans:read"
    PLANS_CREATE = "plans:create"
    SIMULATION_READ = "simulation:read"
    SIMULATION_RUN = "simulation:run"
    VERIFICATION_READ = "verification:read"
    VERIFICATION_RUN = "verification:run"
    DECISION_READ = "decision:read"
    DECISION_APPROVE = "decision:approve"
    DECISION_REJECT = "decision:reject"
    EVALUATION_READ = "evaluation:read"
    EVALUATION_RUN = "evaluation:run"
    DATA_READ = "data:read"
    DATA_EXPORT = "data:export"
    DATA_IMPORT = "data:import"
    DATA_RESET = "data:reset"
    USERS_READ = "users:read"
    USERS_MANAGE = "users:manage"
    ORGANIZATION_READ = "organization:read"
    ORGANIZATION_MANAGE = "organization:manage"
    AUDIT_READ = "audit:read"
    OBSERVABILITY_READ = "observability:read"
    OBSERVABILITY_MANAGE = "observability:manage"
    ALERTS_READ = "alerts:read"
    ALERTS_MANAGE = "alerts:manage"
    METRICS_READ = "metrics:read"
    TRACES_READ = "traces:read"
    EVENTS_INSPECT = "events:inspect"
    ML_READ = "ml:read"
    ML_TRAIN = "ml:train"
    ML_EVALUATE = "ml:evaluate"
    ML_ACTIVATE = "ml:activate"
    ML_RETIRE = "ml:retire"
    ML_PREDICT = "ml:predict"
    ML_MANAGE = "ml:manage"
    GRAPH_READ = "graph:read"
    GRAPH_ANALYZE = "graph:analyze"
    GNN_READ = "gnn:read"
    GNN_TRAIN = "gnn:train"
    GNN_EVALUATE = "gnn:evaluate"
    GNN_ACTIVATE = "gnn:activate"
    GNN_RETIRE = "gnn:retire"
    GNN_PREDICT = "gnn:predict"
    GNN_MANAGE = "gnn:manage"
    CAUSAL_READ = "causal:read"
    CAUSAL_ANALYZE = "causal:analyze"
    CAUSAL_COUNTERFACTUAL = "causal:counterfactual"
    CAUSAL_MANAGE = "causal:manage"
    TWIN_READ = "twin:read"
    TWIN_CREATE = "twin:create"
    TWIN_MANAGE = "twin:manage"
    SIMULATION_MANAGE = "simulation:manage"
    RESILIENCE_READ = "resilience:read"
    RESILIENCE_ANALYZE = "resilience:analyze"
    RESILIENCE_MANAGE = "resilience:manage"
    STRATEGY_SIMULATE = "strategy:simulate"
    AGENT_MEMORY_READ = "agent_memory:read"
    AGENT_MEMORY_WRITE = "agent_memory:write"
    AGENT_DELIBERATE = "agent:deliberate"
    AGENT_DEBATE = "agent:debate"
    AGENT_PERFORMANCE_READ = "agent_performance:read"
    OUTCOME_READ = "outcome:read"
    OUTCOME_WRITE = "outcome:write"
    FEEDBACK_READ = "feedback:read"
    FEEDBACK_WRITE = "feedback:write"
    LEARNING_READ = "learning:read"
    LEARNING_DATASET_CREATE = "learning_dataset:create"
    LEARNING_TRAIN = "learning:train"
    LEARNING_EVALUATE = "learning:evaluate"
    LEARNING_ACTIVATE = "learning:activate"
    LEARNING_RETIRE = "learning:retire"
    LEARNING_MANAGE = "learning:manage"
    RESILIENCE_OS_READ = "resilience_os:read"
    RESILIENCE_OS_RUN = "resilience_os:run"
    POLICY_READ = "policy:read"
    POLICY_MANAGE = "policy:manage"
    EXECUTION_READ = "execution:read"
    EXECUTION_AUTHORIZE = "execution:authorize"
    GOVERNANCE_READ = "governance:read"
    GOVERNANCE_MANAGE = "governance:manage"
    SYSTEM_ADMIN = "system:admin"


class UserBase(BaseModel):
    email: str = Field(..., description="User email address")
    display_name: str = Field(..., max_length=128, description="User full display name")


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, description="User plaintext password (will be hashed)")
    organization_name: Optional[str] = Field(default="Default Organization", description="Initial organization name")


class UserResponse(UserBase):
    id: str
    status: UserStatus
    identity_provider: str = "local"
    created_at: datetime
    last_login_at: Optional[datetime] = None


class OrganizationResponse(BaseModel):
    id: str
    name: str
    slug: str
    status: OrganizationStatus
    created_at: datetime


class MembershipResponse(BaseModel):
    id: str
    organization_id: str
    user_id: str
    role: SystemRole
    status: str
    organization: Optional[OrganizationResponse] = None


class LoginRequest(BaseModel):
    email: str = Field(..., description="Registered email address")
    password: str = Field(..., description="User password")
    organization_id: Optional[str] = Field(default=None, description="Optional target organization ID")


class TokenResponse(BaseModel):
    access_token: str = Field(..., description="JWT access token (HS256)")
    refresh_token: str = Field(..., description="JWT refresh token")
    token_type: str = Field(default="Bearer")
    expires_in: int = Field(default=900, description="Access token expiration in seconds (15 minutes)")
    user: UserResponse
    organization: OrganizationResponse
    role: SystemRole
    permissions: List[Permission]


class RefreshTokenRequest(BaseModel):
    refresh_token: str = Field(..., description="JWT refresh token")


class SecurityContext(BaseModel):
    user_id: str
    email: str
    display_name: str
    organization_id: str
    organization_name: str
    workspace_id: str = "ws-default"
    environment_id: str = "env-production"
    role: SystemRole
    permissions: List[Permission]
    auth_method: str = "local"
    session_id: Optional[str] = None

    model_config = ConfigDict(frozen=True)

    def has_permission(self, perm: Permission) -> bool:
        return perm in self.permissions or Permission.SYSTEM_ADMIN in self.permissions


class UserInviteRequest(BaseModel):
    email: str
    display_name: str
    role: SystemRole = SystemRole.OPERATOR
