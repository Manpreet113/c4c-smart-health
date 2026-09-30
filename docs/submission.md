# Submission notes — Track 03 Smart Health & Supply Chain Resilience

## 2-line description
Aarogya Setu Grid gives every district a live view of PHC medicine stocks with 14-day stock-out
forecasts and AI-planned redistribution, so collectors move drugs before shelves go empty.

## Package
- Source code: public GitHub repo (this folder, no secrets — key lives in `backend/.env`, ignored)
- Demo video (3–5 min): 0:00 problem → 0:40 district overview → 1:30 forecast drill (PHC004 ORS)
  → 2:30 planner moves → 3:20 alerts → 3:50 India-scale + Gemini proof
- Pitch deck (10–12): problem / users / solution / live flow / AI approach / data / forecast math /
  planner logic / deployability / India scale / risks / ask
- Deployed link: frontend on Vercel/Netlify with `VITE_API_BASE` pointing to Cloud Run backend.
  Offline sample fallback keeps the link demoable even if the API sleeps.
- Contact: build-with-ai-india@googlegroups.com · Registration ends 30 Sep 2026 18:29 UTC

## Run
Backend: `cd backend && uv run --with fastapi --with uvicorn --with requests --with python-dotenv uvicorn main:app --port 8000`
Frontend: `cd frontend && npm install && npm run dev` (env `VITE_API_BASE=http://localhost:8000`)
