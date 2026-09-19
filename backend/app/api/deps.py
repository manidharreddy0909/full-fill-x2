"""
FULFILL-X FastAPI Security Dependencies (Phase 3)
Provides security context extraction, bearer token validation, and RBAC permission enforcement.
"""
import logging
from typing import Callable, Optional
from fastapi import Depends, HTTPException, Header, Request, status
from app.schemas.auth import Permission, SecurityContext, SystemRole
from app.services.auth import AuthService

logger = logging.getLogger("fulfillx.deps")


async def get_security_context(
    authorization: Optional[str] = Header(None),
) -> SecurityContext:
    """
    Extract Bearer JWT token from Authorization header and resolve SecurityContext.
    Falls back gracefully to default pre-authenticated context in non-strict modes.
    """
    auth_service = AuthService.get_instance()

    if authorization and authorization.startswith("Bearer "):
        token = authorization[7:].strip()
        try:
            return auth_service.build_security_context_from_token(token)
        except Exception as ex:
            logger.warning(f"Bearer token validation failed: {ex}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid or expired authentication token: {ex}",
                headers={"WWW-Authenticate": "Bearer"},
            )

    # Default Context for offline/demo/development execution
    return auth_service.get_default_security_context()


def require_permission(permission: Permission) -> Callable:
    """
    Dependency factory enforcing required Permission on an endpoint.
    """
    async def permission_checker(
        ctx: SecurityContext = Depends(get_security_context),
    ) -> SecurityContext:
        if not ctx.has_permission(permission):
            logger.warning(f"Permission DENIED for User '{ctx.user_id}' ({ctx.email}): required '{permission.value}', has permissions '{[p.value for p in ctx.permissions]}'")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied: operation requires permission '{permission.value}'",
            )
        return ctx

    return permission_checker


def require_role(role: SystemRole) -> Callable:
    """
    Dependency factory enforcing required SystemRole on an endpoint.
    """
    async def role_checker(
        ctx: SecurityContext = Depends(get_security_context),
    ) -> SecurityContext:
        if ctx.role != role and ctx.role != SystemRole.OWNER and SystemRole.ADMIN not in ctx.role.value:
            logger.warning(f"Role DENIED for User '{ctx.user_id}': required '{role.value}', has '{ctx.role.value}'")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: operation requires role '{role.value}'",
            )
        return ctx

    return role_checker
