# Historical Data Replay Service Specification

## 1. Purpose & Scope
The `DataReplayService` (`backend/app/services/data_replay.py`) allows operators and automated verification suites to replay historical external observation datasets across deterministic time windows.

---

## 2. Replay Execution Mechanism
* **Input**: `DataReplayRequest` containing target `start_time`, `end_time`, `source_ids`, and deterministic seed integer (default: 42).
* **Isolation**: Replay executions run statelessly without corrupting live production signal feeds.
* **Deterministic Guarantees**: Given identical seed $S$ and historical window $[T_0, T_1]$, replay produces identical `IngestionRunSummary` output, signal sequence, and Risk Engine scores ($100\%$ determinism verified).
