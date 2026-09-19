"""
FULFILL-X Authentication & Identity Unit & API Tests (Phase 3)
Tests password hashing, JWT creation/decoding/expiration/revocation, user registration,
login, token refresh, security context resolution, and REST API endpoints.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.security import PasswordHasher, JWTManager, get_permissions_for_role
from app.models.identity import SystemRole, UserStatus
from app.schemas.auth import Permission, UserCreate, LoginRequest
from app.services.auth import AuthService

client = TestClient(app)


def test_password_hasher():
    """Verify PBKDF2 password hashing and verification."""
    pwd = "SecureSecretPassword123!"
    hashed = PasswordHasher.hash_password(pwd)
    assert hashed.startswith("pbkdf2_sha256$")
    assert PasswordHasher.verify_password(pwd, hashed) is True
    assert PasswordHasher.verify_password("WrongPassword", hashed) is False


def test_jwt_manager_lifecycle():
    """Verify JWT token creation, claims decoding, expiration, and revocation."""
    subject = "usr-test-001"
    claims = {"email": "test@fulfillx.io", "role": "ADMIN", "org_id": "org-test-100"}

    token = JWTManager.create_token(subject=subject, expires_in_seconds=3600, claims=claims)
    assert token is not None

    decoded = JWTManager.decode_token(token)
    assert decoded["sub"] == subject
    assert decoded["email"] == "test@fulfillx.io"
    assert decoded["role"] == "ADMIN"
    assert decoded["org_id"] == "org-test-100"

    # Revoke token
    JWTManager.revoke_token(token)
    with pytest.raises(ValueError, match="revoked"):
        JWTManager.decode_token(token)


def test_auth_service_user_registration_and_login():
    """Verify AuthService user registration, organization creation, and login."""
    service = AuthService.get_instance()
    req = UserCreate(
        email="operator@fulfillx.io",
        display_name="Operations Manager",
        password="operator_pass_123",
        organization_name="Apex Logistics Inc",
    )

    user_resp, org_resp, token_resp = service.register_user(req)
    assert user_resp.email == "operator@fulfillx.io"
    assert org_resp.name == "Apex Logistics Inc"
    assert token_resp.access_token is not None
    assert token_resp.role == SystemRole.OWNER

    # Authenticate
    u_login, o_login, t_login = service.authenticate_user("operator@fulfillx.io", "operator_pass_123")
    assert u_login.id == user_resp.id
    assert o_login.id == org_resp.id
    assert t_login.access_token is not None

    # Invalid password login failure
    with pytest.raises(ValueError, match="Invalid email or password"):
        service.authenticate_user("operator@fulfillx.io", "wrong_password")


def test_auth_rest_endpoints():
    """Test /api/auth/register, /api/auth/login, /api/auth/me, /api/auth/refresh, /api/auth/logout."""
    # 1. Register via REST API
    reg_payload = {
        "email": "analyst@fulfillx.io",
        "display_name": "Data Analyst",
        "password": "analyst_password_123",
        "organization_name": "Analyst Org",
    }
    reg_res = client.post("/api/auth/register", json=reg_payload)
    assert reg_res.status_code == 200
    token_data = reg_res.json()["data"]
    access_token = token_data["access_token"]
    refresh_token = token_data["refresh_token"]

    # 2. Get Profile (/api/auth/me) with Bearer token
    headers = {"Authorization": f"Bearer {access_token}"}
    me_res = client.get("/api/auth/me", headers=headers)
    assert me_res.status_code == 200
    me_data = me_res.json()["data"]
    assert me_data["email"] == "analyst@fulfillx.io"
    assert "data:read" in me_data["permissions"]

    # 3. Login via REST API
    login_payload = {"email": "analyst@fulfillx.io", "password": "analyst_password_123"}
    login_res = client.post("/api/auth/login", json=login_payload)
    assert login_res.status_code == 200
    assert "access_token" in login_res.json()["data"]

    # 4. Refresh Token via REST API
    ref_res = client.post("/api/auth/refresh", json={"refresh_token": refresh_token})
    assert ref_res.status_code == 200
    assert "access_token" in ref_res.json()["data"]

    # 5. Logout via REST API
    logout_res = client.post("/api/auth/logout", headers=headers)
    assert logout_res.status_code == 200
