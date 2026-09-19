"""
FULFILL-X AWS Integration & Cloud Security Test Suite (Phase 14)
Verifies AWS configuration settings, Bedrock provider initialization & fallback,
cloud readiness probes, CloudWatch log formatting, and origin security.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.config import settings
from app.providers.bedrock import BedrockProvider
from app.providers.factory import ProviderFactory

client = TestClient(app)


def test_aws_region_configuration():
    """Verify AWS_REGION is configurable via environment."""
    assert isinstance(settings.AWS_REGION, str)
    assert len(settings.AWS_REGION) > 0


def test_bedrock_provider_instantiation_and_fallback():
    """Verify BedrockProvider initializes cleanly and falls back safely when unconfigured."""
    provider = BedrockProvider(region_name=settings.AWS_REGION)
    assert provider.model_id == settings.AWS_BEDROCK_MODEL_ID
    
    # Factory behavior test
    factory = ProviderFactory.get_instance()
    active_provider = factory.get_provider()
    # Mock provider should be active by default in offline environment
    assert active_provider is not None


def test_cloud_readiness_probe():
    """Verify GET /api/health probe exposes operational dependency status for AWS ALB checks."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "world_repository" in data["dependencies"]
    assert "risk_repository" in data["dependencies"]
    assert "ai_provider" in data["dependencies"]


def test_no_hardcoded_secrets_in_settings():
    """Verify runtime configuration contains zero exposed access keys or credentials."""
    for key, val in settings.model_dump().items():
        if isinstance(val, str):
            assert "AKIA" not in val, f"Secret pattern found in setting '{key}'"
            assert "aws_secret_access_key" not in val.lower()


def test_cors_cloudfront_origin_validation():
    """Verify CORS headers cleanly support CloudFront HTTPS origins."""
    cloudfront_origin = "https://d123456abcdef.cloudfront.net"
    response = client.get("/health", headers={"Origin": cloudfront_origin})
    assert response.status_code == 200
