# FULFILL-X — DEVELOPER ONBOARDING GUIDE

> **Quickstart Guide for New Developers**

---

## 1. Local Environment Setup

```bash
# Clone Repository
git clone https://github.com/fulfillx/fulfillx-core.git
cd FULFILL-X

# Backend Setup (Terminal 1)
cd backend
python -m venv .venv
.venv\Scripts\activate   # Windows PowerShell
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend Setup (Terminal 2)
cd frontend
npm install
npm run dev
```

---

## 2. Key Developer Locations

- **App Router**: `frontend/src/App.tsx`
- **FastAPI Endpoints**: `backend/app/api/`
- **Specialist Agents**: `backend/app/agents/`
- **Monte Carlo Engine**: `backend/app/simulation/monte_carlo.py`
- **Pytest Test Suite**: `backend/tests/` (`pytest backend/tests/`)
- **Frontend Build Command**: `npm run build --prefix frontend`
