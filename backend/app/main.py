"""
FULFILL-X FastAPI Production Server Entrypoint
"""
import time
import uuid
import logging
from contextlib import asynccontextmanager
from typing import Callable

from fastapi import FastAPI, Request, Response, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.api.router import api_router
from app.api.health import get_liveness

# Configure Structured Logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s [%(levelname)s] [fulfill-x-backend] %(message)s",
)
logger = logging.getLogger("fulfill-x")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application Lifespan Event Handler for Graceful Startup & Shutdown
    """
    logger.info(f"Starting FULFILL-X Backend v{settings.APP_VERSION} ({settings.APP_ENV})")
    yield
    logger.info("Initiating FULFILL-X Backend Graceful Shutdown...")
    try:
        from app.realtime.websocket_manager import websocket_manager
        # Close any active WebSocket connections cleanly
        for connection in list(websocket_manager._active_connections.keys()):
            try:
                await connection.close(code=1001, reason="Server shutting down")
            except Exception:
                pass
        websocket_manager._active_connections.clear()
        websocket_manager._session_connections.clear()
    except Exception as e:
        logger.warning(f"Error during WebSocket shutdown cleanup: {e}")
    logger.info("FULFILL-X Backend Shutdown Complete.")


app = FastAPI(
    title="FULFILL-X API",
    description="Agentic Fulfillment Resilience Intelligence System Production API",
    version=settings.APP_VERSION,
    docs_url="/docs" if settings.APP_ENV != "production" else None,
    redoc_url="/redoc" if settings.APP_ENV != "production" else None,
    lifespan=lifespan,
)

# CORS Hardening: Environment-driven origins, no wildcard in production
cors_origins = settings.CORS_ORIGINS
if settings.APP_ENV == "production" and "*" in cors_origins:
    cors_origins = [o for o in cors_origins if o != "*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


# Request Correlation & Structured Logging Middleware
@app.middleware("http")
async def correlation_and_logging_middleware(request: Request, call_next: Callable) -> Response:
    request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
    request.state.request_id = request_id
    
    start_time = time.perf_counter()
    
    # Log incoming request
    logger.info(f"event=request_started request_id={request_id} method={request.method} path={request.url.path}")
    
    try:
        response = await call_next(request)
        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
        
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Application-Version"] = settings.APP_VERSION
        
        logger.info(
            f"event=request_completed request_id={request_id} method={request.method} "
            f"path={request.url.path} status={response.status_code} duration_ms={duration_ms}"
        )
        return response
    except Exception as exc:
        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
        logger.error(
            f"event=request_failed request_id={request_id} method={request.method} "
            f"path={request.url.path} duration_ms={duration_ms} error={str(exc)}"
        )
        raise exc


# Global Exception Handler (Sanitizes stack traces & secrets in production)
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    request_id = getattr(request.state, "request_id", str(uuid.uuid4()))
    logger.error(f"Unhandled Exception request_id={request_id}: {exc}", exc_info=True)
    
    if isinstance(exc, HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail, "request_id": request_id},
        )
        
    error_detail = str(exc) if settings.APP_ENV == "development" else "An unexpected internal server error occurred."
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": error_detail, "request_id": request_id},
    )


# Root Liveness Endpoint for Health Probe Compatibility
@app.get("/health", include_in_schema=False)
def root_liveness():
    return get_liveness()


# Include API Router
app.include_router(api_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.APP_HOST,
        port=settings.APP_PORT,
        reload=(settings.APP_ENV == "development"),
        log_level=settings.LOG_LEVEL.lower(),
    )
