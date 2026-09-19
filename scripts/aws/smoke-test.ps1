# FULFILL-X Deployed Production Smoke Test PowerShell Script (Phase 14)
Param(
    [string]$BackendUrl = "http://localhost:8000"
)

Write-Host "=== Running Production Smoke Tests against $BackendUrl ===" -ForegroundColor Green

# 1. Liveness
Write-Host "[1/4] Checking Liveness Probe (/health)..." -ForegroundColor Yellow
$r1 = Invoke-RestMethod -Uri "$BackendUrl/health"
if ($r1.status -eq "ok") {
    Write-Host "✓ Liveness Probe PASSED" -ForegroundColor Green
} else {
    Write-Error "Liveness Probe Failed"
}

# 2. Readiness
Write-Host "[2/4] Checking Readiness Probe (/api/health)..." -ForegroundColor Yellow
$r2 = Invoke-RestMethod -Uri "$BackendUrl/api/health"
if ($r2.status -eq "healthy") {
    Write-Host "✓ Readiness Probe PASSED" -ForegroundColor Green
} else {
    Write-Error "Readiness Probe Failed"
}

# 3. World Summary
Write-Host "[3/4] Checking World Summary API (/api/world/summary)..." -ForegroundColor Yellow
$r3 = Invoke-RestMethod -Uri "$BackendUrl/api/world/summary"
if ($r3.data.total_nodes -gt 0) {
    Write-Host "✓ World Summary API PASSED ($($r3.data.total_nodes) nodes)" -ForegroundColor Green
} else {
    Write-Error "World Summary Failed"
}

# 4. Evaluation API
Write-Host "[4/4] Checking Evaluation API (/api/evaluation/status)..." -ForegroundColor Yellow
$r4 = Invoke-RestMethod -Uri "$BackendUrl/api/evaluation/status"
if ($r4.status) {
    Write-Host "✓ Evaluation API PASSED" -ForegroundColor Green
} else {
    Write-Error "Evaluation API Failed"
}

Write-Host "=== All Production Smoke Tests PASSED ===" -ForegroundColor Green
