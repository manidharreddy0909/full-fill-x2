"""
FULFILL-X Identity Provider Abstraction (Phase 3)
Supports LocalIdentityProvider (Tier A default) and CognitoIdentityProvider (Tier B optional).
"""
import logging
import os
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

logger = logging.getLogger("fulfillx.providers.identity")


class IdentityProvider(ABC):
    """Abstract Identity Provider Interface."""

    @abstractmethod
    def get_provider_name(self) -> str:
        pass

    @abstractmethod
    def is_configured(self) -> bool:
        pass

    @abstractmethod
    async def authenticate(self, credentials: Dict[str, Any]) -> Dict[str, Any]:
        pass


class LocalIdentityProvider(IdentityProvider):
    """Local Free-First Identity Provider (PBKDF2 Password Hashing + Local JWT)."""

    def get_provider_name(self) -> str:
        return "local"

    def is_configured(self) -> bool:
        return True

    async def authenticate(self, credentials: Dict[str, Any]) -> Dict[str, Any]:
        return {"status": "LOCAL_AUTH_HANDLED"}


class CognitoIdentityProvider(IdentityProvider):
    """
    AWS Cognito Identity Provider Adapter (Tier B Optional).
    Integrates with AWS Cognito User Pools when configured.
    """

    def __init__(self):
        self.user_pool_id = os.getenv("AWS_COGNITO_USER_POOL_ID")
        self.client_id = os.getenv("AWS_COGNITO_CLIENT_ID")
        self.region = os.getenv("AWS_REGION", "us-east-1")

    def get_provider_name(self) -> str:
        return "cognito"

    def is_configured(self) -> bool:
        return bool(self.user_pool_id and self.client_id)

    async def authenticate(self, credentials: Dict[str, Any]) -> Dict[str, Any]:
        if not self.is_configured():
            logger.warning("AWS Cognito is not configured. Falling back to Local Identity Provider.")
            return {"status": "FALLBACK_LOCAL", "reason": "COGNITO_NOT_CONFIGURED"}
        
        try:
            import boto3
            client = boto3.client("cognito-idp", region_name=self.region)
            response = client.initiate_auth(
                ClientId=self.client_id,
                AuthFlow="USER_PASSWORD_AUTH",
                AuthParameters={
                    "USERNAME": credentials.get("email", ""),
                    "PASSWORD": credentials.get("password", ""),
                },
            )
            return {
                "status": "SUCCESS",
                "id_token": response["AuthenticationResult"]["IdToken"],
                "access_token": response["AuthenticationResult"]["AccessToken"],
                "refresh_token": response["AuthenticationResult"]["RefreshToken"],
            }
        except Exception as ex:
            logger.warning(f"Cognito authentication failed: {ex}. Returning fallback error.")
            return {"status": "FAILED", "error": str(ex)}
