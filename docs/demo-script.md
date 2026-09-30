# Demo narration script — Aarogya Setu Grid (3:30, 1280x720, zoom 125%)

Pre-flight: open `https://c4c-smart-health.onrender.com/health` once (wakes Render),
confirm Vercel deploy finished on latest `main`, 의사 browser zoom 125%.
Hit record. Read calmly; pauses are already timed.

## 0:00–0:25 — Hero + live map (stay on hero)
“A district collector in Rajasthan can’t see which of their thirty clinics will run
out of which drug — until patients are already turned away. This is Aarogya Setu
Grid, our Track 03 build. On the right, every PHC’s ORS cover right now: green
healthy, amber watch, red ringed critical. Four clinics need transfers this week.”

## 0:25–0:55 — District overview (scroll to #overview)
“Three districts, one hundred twenty drug lines. Alwar has thirteen critical rows,
Bharatpur fourteen, Dausa thirteen. Critical means under seven days of cover.”

## 0:55–1:40 — Stocks (scroll to #stocks)
“Every row is a real register line — stock, daily burn, days to zero, beds, doctors.
Watch me filter: I type Deeg, and there’s Deeg Road PHC. Clearing that — now I click
Nagar PHC, critical on ORS, zero beds free, no doctor today — and it loads its
forecast below.”

## 1:40–2:25 — Forecast + AI advice (scroll to #forecast)
“Nagar’s burn chart hits zero on day seven — the red dashed stock-out marker. Days
to zero, stock, burn, beds, doctors, all computed live. And the advice box is Gemini
3.1 Flash Lite, running on our backend: reorder quantity, where to pull surplus from,
how to protect patients — in English and Hindi. Each box labels its source, so you
can always tell model output from protocol.”

## 2:25–3:00 — Planner (scroll to #planner)
“This is the money view. Four critical, eighteen surplus, six ORS moves. Nine hundred
twenty-eight units from Roopwas to Mahwa, fifty-two kilometres — nearest first, so
cold chain holds. Flip to Amoxicillin and there’s no safe surplus — the app says
escalate to the district warehouse instead of inventing transfers.”

## 3:00–3:20 — Alerts + scale (scroll to #alerts, then scale strip)
“Forty-nine flags in one collector queue — stock-outs first, then full beds, then
absent doctors. And it scales: any district exports the same twelve-column CSV, one
prompt pack serves every state.”

## 3:20–3:30 — Close (scroll to top, hold on hero)
“Aarogya Setu Grid, Track 03. One district, ninety days, zero unplanned stock-out
days. Repo, backend, and this link are in the submission.”
Stop recording. Upload unlisted to YouTube.
Title: `Aarogya Setu Grid — Code for Communities 2.0 (Track 03)`.
