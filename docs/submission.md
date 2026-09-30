# Submission notes — Track 03 Smart Health & Supply Chain Resilience

## 2-line description
Aarogya Setu Grid gives every district a live view of PHC medicine stocks with 14-day stock-out
forecasts and AI-planned redistribution, so collectors move drugs before shelves go empty.

## Package
- Source code: https://github.com/Manpreet113/c4c-smart-health (public, no secrets)
- Deployed frontend: https://c4c-smart-health.vercel.app
- Deployed backend: https://c4c-smart-health.onrender.com
- Demo video (3–5 min, YouTube unlisted): _paste link here_
- Pitch deck (10–12 slides, PDF link): _paste link here_ — full text in `docs/pitch-deck.md`
- Contact: build-with-ai-india@googlegroups.com · Registration ends 30 Sep 2026 18:29 UTC

## Run
Backend: `cd backend && uv run --with fastapi --with uvicorn --with requests --with python-dotenv uvicorn main:app --port 8000`
Frontend: `cd frontend && npm install && npm run dev` (env `VITE_API_BASE=http://localhost:8000`)
