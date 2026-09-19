# FULFILL-X — IDENTITY & MULTI-TENANT ARCHITECTURE (PHASE 3)

## 1. Executive Summary

FULFILL-X implements an enterprise-grade Zero-Trust Identity and Multi-Tenant Architecture. Built with a **Free-First / Local-First** paradigm, the default identity tier operates completely locally without requiring cloud subscriptions or third-party identity providers, while providing an optional AWS Cognito Adapter plugin for enterprise SaaS deployments.

---

## 2. Core Identity Models

### 2.1 Domain ERD Structure
```
+-------------------+        1:N       +-------------------+        N:1       +-------------------+
| OrganizationModel | <----------------|  MembershipModel  |----------------> |     UserModel     |
+-------------------+                  +-------------------+                  +-------------------+
| id (PK)           |                  | id (PK)           |                  | id (PK)           |
| name              |                  | organization_id   |                  | email (UNIQUE)    |
| slug (UNIQUE)     |                  | user_id           |                  | display_name      |
| created_at        |                  | role              |                  | password_hash     |
+-------------------+                  +-------------------+                  | status            |
                                                                              +-------------------+
```

### 2.2 Row-Level Multi-Tenant Isolation
All persistent domain models in FULFILL-X contain a indexed `organization_id` foreign key:
1. `WorldSnapshotModel` (`organization_id`)
2. `SignalModel` (`organization_id`)
3. `RiskSnapshotModel` (`organization_id`)
4. `CandidatePlanModel` (`organization_id`)
5. `ApprovalDecisionModel` (`organization_id`)
6. `EvaluationRunModel` (`organization_id`)
7. `AuditEventModel` (`organization_id`)
8. `EventHistoryModel` (`organization_id`)
9. `DataProvenanceModel` (`organization_id`)

---

## 3. Cryptographic Token & Passphrase Engine

- **Password Hashing**: PBKDF2-HMAC-SHA256 with 100,000 iterations and 16-byte random salt.
- **Access Tokens**: HMAC-SHA256 JWT tokens with 60-minute expiration.
- **Refresh Tokens**: Cryptographically secure 256-bit random tokens with 30-day expiration.
- **Revocation**: In-memory and persistent token blacklist preventing replay of revoked sessions.
