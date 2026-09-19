#!/usr/bin/env bash
# FULFILL-X Deployed Production Smoke Test Script (Phase 14)

set -e

BACKEND_URL="${1:-http://localhost:8000}"

echo "=== Running Production Smoke Tests against $BACKEND_URL ==="

# 1. Test Liveness Probe
echo "[1/4] Checking Liveness Probe (/health)..."
curl -f -s "$BACKEND_URL/health" | grep '"status":"ok"' > /dev/null
echo "✓ Liveness Probe PASSED"

# 2. Test Readiness Probe
echo "[2/4] Checking Readiness Probe (/api/health)..."
curl -f -s "$BACKEND_URL/api/health" | grep '"status":"healthy"' > /dev/null
echo "✓ Readiness Probe PASSED"

# 3. Test World Summary API
echo "[3/4] Checking World Summary API (/api/world/summary)..."
curl -f -s "$BACKEND_URL/api/world/summary" | grep '"total_nodes":' > /dev/null
echo "✓ World Summary API PASSED"

# 4. Test Evaluation API
echo "[4/4] Checking Evaluation API (/api/evaluation/status)..."
curl -f -s "$BACKEND_URL/api/evaluation/status" | grep '"status":' > /dev/null
echo "✓ Evaluation API PASSED"

echo "=== All Production Smoke Tests PASSED ==="
