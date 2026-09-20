# Contributing to FULFILL-X

Thank you for your interest in contributing to FULFILL-X!

---

## 1. Development Setup

### Backend (Python + FastAPI)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Or .venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend (React + Vite + TypeScript)

```bash
cd frontend
npm install
npm run dev
```

---

## 2. Branch & Development Workflow

- **Main Branch (`main`)**: Authoritative source-of-truth branch.
- **Feature Branches**: Create topic branches from `main` (e.g. `feat/gnn-attention`, `fix/websocket-reconnect`).
- **Pull Requests**: Open PRs targeting `main`. Ensure all tests pass prior to review.

---

## 3. Core Operating Rules

1. **No Hardcoded Credentials**: Never commit secrets, API keys, or `.env` files.
2. **State Mutation Safety**: Never mutate domain state directly without graph snapshot immutability validation and safety checks (`assert world_before == world_after`).
3. **API & Schema Sync**: Any change to Pydantic backend models requires corresponding updates to frontend TypeScript interfaces (`frontend/src/types/`) and API client handlers.
4. **Mandatory Testing**: Run the backend test suite before submitting PRs:
   ```bash
   pytest backend/tests/
   ```
5. **Frontend Build Check**: Ensure TypeScript compilation and production packaging succeed cleanly:
   ```bash
   npm run build --prefix frontend
   ```
6. **Documentation Integrity**: Update relevant documentation when adding endpoints or altering architectural interfaces.

---

## 4. Code Style & Standards

- **Python**: PEP 8 style, strict type hints on API routes and service methods, clean docstrings.
- **TypeScript / React**: Functional components, strict type definitions, standard Tailwind CSS classes.
