# FULFILL-X — Security Specification

## 1. Purpose

Define the security model for FULFILL-X covering: authentication,
authorization, secret management, data protection, AI safety
constraints, and audit logging.

## 2. Threat Model

| Threat | Risk | Mitigation |
|--------|------|-----------|
| Unauthorized plan approval | HIGH | Authentication + audit log |
| AI prompt injection | HIGH | System prompt isolation + schema validation |
| Credential exposure | CRITICAL | SSM Parameter Store, no hardcoded secrets |
| Data exfiltration | MEDIUM | Network isolation (VPC), no public DB |
| Supply chain attack | MEDIUM | Dependency pinning + license review |
| Denial of service | LOW | Rate limiting + WAF (production) |

## 3. Authentication (Phase 12+)

MVP (demo): No authentication required — internal demo only.

Production target:
- AWS Cognito for user pool management
- JWT Bearer tokens in `Authorization: Bearer <token>` header
- Token expiry: 1 hour (access), 7 days (refresh)
- All API endpoints validate JWT except `/api/system/health`

## 4. Secret Management

### Rules

1. **Never commit secrets to Git.** `.env` files are gitignored.
2. All secrets must be stored in AWS SSM Parameter Store as `SecureString`.
3. Local development uses `.env` file. Template: `.env.example`.
4. Application reads secrets at startup via Pydantic BaseSettings.

### Required Secrets

| Secret Name | SSM Path | Description |
|------------|----------|-------------|
| `DATABASE_URL` | `/fulfillx/prod/database-url` | PostgreSQL connection string |
| `REDIS_URL` | `/fulfillx/prod/redis-url` | Redis connection string |
| `GEMINI_API_KEY` | `/fulfillx/prod/gemini-api-key` | Google Gemini API key |
| `SECRET_KEY` | `/fulfillx/prod/secret-key` | App signing key |

### `.env.example`

```bash
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/fulfillx
REDIS_URL=redis://localhost:6379/0
AI_PROVIDER=mock
GEMINI_API_KEY=your-gemini-key-here
OLLAMA_BASE_URL=http://localhost:11434
BEDROCK_REGION=us-east-1
SECRET_KEY=change-me-in-production
ENVIRONMENT=development
CORS_ORIGINS=http://localhost:5173
LOG_LEVEL=INFO
SIMULATION_SEED=42
```

## 5. AI Safety Constraints

### 5.1 No Direct State Mutation

LLMs may never write directly to the database or world state.
All AI proposals flow through:

```
LLM output → Pydantic schema validation → constraint check →
simulation validation → human approval → state mutation
```

### 5.2 Prompt Security

- System prompts are defined in code, not user-supplied.
- User inputs are never directly interpolated into prompts without sanitization.
- Agent prompts include explicit instructions not to generate harmful content.
- Chain of thought is never exposed to the frontend UI.

### 5.3 Output Validation

All AI outputs are validated against strict Pydantic schemas.
Any output that fails validation:
1. Is rejected (not stored)
2. Is logged with the raw output (for debugging)
3. Returns `status: INFEASIBLE` to the orchestrator

### 5.4 Action Constraints

Each agent has a whitelist of allowed action types. The constraint engine
checks every proposed action against this whitelist before simulation.

## 6. Data Protection

### Personal Data

FULFILL-X does not process personal data in its core pipeline.
All entities (nodes, edges, signals) are supply chain entities, not persons.

If customer zone data is added in future:
- Customer IDs must be pseudonymized
- No PII stored in PostgreSQL (map from anonymous ID to PII in a separate store)
- GDPR / CCPA compliance review required before handling PII

### Data in Transit

- All HTTPS (TLS 1.2+) enforced at ALB
- WebSocket connections are WSS (TLS)
- Internal VPC traffic (ECS → RDS, ECS → Redis) is not TLS (private subnet)

### Data at Rest

- RDS: AWS-managed encryption at rest (AES-256)
- S3: Server-side encryption (SSE-S3)
- ElastiCache: Encryption at rest enabled

## 7. Logging & Audit

### Application Logs

- All logs to CloudWatch via awslogs driver
- Log format: structured JSON
- Log retention: 30 days
- No secrets, API keys, or raw AI outputs in production logs

### Audit Log

Every state-changing action (plan approval, plan rejection, signal
promotion, scenario creation) is recorded in `audit_log` table:

| Field | Description |
|-------|-------------|
| `event_type` | Action type |
| `entity_id` | Affected entity |
| `entity_type` | Entity type |
| `actor` | User ID or system |
| `payload` | Action details (no secrets) |
| `created_at` | UTC timestamp |

Audit log is append-only. Delete is not supported.

## 8. CORS Configuration

```python
# Development
CORS_ORIGINS = ["http://localhost:5173"]

# Production
CORS_ORIGINS = ["https://demo.fulfill-x.example.com"]
```

## 9. Rate Limiting

| Endpoint Group | Limit (per IP) |
|---------------|---------------|
| `POST /api/agents/run` | 10/minute |
| `POST /api/evaluation/run` | 2/minute |
| `POST /api/plans/*/approve` | 5/minute |
| `GET /api/*` | 100/minute |

Implemented via Redis sliding window (or AWS WAF in production).

## 10. Dependency Security

- All Python dependencies pinned in `requirements.txt`
- All Node dependencies pinned in `package-lock.json`
- `ruff` and `npm audit` run in CI to detect known vulnerabilities
- `LICENSES/THIRD_PARTY.md` reviewed for license compatibility

## 11. Vulnerability Disclosure

Phase 00: Internal project. No public disclosure process yet.
Phase 12 (production): Define responsible disclosure policy before launch.

---

*Review this document at each phase boundary.*
*Update threat model when new integrations are added.*
