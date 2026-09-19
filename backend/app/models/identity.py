"""
FULFILL-X Identity & Tenancy Database Models (Phase 3)
SQLAlchemy 2.0 Declarative Models matching docs/DATA_MODEL.md & docs/IDENTITY_ARCHITECTURE.md
"""
import uuid
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional
from sqlalchemy import (
    String,
    Integer,
    Float,
    Boolean,
    DateTime,
    Text,
    JSON,
    ForeignKey,
    Index,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.session import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class UserStatus(str, Enum):
    ACTIVE = "ACTIVE"
    DISABLED = "DISABLED"
    PENDING_VERIFICATION = "PENDING_VERIFICATION"


class OrganizationStatus(str, Enum):
    ACTIVE = "ACTIVE"
    SUSPENDED = "SUSPENDED"


class SystemRole(str, Enum):
    OWNER = "OWNER"
    ADMIN = "ADMIN"
    OPERATOR = "OPERATOR"
    ANALYST = "ANALYST"
    VIEWER = "VIEWER"
    AUDITOR = "AUDITOR"


class UserModel(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: f"usr-{uuid.uuid4().hex[:12]}")
    email: Mapped[str] = mapped_column(String(256), nullable=False, unique=True, index=True)
    display_name: Mapped[str] = mapped_column(String(128), nullable=False)
    password_hash: Mapped[str] = mapped_column(String(256), nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default=UserStatus.ACTIVE.value)
    identity_provider: Mapped[str] = mapped_column(String(32), nullable=False, default="local")
    external_subject: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)
    last_login_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    memberships: Mapped[List["MembershipModel"]] = relationship("MembershipModel", back_populates="user", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_users_email_status", "email", "status"),
        Index("idx_users_created_at", "created_at"),
    )


class OrganizationModel(Base):
    __tablename__ = "organizations"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: f"org-{uuid.uuid4().hex[:12]}")
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    slug: Mapped[str] = mapped_column(String(128), nullable=False, unique=True, index=True)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default=OrganizationStatus.ACTIVE.value)
    settings: Mapped[Dict[str, Any]] = mapped_column(JSON, nullable=False, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    memberships: Mapped[List["MembershipModel"]] = relationship("MembershipModel", back_populates="organization", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_organizations_slug_status", "slug", "status"),
        Index("idx_organizations_created_at", "created_at"),
    )


class MembershipModel(Base):
    __tablename__ = "memberships"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: f"mem-{uuid.uuid4().hex[:12]}")
    organization_id: Mapped[str] = mapped_column(String(64), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id: Mapped[str] = mapped_column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    role: Mapped[str] = mapped_column(String(32), nullable=False, default=SystemRole.OPERATOR.value)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="ACTIVE")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    user: Mapped["UserModel"] = relationship("UserModel", back_populates="memberships")
    organization: Mapped["OrganizationModel"] = relationship("OrganizationModel", back_populates="memberships")

    __table_args__ = (
        UniqueConstraint("organization_id", "user_id", name="uq_org_user_membership"),
        Index("idx_memberships_org_role", "organization_id", "role"),
    )
