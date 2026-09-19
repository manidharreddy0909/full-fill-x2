# FULFILL-X — AWS COGNITO ADAPTER PLUGIN (PHASE 3)

## 1. Free-First Architecture Paradigm
FULFILL-X uses `LocalIdentityProvider` (PBKDF2/JWT) by default so developers and on-prem deployments can run with zero AWS costs or credentials.

---

## 2. Cognito Adapter Interface
When deployed to AWS SaaS environments (`AUTH_PROVIDER=cognito`), `CognitoIdentityProvider` in `backend/app/providers/identity.py` takes over user authentication using AWS Cognito User Pools (`boto3` / Warrant API), converting Cognito JWT claims seamlessly into standard FULFILL-X `SecurityContext`.
