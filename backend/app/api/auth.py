"""
FULFILL-X Authentication & Identity REST API Router (Phase 3)
Provides user registration, authentication, token refresh, logout, user profile, and user management.
"""
import logging
from typing import Dict, List, Any
from fastapi import APIRouter, Depends, HTTPException, Request, status
from app.api.deps import get_security_context, require_permission
from app.core.rate_limit import auth_rate_limiter
from app.core.security import JWTManager
from app.schemas.auth import (
    UserCreate,
    UserResponse,
    LoginRequest,
    TokenResponse,
    RefreshTokenRequest,
    SecurityContext,
    OrganizationResponse,
    UserInviteRequest,
    Permission,
)
from app.services.auth import AuthService

logger = logging.getLogger("fulfillx.api.auth")
router = APIRouter(prefix="/api/auth", tags=["Authentication & Identity"])


@router.post("/register", response_model=Dict[str, Any])
async def register(req: UserCreate, request: Request):
    """Register a new user and create an initial tenant organization."""
    client_ip = request.client.host if request.client else "127.0.0.1"
    if not auth_rate_limiter.check(f"register_{client_ip}"):
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Too many registration attempts. Please try again later.")

    try:
        service = AuthService.get_instance()
        user, org, token = service.register_user(req)
        return {
            "status": "SUCCESS",
            "message": f"User '{user.email}' registered successfully",
            "data": token,
        }
    except ValueError as val_err:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(val_err))
    except Exception as ex:
        logger.error(f"Error registering user: {ex}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Registration failed")


@router.post("/login", response_model=Dict[str, Any])
async def login(req: LoginRequest, request: Request):
    """Authenticate user credentials and issue JWT tokens."""
    client_ip = request.client.host if request.client else "127.0.0.1"
    if not auth_rate_limiter.check(f"login_{client_ip}"):
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Too many login attempts. Please try again later.")

    try:
        service = AuthService.get_instance()
        user, org, token = service.authenticate_user(req.email, req.password, req.organization_id)
        return {
            "status": "SUCCESS",
            "data": token,
        }
    except ValueError as val_err:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    except Exception as ex:
        logger.error(f"Error logging in user: {ex}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Authentication failed")


@router.post("/refresh", response_model=Dict[str, Any])
async def refresh_token(req: RefreshTokenRequest):
    """Issue a new access token using a valid refresh token."""
    try:
        service = AuthService.get_instance()
        token = service.refresh_session(req.refresh_token)
        return {
            "status": "SUCCESS",
            "data": token,
        }
    except ValueError as val_err:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(val_err))
    except Exception as ex:
        logger.error(f"Error refreshing token: {ex}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Token refresh failed")


@router.post("/logout")
async def logout(request: Request, ctx: SecurityContext = Depends(get_security_context)):
    """Revoke active JWT session token."""
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header[7:].strip()
        JWTManager.revoke_token(token)
    return {"status": "SUCCESS", "message": "Logged out successfully"}


@router.get("/me", response_model=Dict[str, Any])
async def get_current_user_profile(ctx: SecurityContext = Depends(get_security_context)):
    """Return authenticated user profile, organization context, and permission set."""
    return {
        "status": "SUCCESS",
        "data": {
            "user_id": ctx.user_id,
            "email": ctx.email,
            "display_name": ctx.display_name,
            "organization_id": ctx.organization_id,
            "organization_name": ctx.organization_name,
            "role": ctx.role.value,
            "permissions": [p.value for p in ctx.permissions],
            "auth_method": ctx.auth_method,
        }
    }


@router.get("/users", response_model=Dict[str, Any])
async def list_organization_users(ctx: SecurityContext = Depends(require_permission(Permission.USERS_READ))):
    """List members of current organization."""
    service = AuthService.get_instance()
    memberships = [m for m in service.memberships.values() if m["organization_id"] == ctx.organization_id]
    users_list = []
    for m in memberships:
        u_dict = service.users.get(m["user_id"])
        if u_dict:
            users_list.append({
                "user_id": u_dict["id"],
                "email": u_dict["email"],
                "display_name": u_dict["display_name"],
                "role": m["role"],
                "status": u_dict["status"],
                "created_at": u_dict["created_at"].isoformat() if hasattr(u_dict["created_at"], "isoformat") else str(u_dict["created_at"]),
            })
    return {"status": "SUCCESS", "total": len(users_list), "data": users_list}


@router.get("/organizations/current", response_model=Dict[str, Any])
async def get_current_organization(ctx: SecurityContext = Depends(require_permission(Permission.ORGANIZATION_READ))):
    """Fetch current organization details."""
    service = AuthService.get_instance()
    org_dict = service.organizations.get(ctx.organization_id)
    if not org_dict:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")
    return {"status": "SUCCESS", "data": org_dict}
