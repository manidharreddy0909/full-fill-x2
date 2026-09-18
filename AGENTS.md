# AGENTS.md — FULFILL-X Operating Rules for All AI Agents & Sessions

> This file is the highest-priority governance document for all AI agents
> and human contributors working on FULFILL-X. Read it before touching
> any file in this repository.

---

## 1. Repository Authority

The Git repository is the **single source of truth**. No undocumented
state exists outside of committed files.

---

## 2. Mandatory Pre-Task Reading

Before making any change, read ALL of the following:

- `docs/MASTER_PLAN.md`
- `docs/ARCHITECTURE.md`
- `docs/PRODUCT_SPEC.md`
- `docs/FRONTEND_SPEC.md`
- `docs/3D_SPEC.md`
- `docs/BACKEND_SPEC.md`
- `docs/API_SPEC.md`
- `docs/DATA_MODEL.md`
- `docs/AGENT_SPEC.md`
- `docs/AWS_SPEC.md`
- `docs/TESTING_SPEC.md`
- `docs/DEMO_SPEC.md`
- `tasks/TODO.md`
- `tasks/IN_PROGRESS.md`
- `tasks/DONE.md`

---

## 3. Architecture Decision Rules

- Never silently invent architecture decisions that conflict with the
  master plan.
- If a decision is necessary, document it in `docs/DECISION_LOG.md`
  **before or alongside** implementation.
- All decisions must include: context, options considered, chosen option,
  rationale, trade-offs.

---

## 4. Change Protocol

Every meaningful change must:

1. Update the relevant documentation
2. Update `tasks/TODO.md` / `tasks/IN_PROGRESS.md` / `tasks/DONE.md`
3. Add or update tests where applicable
4. Run appropriate verification
5. Be committed to Git with a meaningful message

---

## 5. Git Commit Protocol

For every task:

```
1. git status
2. Read relevant docs
3. Identify task ID
4. Move task to IN_PROGRESS
5. Implement
6. Test
7. Update docs
8. Update diagrams if architecture changed
9. Move task to DONE only after verification
10. Update CHANGELOG
11. Commit with meaningful message
12. Report commit hash and verification results
```

### Commit Format

```
chore: <description>
docs: <description>
feat(<subsystem>): <description>
fix(<subsystem>): <description>
test(<subsystem>): <description>
infra(<subsystem>): <description>
refactor(<subsystem>): <description>
```

Examples:
- `chore: initialize fulfill-x project`
- `docs: define system architecture`
- `feat(world): implement deterministic network model`
- `feat(risk): implement compound risk engine`
- `feat(ui): implement command center`
- `feat(3d): implement interactive world model`
- `test(evaluation): add deterministic benchmark`
- `infra(aws): deploy application`
- `fix(api): validate scenario payload`

---

## 6. Task Tracking

Every task must have:

| Field | Description |
|-------|-------------|
| ID | Unique identifier (e.g., `P01-001`) |
| Phase | Phase number |
| Description | What the task accomplishes |
| Owner/Agent | Responsible agent or human |
| Dependencies | Task IDs that must complete first |
| Files Affected | List of files to be changed |
| Status | `PLANNED` / `IN_PROGRESS` / `BLOCKED` / `VERIFIED` / `DONE` |
| Verification Command | Command to verify completion |
| Result | Outcome of verification |
| Commit Hash | Git commit hash after completion |

**Never mark DONE without verification.**

---

## 7. AI Agent Rules

### 7.1 Proposal Safety

- LLMs may **propose** actions but must **never** directly mutate
  authoritative world state.
- All AI-proposed state changes must flow through:
  ```
  LLM proposal → structured schema → validation → constraints →
  simulator → accepted/rejected state change
  ```

### 7.2 Chain of Thought

- Never expose private chain-of-thought to users.
- The UI must show concise operational reasoning, evidence, decisions,
  constraints, and outcomes.

### 7.3 Agent Boundaries

- Each agent operates within its documented contract (`docs/AGENT_SPEC.md`).
- Agents may not exceed their documented tool access.
- Coordinator Agent is the only agent that may reconcile cross-agent proposals.
- Adversary Agent may only challenge plans; it may not propose alternatives.

### 7.4 Determinism

- Preserve deterministic behavior for the synthetic MVP and evaluation harness.
- All random operations must use seeded generators.
- Mock provider must be fully deterministic.

---

## 8. Documentation Standard

For every major subsystem, document ALL of:

1. Purpose
2. User problem
3. Inputs
4. Outputs
5. Data structures
6. APIs
7. State transitions
8. Dependencies
9. Failure modes
10. Validation
11. Tests
12. Frontend representation
13. 3D representation (where applicable)
14. AI integration (where applicable)
15. AWS integration (where applicable)
16. Demo behavior
17. Future extension points

Use Mermaid diagrams for all flows, architectures, sequences, state
transitions, and dependency graphs.

---

## 9. Multi-Agent Coordination

- No two agents may edit the same files simultaneously.
- Before starting work on a file, check `tasks/IN_PROGRESS.md` for conflicts.
- If a conflict exists, the second agent must block and report.

---

## 10. Security Rules

- Never log secrets, API keys, or personal data.
- Never commit credentials to the repository.
- All environment variables must be documented in `.env.example`.
- Follow the full security model in `docs/SECURITY_SPEC.md`.

---

## 11. Third-Party Attribution

- Never clone an open-source project and rename it.
- Before using any external code or library, review its license.
- Document all attributions in `LICENSES/THIRD_PARTY.md`.

---

## 12. Handoff Protocol

At the end of every task session, update:

- `tasks/IN_PROGRESS.md`
- `tasks/DONE.md`
- `tasks/TODO.md`
- `tasks/CHANGELOG.md`
- `docs/HANDOFF.md`

`docs/HANDOFF.md` must enable any AI to continue without asking what happened.

---

## 13. Infrastructure Principle

Prefer simple, reliable infrastructure over unnecessary complexity.
Every infrastructure choice must be documented with rationale in
`docs/AWS_SPEC.md` or `docs/DECISION_LOG.md`.

---

## 14. Interface Stability

Keep all interfaces typed and stable. Breaking changes to:
- REST API contracts
- WebSocket message schemas
- Agent input/output schemas
- Shared TypeScript types

...require a version bump, documentation update, and must be announced
in `tasks/CHANGELOG.md`.

---

*Last updated: Phase 00 — Project Initialization*
