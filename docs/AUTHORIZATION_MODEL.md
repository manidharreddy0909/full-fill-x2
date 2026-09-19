# FULFILL-X — AUTHORIZATION & RBAC POLICY MATRIX (PHASE 3)

## 1. Overview
FULFILL-X uses Role-Based Access Control (RBAC) mapped directly onto granular domain permissions.

---

## 2. Role Hierarchy & Policy Matrix

| Permission | OWNER | ADMIN | OPERATOR | ANALYST | VIEWER | AUDITOR |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| `world:read` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `world:mutate` | ✓ | ✓ | ✓ | ✕ | ✕ | ✕ |
| `risk:evaluate` | ✓ | ✓ | ✓ | ✓ | ✕ | ✕ |
| `signal:ingest` | ✓ | ✓ | ✓ | ✓ | ✕ | ✕ |
| `ai:reason` | ✓ | ✓ | ✓ | ✓ | ✕ | ✕ |
| `agent:execute` | ✓ | ✓ | ✓ | ✕ | ✕ | ✕ |
| `plan:generate` | ✓ | ✓ | ✓ | ✓ | ✕ | ✕ |
| `decision:approve` | ✓ | ✓ | ✓ | ✕ | ✕ | ✕ |
| `verification:run` | ✓ | ✓ | ✓ | ✓ | ✕ | ✕ |
| `evaluation:execute` | ✓ | ✓ | ✓ | ✓ | ✕ | ✕ |
| `data:read` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `data:ingest` | ✓ | ✓ | ✕ | ✕ | ✕ | ✕ |
| `data:export` | ✓ | ✓ | ✕ | ✓ | ✕ | ✕ |
| `data:reset` | ✓ | ✕ | ✕ | ✕ | ✕ | ✕ |
| `system:read` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `system:admin` | ✓ | ✕ | ✕ | ✕ | ✕ | ✕ |
| `security:manage` | ✓ | ✓ | ✕ | ✕ | ✕ | ✕ |
| `audit:read` | ✓ | ✓ | ✓ | ✓ | ✕ | ✓ |

---

## 3. Dependency Injection Enforcement
Every protected REST API endpoint uses FastAPI dependencies:
- `SecurityContext = Depends(get_security_context)`
- `Depends(require_permission(Permission.DECISION_APPROVE))`
- `Depends(require_role(SystemRole.ADMIN))`
