# FULFILL-X Backend Production Dockerfile
FROM python:3.12-slim AS base

# Create non-root user and group
RUN groupadd -g 10001 fulfillx && \
    useradd -u 10001 -g fulfillx -s /bin/bash -m fulfillx

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application source
COPY app ./app

# Set ownership to non-root user
RUN chown -R fulfillx:fulfillx /app

# Switch to non-root user
USER fulfillx

# Expose backend port
EXPOSE 8000

# Set environment defaults
ENV PYTHONPATH=/app \
    APP_ENV=production \
    APP_HOST=0.0.0.0 \
    APP_PORT=8000 \
    PYTHONUNBUFFERED=1

# Container Healthcheck (Liveness Probe)
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run Uvicorn ASGI production server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
