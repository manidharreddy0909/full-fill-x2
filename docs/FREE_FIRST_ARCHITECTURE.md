# FULFILL-X — FREE-FIRST ARCHITECTURE POLICY (Phase 2)

## 1. INFRASTRUCTURE COST CLASSIFICATION

| Category | Components / Tooling | Rationale & Policy |
| :--- | :--- | :--- |
| **Tier A: FREE / LOCAL (Primary)** | PostgreSQL (Docker), Redis (Docker), PyTorch, scikit-learn, NetworkX, FastAPI, Vite/React, Local EventBus | **Default Development Target**. Zero cloud costs. 100% offline-capable. |
| **Tier B: AWS Free Tier Candidates** | AWS S3, CloudFront CDN, Cognito | Optional cloud CDN deployment; verified before enablement. |
| **Tier C: Credit / Usage Controlled** | AWS RDS, AWS Bedrock, ECS Fargate | Metered cloud infrastructure; optional with local fallback. |

## 2. PROHIBITED DEFAULT INFRASTRUCTURE

- NO default NAT Gateways or cloud GPUs.
- NO mandatory cloud databases.
- NO unverified paid third-party APIs.
