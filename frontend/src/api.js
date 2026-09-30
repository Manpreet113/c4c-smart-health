import { SAMPLE_ROWS, daysToZero, statusFor } from './mock';

const BASE = (import.meta.env.VITE_API_BASE || 'http://localhost:8000').replace(/\/$/, '');

async function get(path) {
  const r = await fetch(`${BASE}${path}`);
  if (!r.ok) throw new Error(`API ${r.status}`);
  return r.json();
}

function seriesFor(stock, use) {
  const out = [];
  for (let day = 0; day < 15; day += 1) {
    const mult = day % 7 === 5 || day % 7 === 6 ? 1.08 : 1.0;
    out.push({ day, remaining: Math.max(0, Math.round(stock - use * mult * day)) });
  }
  return out;
}

function fallbackForecast(phcId, drug) {
  const row = SAMPLE_ROWS.find((x) => x.phc_id === phcId && x.drug === drug) || SAMPLE_ROWS[0];
  const d = daysToZero(row);
  const need = Math.max(0, Math.ceil(row.avg_daily_use * 21 - row.stock_units));
  return {
    phc_id: row.phc_id, phc_name: row.phc_name, district: row.district, drug: row.drug,
    stock_units: row.stock_units, avg_daily_use: row.avg_daily_use, days_to_zero: d,
    status: statusFor(d), warning: d < 7 ? 'Stock-out within 7 days. Act now.' : 'Reorder within 2 weeks.',
    series: seriesFor(row.stock_units, row.avg_daily_use),
    advice: `${row.phc_name} will exhaust ${row.drug} in about ${d} days. Reorder at least ${need} units for 21-day cover. Shift refills to the nearest surplus PHC until stock lands.`,
    advice_source: 'offline-sample',
    beds: { total: row.beds_total, free: row.beds_free },
    doctors: { present: row.doctors_present, required: row.doctors_required },
  };
}

function fallbackRedistribute(drug) {
  const rows = SAMPLE_ROWS.filter((x) => x.drug === drug);
  const crit = rows.filter((x) => daysToZero(x) < 14);
  const surp = rows.filter((x) => daysToZero(x) > 21);
  const moves = [];
  crit.slice(0, 2).forEach((dRow, i) => {
    const sRow = surp[i % Math.max(surp.length, 1)];
    if (!sRow) return;
    moves.push({
      from_id: sRow.phc_id, from_name: sRow.phc_name, to_id: dRow.phc_id, to_name: dRow.phc_name,
      drug, qty: 400, km: 18.4, reason: `${sRow.phc_id} holds cover; ${dRow.phc_id} runs low.`,
    });
  });
  return { drug, critical: crit.length, surplus: surp.length, moves, rationale: 'Offline sample plan. Start the backend for the full 30-PHC computation.', rationale_source: 'offline-sample' };
}

export const api = {
  async districts() {
    try { return await get('/districts'); } catch {
      return { districts: [
        { district: 'Bharatpur', phc_count: 10, drug_rows: 40, critical: 14, watch: 12 },
        { district: 'Alwar', phc_count: 10, drug_rows: 40, critical: 13, watch: 15 },
        { district: 'Dausa', phc_count: 10, drug_rows: 40, critical: 13, watch: 16 },
      ]};
    }
  },
  async phcs(params) {
    const q = new URLSearchParams(params).toString();
    try { return await get(`/phcs?${q}`); } catch {
      return { count: SAMPLE_ROWS.length, phcs: SAMPLE_ROWS.map((r) => ({ ...r, days_to_zero: daysToZero(r), status: statusFor(daysToZero(r)) })) };
    }
  },
  async forecast(phcId, drug) {
    try { return await get(`/forecast?phc_id=${encodeURIComponent(phcId)}&drug=${encodeURIComponent(drug)}`); } catch {
      return fallbackForecast(phcId, drug);
    }
  },
  async redistribute(drug) {
    try { return await get(`/redistribute?drug=${encodeURIComponent(drug)}`); } catch {
      return fallbackRedistribute(drug);
    }
  },
  async alerts() {
    try { return await get('/alerts'); } catch {
      return { count: 3, alerts: [
        { level: 'critical', type: 'stock-out', text: 'PHC024 Mahwa PHC — ORS 4.9 days left', phc_id: 'PHC024', district: 'Dausa', drug: 'ORS', days_to_zero: 4.9 },
        { level: 'critical', type: 'beds-full', text: 'PHC024 beds full (13/13 occupied)', phc_id: 'PHC024', district: 'Dausa', drug: 'ORS', days_to_zero: 4.9 },
        { level: 'critical', type: 'no-doctor', text: 'PHC024 no doctor present today', phc_id: 'PHC024', district: 'Dausa', drug: 'ORS', days_to_zero: 4.9 },
      ]};
    }
  },
};
