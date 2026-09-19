# FULFILL-X — THREAT MODEL & STRIDE ANALYSIS (PHASE 3)

| Threat Category | Potential Risk | Mitigation in FULFILL-X |
| :--- | :--- | :--- |
| **Spoofing** | Forging JWT token or user identity | Cryptographic HMAC-SHA256 signature verification & token revocation blacklist. |
| **Tampering** | Modifying candidate plan or audit records | Invariant state mutation guards and DB row-level tenant validation. |
| **Repudiation** | Denying an approval decision | Immutable audit log event records with caller `user_id`, `organization_id`, and `timestamp`. |
| **Information Disclosure** | Cross-tenant data leakage | Strict `organization_id` WHERE clause filtering on all 9 persistent ORM models. |
| **Denial of Service** | API flooding or resource exhaustion | `SlidingWindowRateLimiter` sliding window rate limiting. |
| **Elevation of Privilege** | Normal user escalating to Admin | Authoritative RBAC policy enforcement on FastAPI router dependencies. |
