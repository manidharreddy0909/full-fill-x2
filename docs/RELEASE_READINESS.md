# FULFILL-X — RELEASE READINESS & SUBMISSION GUIDE

> **Release Version**: v1.0.0-release  
> **Baseline Commit**: `9563a7bf762c27a8f3a900fe2d016aa138d5b2e6`  
> **Target Audience**: Judges, Technical Reviewers, Evaluators, Developers  

---

## 1. Executive Summary

FULFILL-X is an **Agentic Fulfillment Resilience Intelligence** platform designed for autonomous supply chain risk detection, multi-agent deliberation, formal plan verification, digital twin simulation, and deliberate learning.

---

## 2. Quick Start (Fresh Environment Setup)

### Prerequisites
- **Python**: 3.11 or 3.12
- **Node.js**: v18+ or v20+
- **Git**: Installed

### Step 1: Clone Repository
```bash
git clone https://github.com/fulfillx/fulfillx-core.git
cd FULFILL-X
```

### Step 2: Launch Backend
```bash
# Navigate to backend directory
cd backend

# Create & activate virtual environment
python -m venv .venv
# Windows PowerShell:
.venv\Scripts\Activate.ps1
# macOS / Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI application
uvicorn app.main:app --reload --port 8000
```
*Health Check*: Open http://localhost:8000/health in your browser. Expected output: `{"status": "ok", ...}`

### Step 3: Launch Frontend
```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start Vite development server
npm run dev
```
*Application Access*: Open http://localhost:5173 in your browser.

---

## 3. Canonical Demo Execution (DEMO-05)

To run the canonical **DEMO-05 (Seed=42) Full Resilience Challenge**:

1. Open http://localhost:5173/decision/cockpit.
2. Select **Seed: 42** and **Preset: Healthy Baseline**.
3. Click **"INITIALIZE BASELINE PIPELINE"**.
4. Observe the full 13-stage resilience workflow:
   `OBSERVE → DETECT → UNDERSTAND → AGENTS → ADVERSARY → DECISION → VERIFICATION → SIMULATION → AUTHORIZATION → OBSERVABILITY → LEARNING → GOVERNANCE → EVALUATION`.

---

## 4. Test Verification Commands

### Run Backend Tests (249/249 Passed)
```bash
pytest backend/tests/
```

### Run Frontend Production Build (0 TS Errors)
```bash
npm run build --prefix frontend
```

---

## 5. Architectural & Free-First Compliance

- **Tier A (Free/Local)**: 100% executable offline using local Python, R3F WebGL, and Mock AI adapters.
- **Tier B (Configured Cloud)**: AWS Bedrock & ECS manifests present in code base for cloud deployment.
- **Data Authenticity**: All simulation outcomes are fully deterministic and reproducible.
