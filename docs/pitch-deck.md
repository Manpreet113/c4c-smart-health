# Pitch deck — Aarogya Setu Grid (Track 03) — copy-paste content, 11 slides

## Slide 1 — Title
**Aarogya Setu Grid: every PHC stock-out, seen 14 days early.**
Track 03 · Smart Health & Supply Chain Resilience · Code for Communities 2.0
One line: a federated AI view of medicines, beds, and doctors across 30 PHCs in 3 districts.

## Slide 2 — Problem (real, on the ground)
- A district collector cannot see, in real time, which PHCs will run out of which drug.
- Registers live on paper or isolated spreadsheets. By the time a stock-out is reported, patients are already referred away.
- In our 30-PHC sample: **40 critical drug rows** (under 7 days cover), PHCs with zero free beds, PHCs with no doctor present — all invisible at once.
- Consequence: emergency referrals, wasted trips for patients, expired surplus sitting 50 km away from someone who needs it.

## Slide 3 — Who it serves
- **District collector / CMHO**: one queue of what needs action today.
- **PHC medical officer**: forecast + plain-English reorder advice, including a Hindi line.
- **Patients**: fewer “no stock, go to district hospital” days. ORS, Paracetamol, Amoxicillin, Insulin stay on shelves.

## Slide 4 — Solution (3 views, one flow)
1. **District overview** — per-district critical/watch counts + live dot-map of all 30 PHCs.
2. **Stocks + Forecast** — every PHC × drug with days-to-zero; click any row for a 14-day burn chart and officer advice.
3. **Redistribution planner + Alerts** — surplus-to-critical transfer plan with km + rationale; collector queue of stock-outs, full beds, absent doctors.

## Slide 5 — Live demo path (what judges click)
- Open overview: 4 critical ORS dots ringed on the map.
- Stocks: filter Bharatpur × ORS → PHC004 Deeg Road, 800 units, 8.0 days left, beds 0/18.
- Forecast: chart hits zero on day 8; Gemini advises reorder 2,000 units + divert stable patients.
- Planner: 6 ORS moves, e.g. **928 units PHC007 Roopwas → PHC024 Mahwa (52.7 km)**.
- Alerts: 49 flags, stock-outs first.

## Slide 6 — AI approach (mandatory Google AI, doing real work)
- **Gemini 2.5-flash, server-side**: forecast narration (reorder qty + redistribution hint + care safeguard, EN + Hindi line) and redistribution rationale (why these moves keep care running, what to verify on handover).
- **Deterministic engine underneath**: days-to-zero = stock ÷ burn with weekend +8% surge; surplus (>21 days) covers critical (<7 days), nearest-first to protect cold chain.
- **Graceful fallback**: built-in protocol text if the key is ever missing — demo never blanks.
- Proof in UI: every advice box labels its source (`gemini` vs `heuristic-fallback`).

## Slide 7 — Data (real, realistic, honest)
- `data/phcs.csv`: **120 rows = 30 PHCs × 4 essential drugs** (ORS, Paracetamol, Amoxicillin, Insulin), 3 districts, lat/lng, beds, doctors.
- Shape mirrors government registers (e-Aushadhi style): stock, avg daily use, beds free/total, doctors present/required.
- Clearly labeled sample; production plugs into the same columns from any state HMIS.

## Slide 8 — Impact (scale of benefit)
- Covers **30 PHCs, ~120 drug lines, 49 live alerts** in one district cluster tonight.
- ORS planner alone: **6 transfers moving ~3,000 units**, each covering ~14 days of burn at receiving PHCs.
- Fewer emergency referrals, less expiry waste, Hindi-line advice usable by every officer, not just English-speaking ones.

## Slide 9 — Deployability (pilot in weeks, not years)
- Any district exports the same 12-column CSV → dashboard lights up the same day. No retraining per site.
- Stack: FastAPI on Cloud Run + static frontend on Vercel; registers sync nightly, forecast recomputes on read.
- Handover artifact is already bureaucratic: each move prints as an indent (from → to, qty, km, batch/register check).

## Slide 10 — Scales across India (and federates)
- Same register format works for every state; one Gemini prompt pack reused per district.
- Designed federated: districts share the forecast model, states share’indistrict surplus patterns, like the challenge asks.
- Multilingual by construction: EN advice + Hindi line today, Translation API + voice (Speech-to-Text) next for ANM workers.

## Slide 11 — Team + ask
- Solo builder, working prototype live tonight: repo + deployed link + 3-min video.
- Ask: pilot in one district with real HMIS export; success metric = zero unplanned stock-out days for 4 essential drugs over 90 days.
- Contact + repo + demo links.
