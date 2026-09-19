# Model Registry & Lifecycle Specification

## 1. Lifecycle States
1. **`TRAINED`**: Model successfully fitted on training split.
2. **`VALIDATED`**: Model evaluated on validation split and tested against naive baseline.
3. **`CANDIDATE`**: Model ready for evaluation/approval.
4. **`ACTIVE`**: Model actively serving inference in production.
5. **`RETIRED`**: Previously active model superseded by a newer version.
6. **`REJECTED`**: Model failed baseline validation or experienced severe drift.

---

## 2. Integrity & Rollback Protocol
* **Artifact Checksum**: SHA256 checksums are recorded upon training and verified prior to loading model binary artifacts from `artifacts/models/`.
* **Deterministic Rollback**: `rollback_model(organization_id, task_type)` reinstates the previously active validated model version instantly.
