"""
FULFILL-X Authentication & Identity Service (Phase 3)
Manages Users, Organizations, Memberships, Security Contexts, and Access Tokens.
"""
import logging
import threading
from datetime import datetime, timezone
from typing import Dict, List, Optional, Tuple, Any
from uuid import uuid4

from app.config import settings
from app.core.security import PasswordHasher, JWTManager, get_permissions_for_role
from app.models.identity import SystemRole, UserStatus, OrganizationStatus
from app.schemas.auth import (
    UserCreate,
    UserResponse,
    OrganizationResponse,
    MembershipResponse,
    TokenResponse,
    SecurityContext,
    Permission,
)

logger = logging.getLogger("fulfillx.auth_service")


class AuthService:
    """
    Authoritative state manager for system Users, Organizations, and Memberships.
    Supports in-memory mode for zero-dependency execution and PostgreSQL persistent storage.
    """

    _instance: Optional["AuthService"] = None
    _lock: threading.RLock = threading.RLock()

    def __init__(self):
        self.lock = threading.RLock()
        self.users: Dict[str, Dict[str, Any]] = {}          # id -> user_dict
        self.users_by_email: Dict[str, str] = {}           # email -> user_id
        self.organizations: Dict[str, Dict[str, Any]] = {}  # id -> org_dict
        self.memberships: Dict[str, Dict[str, Any]] = {}    # id -> membership_dict
        self._initialize_default_tenant()

    @classmethod
    def get_instance(cls) -> "AuthService":
        with cls._lock:
            if cls._instance is None:
                cls._instance = AuthService()
            return cls._instance

    def _initialize_default_tenant(self) -> None:
        """Seed default enterprise organization and administrator user."""
        with self.lock:
            # 1. Default Organization
            org_id = "org-fulfillx-default"
            org = {
                "id": org_id,
                "name": "FULFILL-X Global Logistics Corp",
                "slug": "fulfillx-global",
                "status": OrganizationStatus.ACTIVE.value,
                "settings": {"mode": "ENTERPRISE"},
                "created_at": datetime.now(timezone.utc),
            }
            self.organizations[org_id] = org

            # 2. Default Admin User
            admin_id = "usr-admin-001"
            admin_email = "admin@fulfillx.io"
            admin_user = {
                "id": admin_id,
                "email": admin_email,
                "display_name": "Chief Supply Chain Executive",
                "password_hash": PasswordHasher.hash_password("admin123456"),
                "status": UserStatus.ACTIVE.value,
                "identity_provider": "local",
                "created_at": datetime.now(timezone.utc),
                "last_login_at": datetime.now(timezone.utc),
            }
            self.users[admin_id] = admin_user
            self.users_by_email[admin_email] = admin_id

            # 3. Membership (Admin is OWNER)
            mem_id = "mem-admin-001"
            membership = {
                "id": mem_id,
                "organization_id": org_id,
                "user_id": admin_id,
                "role": SystemRole.OWNER.value,
                "status": "ACTIVE",
                "created_at": datetime.now(timezone.utc),
            }
            self.memberships[mem_id] = membership

    def register_user(self, req: UserCreate) -> Tuple[UserResponse, OrganizationResponse, TokenResponse]:
        """Register a new user and create an initial tenant organization."""
        with self.lock:
            email_clean = req.email.strip().lower()
            if email_clean in self.users_by_email:
                raise ValueError(f"User with email '{req.email}' already exists")

            user_id = f"usr-{uuid4().hex[:12]}"
            org_id = f"org-{uuid4().hex[:12]}"
            mem_id = f"mem-{uuid4().hex[:12]}"

            org_name = req.organization_name or f"{req.display_name}'s Org"
            slug_base = "".join(c.lower() if c.isalnum() else "-" for c in org_name).strip("-")
            slug = f"{slug_base}-{uuid4().hex[:4]}"

            now = datetime.now(timezone.utc)

            # Create User
            user_dict = {
                "id": user_id,
                "email": email_clean,
                "display_name": req.display_name,
                "password_hash": PasswordHasher.hash_password(req.password),
                "status": UserStatus.ACTIVE.value,
                "identity_provider": "local",
                "created_at": now,
                "last_login_at": now,
            }
            self.users[user_id] = user_dict
            self.users_by_email[email_clean] = user_id

            # Create Organization
            org_dict = {
                "id": org_id,
                "name": org_name,
                "slug": slug,
                "status": OrganizationStatus.ACTIVE.value,
                "settings": {},
                "created_at": now,
            }
            self.organizations[org_id] = org_dict

            # Create Membership (OWNER)
            mem_dict = {
                "id": mem_id,
                "organization_id": org_id,
                "user_id": user_id,
                "role": SystemRole.OWNER.value,
                "status": "ACTIVE",
                "created_at": now,
            }
            self.memberships[mem_id] = mem_dict

            user_resp = UserResponse(
                id=user_id,
                email=email_clean,
                display_name=req.display_name,
                status=UserStatus.ACTIVE,
                identity_provider="local",
                created_at=now,
                last_login_at=now,
            )
            org_resp = OrganizationResponse(
                id=org_id,
                name=org_name,
                slug=slug,
                status=OrganizationStatus.ACTIVE,
                created_at=now,
            )

            role_enum = SystemRole.OWNER
            permissions = get_permissions_for_role(role_enum)

            token_resp = self._issue_tokens(user_resp, org_resp, role_enum, permissions)
            logger.info(f"Registered new User '{email_clean}' in Organization '{org_id}'")
            return user_resp, org_resp, token_resp

    def authenticate_user(self, email: str, password: str, target_org_id: Optional[str] = None) -> Tuple[UserResponse, OrganizationResponse, TokenResponse]:
        """Authenticate user credentials and issue security tokens."""
        with self.lock:
            email_clean = email.strip().lower()
            user_id = self.users_by_email.get(email_clean)
            if not user_id:
                raise ValueError("Invalid email or password")

            user_dict = self.users[user_id]
            if not PasswordHasher.verify_password(password, user_dict["password_hash"]):
                raise ValueError("Invalid email or password")

            if user_dict["status"] != UserStatus.ACTIVE.value:
                raise ValueError("User account is disabled")

            # Resolve membership
            user_memberships = [m for m in self.memberships.values() if m["user_id"] == user_id and m["status"] == "ACTIVE"]
            if not user_memberships:
                raise ValueError("User is not an active member of any organization")

            if target_org_id:
                active_mem = next((m for m in user_memberships if m["organization_id"] == target_org_id), None)
                if not active_mem:
                    raise ValueError(f"User is not a member of organization '{target_org_id}'")
            else:
                active_mem = user_memberships[0]

            org_dict = self.organizations[active_mem["organization_id"]]
            now = datetime.now(timezone.utc)
            user_dict["last_login_at"] = now

            user_resp = UserResponse(
                id=user_dict["id"],
                email=user_dict["email"],
                display_name=user_dict["display_name"],
                status=UserStatus(user_dict["status"]),
                identity_provider=user_dict.get("identity_provider", "local"),
                created_at=user_dict["created_at"],
                last_login_at=now,
            )
            org_resp = OrganizationResponse(
                id=org_dict["id"],
                name=org_dict["name"],
                slug=org_dict["slug"],
                status=OrganizationStatus(org_dict["status"]),
                created_at=org_dict["created_at"],
            )

            role_enum = SystemRole(active_mem["role"])
            permissions = get_permissions_for_role(role_enum)

            token_resp = self._issue_tokens(user_resp, org_resp, role_enum, permissions)
            logger.info(f"Authenticated User '{email_clean}' for Organization '{org_resp.id}'")
            return user_resp, org_resp, token_resp

    def _issue_tokens(
        self,
        user: UserResponse,
        org: OrganizationResponse,
        role: SystemRole,
        permissions: List[Permission],
    ) -> TokenResponse:
        """Issue JWT Access & Refresh Tokens for security context."""
        claims = {
            "email": user.email,
            "display_name": user.display_name,
            "org_id": org.id,
            "org_name": org.name,
            "role": role.value,
            "permissions": [p.value for p in permissions],
        }

        access_token = JWTManager.create_token(
            subject=user.id,
            token_type="access",
            expires_in_seconds=900,  # 15 mins
            claims=claims,
        )
        refresh_token = JWTManager.create_token(
            subject=user.id,
            token_type="refresh",
            expires_in_seconds=604800,  # 7 days
            claims={"org_id": org.id},
        )

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=900,
            user=user,
            organization=org,
            role=role,
            permissions=permissions,
        )

    def refresh_session(self, refresh_token: str) -> TokenResponse:
        """Issue a new access token from a valid refresh token."""
        payload = JWTManager.decode_token(refresh_token)
        if payload.get("type") != "refresh":
            raise ValueError("Invalid refresh token type")

        user_id = payload["sub"]
        org_id = payload.get("org_id")

        with self.lock:
            user_dict = self.users.get(user_id)
            if not user_dict or user_dict["status"] != UserStatus.ACTIVE.value:
                raise ValueError("User account is inactive or not found")

            org_dict = self.organizations.get(org_id) if org_id else None
            if not org_dict:
                user_mems = [m for m in self.memberships.values() if m["user_id"] == user_id]
                if not user_mems:
                    raise ValueError("User has no organization memberships")
                org_dict = self.organizations[user_mems[0]["organization_id"]]

            active_mem = next((m for m in self.memberships.values() if m["user_id"] == user_id and m["organization_id"] == org_dict["id"]), None)
            role_enum = SystemRole(active_mem["role"]) if active_mem else SystemRole.OPERATOR
            permissions = get_permissions_for_role(role_enum)

            user_resp = UserResponse(
                id=user_dict["id"],
                email=user_dict["email"],
                display_name=user_dict["display_name"],
                status=UserStatus(user_dict["status"]),
                identity_provider=user_dict.get("identity_provider", "local"),
                created_at=user_dict["created_at"],
                last_login_at=datetime.now(timezone.utc),
            )
            org_resp = OrganizationResponse(
                id=org_dict["id"],
                name=org_dict["name"],
                slug=org_dict["slug"],
                status=OrganizationStatus(org_dict["status"]),
                created_at=org_dict["created_at"],
            )

            return self._issue_tokens(user_resp, org_resp, role_enum, permissions)

    def build_security_context_from_token(self, token: str) -> SecurityContext:
        """Decode JWT token and construct immutable SecurityContext object."""
        payload = JWTManager.decode_token(token)
        user_id = payload["sub"]
        email = payload.get("email", "")
        display_name = payload.get("display_name", "")
        org_id = payload.get("org_id", "org-fulfillx-default")
        org_name = payload.get("org_name", "FULFILL-X Global Logistics Corp")
        role_str = payload.get("role", SystemRole.OWNER.value)

        try:
            role_enum = SystemRole(role_str)
        except ValueError:
            role_enum = SystemRole.VIEWER

        permissions = get_permissions_for_role(role_enum)

        return SecurityContext(
            user_id=user_id,
            email=email,
            display_name=display_name,
            organization_id=org_id,
            organization_name=org_name,
            role=role_enum,
            permissions=permissions,
            auth_method="local",
        )

    def get_default_security_context(self) -> SecurityContext:
        """Default pre-authenticated SecurityContext for offline Demo Mode & System testing."""
        return SecurityContext(
            user_id="usr-admin-001",
            email="admin@fulfillx.io",
            display_name="Chief Supply Chain Executive",
            organization_id="org-fulfillx-default",
            organization_name="FULFILL-X Global Logistics Corp",
            role=SystemRole.OWNER,
            permissions=get_permissions_for_role(SystemRole.OWNER),
            auth_method="default",
        )
