"""
FULFILL-X Backend Production Configuration
"""
import os
from typing import List
from pydantic import BaseModel


class Settings(BaseModel):
    APP_ENV: str = os.getenv("APP_ENV", "development")
    APP_HOST: str = os.getenv("APP_HOST", "0.0.0.0")
    APP_PORT: int = int(os.getenv("APP_PORT", "8000"))
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    CORS_ORIGINS: List[str] = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000,http://localhost:80,http://localhost",
        ).split(",")
        if origin.strip()
    ]
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "mock")
    AI_FALLBACK_PROVIDER: str = os.getenv("AI_FALLBACK_PROVIDER", "mock")
    WEBSOCKET_ENABLED: bool = os.getenv("WEBSOCKET_ENABLED", "true").lower() in ("true", "1", "t")
    EVALUATION_ENABLED: bool = os.getenv("EVALUATION_ENABLED", "true").lower() in ("true", "1", "t")
    API_PREFIX: str = os.getenv("API_PREFIX", "/api")
    APP_VERSION: str = os.getenv("APP_VERSION", "0.13.0")
    
    # Security & limits
    WS_MAX_CONNECTIONS_PER_SESSION: int = int(os.getenv("WS_MAX_CONNECTIONS_PER_SESSION", "50"))
    MAX_REQUEST_BODY_BYTES: int = int(os.getenv("MAX_REQUEST_BODY_BYTES", "10485760"))  # 10MB


settings = Settings()
