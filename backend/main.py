"""C4C Smart Health API — Track 03.
Real heuristic engine + Gemini narration (server-side, env key, graceful fallback).
"""
import csv
import math
import os
from pathlib import Path
from typing import Optional

import requests
from dotenv import load_dotenv
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

load_dotenv(Path(__file__).resolve().parent / ".env")
load_dotenv()
DATA = Path(__file__).resolve().parent.parent / "data" / "phcs.csv"

app = FastAPI(title="C4C Smart Health API", version="1.0.0")
app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)


def status_for(days: float) -> str:
    if days is None or days < 0:
        return "critical"
    if days < 7:
        return "critical"
    if days < 14:
        return "watch"
    return "healthy"


def load_rows():
    with open(DATA, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def enrich(row: dict) -> dict:
    stock = float(row["stock_units"])
    use = float(row["avg_daily_use"]) or 1.0
    days = round(stock / use, 1)
    return {
        "phc_id": row["phc_id"],
        "phc_name": row["phc_name"],
        "district": row["district"],
        "lat": float(row["lat"]),
        "lng": float(row["lng"]),
        "drug": row["drug"],
        "stock_units": int(float(row["stock_units"])),
        "avg_daily_use": float(row["avg_daily_use"]),
        "days_to_zero": days,
        "status": status_for(days),
        "beds_total": int(row["beds_total"]),
        "beds_free": int(row["beds_free"]),
        "doctors_present": int(row["doctors_present"]),
        "doctors_required": int(row["doctors_required"]),
    }


def gemini_text(prompt: str) -> Optional[str]:
    key = os.getenv("GEMINI_API_KEY", "").strip()
    if not key:
        return None
    model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash").strip() or "gemini-2.5-flash"
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
    try:
        r = requests.post(
            url,
            params={"key": key},
            json={"contents": [{"parts": [{"text": prompt}]}]},
            timeout=25,
        )
        if r.status_code != 200:
            return None
        j = r.json()
        parts = j.get("candidates", [{}])[0].get("content", {}).get("parts", [])
        txt = "".join(p.get("text", "") for p in parts).strip()
        return txt or None
    except Exception:
        return None


@app.get("/health")
def health():
    return {"ok": True, "gemini_configured": bool(os.getenv("GEMINI_API_KEY", "").strip())}


@app.get("/districts")
def districts():
    rows = [enrich(r) for r in load_rows()]
    out = {}
    for r in rows:
        d = out.setdefault(r["district"], {"district": r["district"], "phcs": set(), "critical": 0, "watch": 0, "total": 0})
        d["total"] += 1
        d["phcs"].add(r["phc_id"])
        if r["status"] == "critical":
            d["critical"] += 1
        elif r["status"] == "watch":
            d["watch"] += 1
    res = []
    for d in out.values():
        res.append({"district": d["district"], "phc_count": len(d["phcs"]), "drug_rows": d["total"], "critical": d["critical"], "watch": d["watch"]})
    return {"districts": sorted(res, key=lambda x: x["district"])}


@app.get("/phcs")
def list_phcs(district: Optional[str] = None, drug: Optional[str] = None, status: Optional[str] = None):
    rows = [enrich(r) for r in load_rows()]
    if district:
        rows = [r for r in rows if r["district"].lower() == district.lower()]
    if drug:
        rows = [r for r in rows if r["drug"].lower() == drug.lower()]
    if status:
        rows = [r for r in rows if r["status"] == status]
    return {"count": len(rows), "phcs": rows}


@app.get("/forecast")
def forecast(phc_id: str = Query(...), drug: str = Query(...)):
    rows = [enrich(r) for r in load_rows() if r["phc_id"].lower() == phc_id.lower() and r["drug"].lower() == drug.lower()]
    if not rows:
        return {"error": "PHC/drug not found", "phc_id": phc_id, "drug": drug}
    r = rows[0]
    stock, use = r["stock_units"], r["avg_daily_use"]
    series = []
    for day in range(15):
        # deterministic seasonal bump: weekends +8%
        mult = 1.08 if day % 7 in (5, 6) else 1.0
        remaining = max(0, round(stock - use * mult * day))
        series.append({"day": day, "remaining": remaining})
    days = r["days_to_zero"]
    warn = "Stock-out within 7 days. Act now." if days < 7 else ("Reorder within 2 weeks." if days < 14 else "Stocks healthy for 2+ weeks.")
    prompt = (
        f"You are a district health supply officer in India. PHC {r['phc_name']} ({r['phc_id']}, {r['district']}) "
        f"has {stock} units of {drug}, using {use}/day, {days} days left. Beds free {r['beds_free']}/{r['beds_total']}, "
        f"doctors {r['doctors_present']}/{r['doctors_required']}. Give 3 crisp actions: reorder qty, redistribution hint, "
        f"and patient-care safeguard. Under 90 words. Plain English, add one Hindi line at end."
    )
    ai = gemini_text(prompt)
    if not ai:
        need = max(0, math.ceil(use * 21 - stock))
        ai = (
            f"{r['phc_name']} will exhaust {drug} in ~{days} days at current burn. "
            f"Reorder at least {need} units to cover 21 days plus weekend surge. "
            f"Shift routine refills to nearest surplus PHC until stock lands. "
            f"Reserve remaining doses for emergency and antenatal cases. "
            f"कृपया तुरंत पुनः आदेश दें और निगरानी जारी रखें।"
        )
        ai_source = "heuristic-fallback"
    else:
        ai_source = "gemini"
    return {
        "phc_id": r["phc_id"], "phc_name": r["phc_name"], "district": r["district"],
        "drug": r["drug"], "stock_units": stock, "avg_daily_use": use,
        "days_to_zero": days, "status": r["status"], "warning": warn,
        "series": series, "advice": ai, "advice_source": ai_source,
        "beds": {"total": r["beds_total"], "free": r["beds_free"]},
        "doctors": {"present": r["doctors_present"], "required": r["doctors_required"]},
    }


@app.get("/redistribute")
def redistribute(drug: str = Query(...)):
    rows = [enrich(r) for r in load_rows() if r["drug"].lower() == drug.lower()]
    if not rows:
        return {"error": "drug not found", "drug": drug, "moves": []}
    # collapse per PHC (one row per PHC per drug already)
    deficit = sorted([r for r in rows if r["days_to_zero"] < 7], key=lambda x: x["days_to_zero"])
    surplus = sorted([r for r in rows if r["days_to_zero"] > 21], key=lambda x: -x["days_to_zero"])
    moves = []
    for d in deficit:
        need = math.ceil(d["avg_daily_use"] * 14 - d["stock_units"])
        need = max(need, 0)
        if need <= 0:
            continue
        for s in surplus:
            avail = math.floor(s["stock_units"] - s["avg_daily_use"] * 21)
            if avail <= 0:
                continue
            qty = min(need, avail)
            # rough km from lat/lng
            km = round(math.hypot(s["lat"] - d["lat"], s["lng"] - d["lng"]) * 111, 1)
            moves.append({
                "from_id": s["phc_id"], "from_name": s["phc_name"],
                "to_id": d["phc_id"], "to_name": d["phc_name"],
                "drug": drug, "qty": qty, "km": km,
                "reason": f"{s['phc_id']} holds {s['days_to_zero']} days cover; {d['phc_id']} has {d['days_to_zero']} days left.",
            })
            s["stock_units"] -= qty
            need -= qty
            if need <= 0:
                break
    prompt = (
        f"District redistribution for {drug} across {len(rows)} PHCs. {len(deficit)} critical, {len(surplus)} surplus. "
        f"Planned {len(moves)} moves: {str(moves[:4])}. Explain in 70 words why this keeps care running and what the collector "
        f"should verify on arrival (batch, cold chain, register). Plain English."
    )
    ai = gemini_text(prompt)
    if not ai:
        ai = (
            f"Move {drug} from {len(surplus)} surplus PHCs to {len(deficit)} critical PHCs before stock-out. "
            f"{len(moves)} transfers cover ~14 days of burn and cut emergency referrals. "
            f"Verify batch number, expiry, and stock register signature on handover."
        )
        src = "heuristic-fallback"
    else:
        src = "gemini"
    return {"drug": drug, "critical": len(deficit), "surplus": len(surplus), "moves": moves, "rationale": ai, "rationale_source": src}


@app.get("/alerts")
def alerts():
    rows = [enrich(r) for r in load_rows()]
    out = []
    for r in rows:
        if r["status"] == "critical":
            out.append({"level": "critical", "type": "stock-out", "text": f"{r['phc_id']} {r['phc_name']} — {r['drug']} {r['days_to_zero']} days left", **{k: r[k] for k in ("phc_id", "phc_name", "district", "drug", "days_to_zero")}})
        if r["beds_free"] == 0:
            out.append({"level": "critical", "type": "beds-full", "text": f"{r['phc_id']} beds full ({r['beds_total']}/{r['beds_total']} occupied)", "phc_id": r["phc_id"], "phc_name": r["phc_name"], "district": r["district"], "drug": r["drug"], "days_to_zero": r["days_to_zero"]})
        if r["doctors_present"] == 0:
            out.append({"level": "critical", "type": "no-doctor", "text": f"{r['phc_id']} no doctor present today", "phc_id": r["phc_id"], "phc_name": r["phc_name"], "district": r["district"], "drug": r["drug"], "days_to_zero": r["days_to_zero"]})
    # de-dupe bed/doctor repeats per PHC (keep first per type per PHC)
    seen = set()
    uniq = []
    for a in out:
        key = (a["type"], a["phc_id"])
        if key in seen and a["type"] != "stock-out":
            continue
        seen.add(key)
        uniq.append(a)
    order = {"critical": 0}
    uniq.sort(key=lambda x: (order.get(x["level"], 1), x["phc_id"]))
    return {"count": len(uniq), "alerts": uniq[:60]}
