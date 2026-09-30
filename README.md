# C4C Smart Health — Track 03: Smart Health & Supply Chain Resilience

Build with AI: Code for Communities — Second Edition (Google Cloud / Hack2Skill)

Federated AI platform for PHC network: real-time medicine stocks, bed/doctor visibility,
14-day demand forecast + early stock-out warnings + cross-district redistribution.

## Structure
- `frontend/` — Vite + React dashboard (map, PHC detail, redistribution planner)
- `backend/` — FastAPI (`/phcs`, `/forecast`, `/redistribute`, `/alerts`), Gemini server-side only
- `data/` — seeded PHC CSV (realistic sample, data.gov.in-style)
- `docs/` — pitch deck, demo script, submission notes

## Quick start (after scaffold)
```bash
# backend
cd backend && python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # add GEMINI_API_KEY, never commit
uvicorn main:app --reload --port 8000

# frontend
cd frontend && npm install && npm run dev
```

## Submission checklist
- [ ] GitHub public repo, no secrets
- [ ] Deployed link live E2E
- [ ] Demo video 3–5 min
- [ ] Pitch deck 10–12 slides
- [ ] 2–3 line description
