"""
FULFILL-X Core Security Engine (Phase 3)
Cryptographic password hashing (PBKDF2-HMAC-SHA256), HMAC-SHA256 JWT Token Management,
RBAC Policy Matrix, and Security Assertions matching docs/SECURITY_MODEL.md & docs/AUTHORIZATION_MODEL.md.
"""
import base64
import hashlib
import hmac
import json
import logging
import os
import secrets
import time
from datetime import datetime, timezone
from typing import Dict, List, Optional, Set, Any, Tuple
from app.schemas.auth import Permission, SystemRole, SecurityContext

logger = logging.getLogger("fulfillx.security")

# Authoritative RBAC Role-to-Permissions Mapping Matrix
ROLE_PERMISSIONS_MAP: Dict[SystemRole, List[Permission]] = {
    SystemRole.OWNER: list(Permission),
    SystemRole.ADMIN: [
        Permission.WORLD_READ, Permission.WORLD_WRITE,
        Permission.SIGNALS_READ, Permission.SIGNALS_INGEST, Permission.SIGNALS_DELETE,
        Permission.RISK_READ, Permission.RISK_RUN,
        Permission.AGENTS_READ, Permission.AGENTS_RUN,
        Permission.PLANS_READ, Permission.PLANS_CREATE,
        Permission.SIMULATION_READ, Permission.SIMULATION_RUN,
        Permission.VERIFICATION_READ, Permission.VERIFICATION_RUN,
        Permission.DECISION_READ, Permission.DECISION_APPROVE, Permission.DECISION_REJECT,
        Permission.EVALUATION_READ, Permission.EVALUATION_RUN,
        Permission.DATA_READ, Permission.DATA_EXPORT, Permission.DATA_IMPORT, Permission.DATA_RESET,
        Permission.USERS_READ, Permission.USERS_MANAGE,
        Permission.ORGANIZATION_READ, Permission.ORGANIZATION_MANAGE,
        Permission.AUDIT_READ,
        Permission.OBSERVABILITY_READ, Permission.OBSERVABILITY_MANAGE,
        Permission.ALERTS_READ, Permission.ALERTS_MANAGE,
        Permission.METRICS_READ, Permission.TRACES_READ, Permission.EVENTS_INSPECT,
        Permission.ML_READ, Permission.ML_TRAIN, Permission.ML_EVALUATE, Permission.ML_ACTIVATE, Permission.ML_RETIRE, Permission.ML_PREDICT, Permission.ML_MANAGE,
        Permission.GRAPH_READ, Permission.GRAPH_ANALYZE,
        Permission.GNN_READ, Permission.GNN_TRAIN, Permission.GNN_EVALUATE, Permission.GNN_ACTIVATE, Permission.GNN_RETIRE, Permission.GNN_PREDICT, Permission.GNN_MANAGE,
        Permission.CAUSAL_READ, Permission.CAUSAL_ANALYZE, Permission.CAUSAL_COUNTERFACTUAL, Permission.CAUSAL_MANAGE,
        Permission.TWIN_READ, Permission.TWIN_CREATE, Permission.TWIN_MANAGE, Permission.SIMULATION_MANAGE, Permission.RESILIENCE_READ, Permission.RESILIENCE_ANALYZE, Permission.RESILIENCE_MANAGE, Permission.STRATEGY_SIMULATE,
        Permission.SYSTEM_ADMIN,
    ],
    SystemRole.OPERATOR: [
        Permission.WORLD_READ, Permission.WORLD_WRITE,
        Permission.SIGNALS_READ, Permission.SIGNALS_INGEST,
        Permission.RISK_READ, Permission.RISK_RUN,
        Permission.AGENTS_READ, Permission.AGENTS_RUN,
        Permission.PLANS_READ, Permission.PLANS_CREATE,
        Permission.SIMULATION_READ, Permission.SIMULATION_RUN,
        Permission.VERIFICATION_READ, Permission.VERIFICATION_RUN,
        Permission.DECISION_READ, Permission.DECISION_APPROVE, Permission.DECISION_REJECT,
        Permission.EVALUATION_READ,
        Permission.DATA_READ, Permission.DATA_EXPORT,
        Permission.ORGANIZATION_READ, Permission.USERS_READ,
        Permission.AUDIT_READ,
        Permission.OBSERVABILITY_READ, Permission.ALERTS_READ, Permission.ALERTS_MANAGE,
        Permission.METRICS_READ, Permission.TRACES_READ, Permission.EVENTS_INSPECT,
        Permission.ML_READ, Permission.ML_TRAIN, Permission.ML_PREDICT, Permission.ML_EVALUATE,
        Permission.GRAPH_READ, Permission.GRAPH_ANALYZE, Permission.GNN_READ, Permission.GNN_PREDICT, Permission.CAUSAL_READ, Permission.CAUSAL_COUNTERFACTUAL,
        Permission.TWIN_READ, Permission.TWIN_CREATE, Permission.RESILIENCE_READ, Permission.RESILIENCE_ANALYZE, Permission.STRATEGY_SIMULATE,
    ],
    SystemRole.ANALYST: [
        Permission.WORLD_READ,
        Permission.SIGNALS_READ,
        Permission.RISK_READ, Permission.RISK_RUN,
        Permission.AGENTS_READ, Permission.AGENTS_RUN,
        Permission.PLANS_READ, Permission.PLANS_CREATE,
        Permission.SIMULATION_READ, Permission.SIMULATION_RUN,
        Permission.VERIFICATION_READ,
        Permission.DECISION_READ,
        Permission.EVALUATION_READ, Permission.EVALUATION_RUN,
        Permission.DATA_READ, Permission.DATA_EXPORT,
        Permission.ORGANIZATION_READ, Permission.USERS_READ,
        Permission.AUDIT_READ,
        Permission.OBSERVABILITY_READ, Permission.ALERTS_READ,
        Permission.METRICS_READ, Permission.TRACES_READ, Permission.EVENTS_INSPECT,
        Permission.ML_READ, Permission.ML_PREDICT, Permission.ML_EVALUATE,
        Permission.GRAPH_READ, Permission.GRAPH_ANALYZE, Permission.GNN_READ, Permission.GNN_PREDICT, Permission.CAUSAL_READ, Permission.CAUSAL_ANALYZE, Permission.CAUSAL_COUNTERFACTUAL,
        Permission.TWIN_READ, Permission.TWIN_CREATE, Permission.RESILIENCE_READ, Permission.RESILIENCE_ANALYZE, Permission.STRATEGY_SIMULATE,
    ],
    SystemRole.VIEWER: [
        Permission.WORLD_READ,
        Permission.SIGNALS_READ,
        Permission.RISK_READ,
        Permission.AGENTS_READ,
        Permission.PLANS_READ,
        Permission.SIMULATION_READ,
        Permission.VERIFICATION_READ,
        Permission.DECISION_READ,
        Permission.EVALUATION_READ,
        Permission.DATA_READ,
        Permission.ORGANIZATION_READ,
        Permission.OBSERVABILITY_READ, Permission.ALERTS_READ, Permission.METRICS_READ,
        Permission.ML_READ,
        Permission.GRAPH_READ, Permission.GNN_READ, Permission.CAUSAL_READ,
        Permission.TWIN_READ, Permission.RESILIENCE_READ,
    ],
    SystemRole.AUDITOR: [
        Permission.WORLD_READ,
        Permission.SIGNALS_READ,
        Permission.RISK_READ,
        Permission.AGENTS_READ,
        Permission.PLANS_READ,
        Permission.SIMULATION_READ,
        Permission.VERIFICATION_READ,
        Permission.DECISION_READ,
        Permission.EVALUATION_READ,
        Permission.DATA_READ,
        Permission.ORGANIZATION_READ, Permission.USERS_READ,
        Permission.AUDIT_READ,
        Permission.ML_READ,
        Permission.GRAPH_READ, Permission.GNN_READ, Permission.CAUSAL_READ,
        Permission.OBSERVABILITY_READ, Permission.ALERTS_READ,
        Permission.METRICS_READ, Permission.TRACES_READ, Permission.EVENTS_INSPECT,
    ],
}


def get_permissions_for_role(role: SystemRole) -> List[Permission]:
    """Retrieve list of permissions granted to a given role."""
    return ROLE_PERMISSIONS_MAP.get(role, ROLE_PERMISSIONS_MAP[SystemRole.VIEWER])


class PasswordHasher:
    """
    Standard Library PBKDF2-HMAC-SHA256 Password Hasher.
    NIST Approved 100,000 Iterations with 16-byte cryptographically secure salt.
    """

    ITERATIONS = 100000

    @classmethod
    def hash_password(cls, password: str) -> str:
        if not password:
            raise ValueError("Password cannot be empty")
        salt = secrets.token_bytes(16)
        pwd_hash = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, cls.ITERATIONS)
        salt_b64 = base64.b64encode(salt).decode("utf-8")
        hash_b64 = base64.b64encode(pwd_hash).decode("utf-8")
        return f"pbkdf2_sha256${cls.ITERATIONS}${salt_b64}${hash_b64}"

    @classmethod
    def verify_password(cls, password: str, hashed: str) -> bool:
        try:
            parts = hashed.split("$")
            if len(parts) != 4 or parts[0] != "pbkdf2_sha256":
                return False
            iterations = int(parts[1])
            salt = base64.b64decode(parts[2])
            expected_hash = base64.b64decode(parts[3])

            pwd_hash = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iterations)
            return hmac.compare_digest(pwd_hash, expected_hash)
        except Exception:
            return False


class JWTManager:
    """
    HMAC-SHA256 JWT Token Engine (Standard Library Base64 & HMAC implementation).
    Supports token generation, signature validation, expiration, and revocation.
    """

    _SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "fulfillx_super_secret_jwt_key_phase3_2026_dev")
    _ISSUER: str = "fulfillx-auth-service"
    _AUDIENCE: str = "fulfillx-api"
    _REVOKED_JTIS: Set[str] = set()

    @classmethod
    def _b64_encode(cls, data: bytes) -> str:
        return base64.urlsafe_b64encode(data).decode("utf-8").rstrip("=")

    @classmethod
    def _b64_decode(cls, s: str) -> bytes:
        padding = "=" * (4 - (len(s) % 4)) if len(s) % 4 != 0 else ""
        return base64.urlsafe_b64decode((s + padding).encode("utf-8"))

    @classmethod
    def create_token(
        cls,
        subject: str,
        token_type: str = "access",
        expires_in_seconds: int = 900,
        claims: Optional[Dict[str, Any]] = None,
    ) -> str:
        header = {"alg": "HS256", "typ": "JWT"}
        now = int(time.time())
        jti = secrets.token_hex(12)

        payload = {
            "iss": cls._ISSUER,
            "aud": cls._AUDIENCE,
            "sub": subject,
            "type": token_type,
            "iat": now,
            "exp": now + expires_in_seconds,
            "jti": jti,
        }
        if claims:
            payload.update(claims)

        header_json = json.dumps(header, separators=(",", ":")).encode("utf-8")
        payload_json = json.dumps(payload, separators=(",", ":")).encode("utf-8")

        encoded_header = cls._b64_encode(header_json)
        encoded_payload = cls._b64_encode(payload_json)

        signing_input = f"{encoded_header}.{encoded_payload}".encode("utf-8")
        signature = hmac.new(cls._SECRET_KEY.encode("utf-8"), signing_input, hashlib.sha256).digest()
        encoded_signature = cls._b64_encode(signature)

        return f"{encoded_header}.{encoded_payload}.{encoded_signature}"

    @classmethod
    def decode_token(cls, token: str) -> Dict[str, Any]:
        parts = token.split(".")
        if len(parts) != 3:
            raise ValueError("Invalid JWT token format")

        encoded_header, encoded_payload, encoded_signature = parts

        signing_input = f"{encoded_header}.{encoded_payload}".encode("utf-8")
        expected_sig = hmac.new(cls._SECRET_KEY.encode("utf-8"), signing_input, hashlib.sha256).digest()
        actual_sig = cls._b64_decode(encoded_signature)

        if not hmac.compare_digest(expected_sig, actual_sig):
            raise ValueError("Invalid JWT token signature")

        payload_bytes = cls._b64_decode(encoded_payload)
        payload = json.loads(payload_bytes.decode("utf-8"))

        now = int(time.time())
        if payload.get("exp", 0) < now:
            raise ValueError("JWT token has expired")

        if payload.get("iss") != cls._ISSUER or payload.get("aud") != cls._AUDIENCE:
            raise ValueError("Invalid JWT issuer or audience")

        jti = payload.get("jti")
        if jti and jti in cls._REVOKED_JTIS:
            raise ValueError("JWT token has been revoked")

        return payload

    @classmethod
    def revoke_token(cls, token: str) -> None:
        try:
            payload = cls.decode_token(token)
            jti = payload.get("jti")
            if jti:
                cls._REVOKED_JTIS.add(jti)
        except Exception:
            pass
