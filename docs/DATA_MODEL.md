# FULFILL-X — DATA MODEL SPECIFICATION (Phase 2)

## 1. PERSISTENT ENTITIES & SCHEMAS

The FULFILL-X database schema consists of 12 normalized relational tables:

| Table Name | Primary Key | Description & Key Attributes |
| :--- | :--- | :--- |
| `world_snapshots` | `snapshot_id` (UUID) | Network snapshot containing `seed`, `preset`, node/edge counts, health score, and JSON payload. |
| `signals` | `id` (UUID) | Disruption signals with `signal_type`, `severity`, `title`, `description`, `confidence`, `source`, `affected_node_ids`, `dedupe_hash`. |
| `risk_snapshots` | `id` (UUID) | Computed risk state containing `average_risk`, `node_risks`, `explanations`, `propagation_paths`, and `engine_version`. |
| `scenarios` | `scenario_id` (string) | Compound scenario objects with `scenario_type`, `trigger`, `affected_entities`, `parameters`, and `fingerprint`. |
| `agent_proposals` | `id` (UUID) | Multi-agent proposals with `session_id`, `agent_type`, `actions`, `estimated_cost`, `delay_hours`, `carbon_impact`, `confidence`. |
| `candidate_plans` | `plan_id` (string) | Reconciled plans with `session_id`, `candidate_name`, `metrics`, `constraints`, `pareto_points`, `robustness_score`. |
| `verification_reports`| `report_id` (UUID) | Sandbox verification results with `session_id`, `plan_id`, `status`, `pass_rate`, `passed_checks`, `total_checks`. |
| `approval_decisions` | `id` (UUID) | Human decision record with `session_id`, `plan_id`, `status` (`APPROVED`/`REJECTED`), `approver`, `rationale`, `applied_actions`. |
| `evaluation_runs` | `run_id` (UUID) | Benchmark run outputs with `scenario_id`, `seed`, `final_health`, `resilience_score`, `slr`, `step_count`, `metrics`. |
| `audit_events` | `id` (UUID) | Immutable audit trail with `session_id`, `actor`, `stage`, `action`, `details`. |
| `event_history` | `id` (UUID) | Realtime event history sink with `event_type`, `sequence`, `session_id`, `source`, `severity`, `payload`. |
| `data_provenance` | `id` (UUID) | Data lineage records with `entity_id`, `entity_type`, `source_type`, `collector`, `license`, `schema_version`, `content_hash`. |
