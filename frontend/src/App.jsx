import { useEffect, useMemo, useState } from 'react';
import { Ambulance, BellRinging, Crosshair, Package, Pulse, Swap } from '@phosphor-icons/react';
import { api } from './api';
import './styles.css';

const DRUGS = ['ORS', 'Paracetamol', 'Amoxicillin', 'Insulin'];
const DISTRICTS = ['Bharatpur', 'Alwar', 'Dausa'];

function useReveal(deps = []) {
  useEffect(() => {
    const els = document.querySelectorAll('.rv:not(.on)');
    if (!('IntersectionObserver' in window)) {
      els.forEach((e) => e.classList.add('on'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => { if (en.isIntersecting) en.target.classList.add('on'); }),
      { threshold: 0.12 },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

function StatusTag({ s }) {
  const cls = s === 'critical' ? 't-red' : s === 'watch' ? 't-yellow' : 't-green';
  const label = s === 'critical' ? 'Critical' : s === 'watch' ? 'Watch' : 'Healthy';
  return <span className={`tag ${cls}`}>{label}</span>;
}

function Chart({ series }) {
  const w = 560; const h = 160; const pad = 12;
  const max = Math.max(1, ...series.map((p) => p.remaining));
  const pts = series.map((p, i) => {
    const x = pad + (i / Math.max(series.length - 1, 1)) * (w - pad * 2);
    const y = h - pad - (p.remaining / max) * (h - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const zeroY = h - pad;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="150" role="img" aria-label="14-day stock forecast">
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1={pad} x2={w - pad} y1={h * f} y2={h * f} stroke="#EAEAEA" strokeWidth="1" />
      ))}
      <line x1={pad} x2={w - pad} y1={zeroY} y2={zeroY} stroke="#111111" strokeWidth="1" opacity="0.35" />
      <polyline points={pts} fill="none" stroke="#111111" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {series.filter((p) => p.day % 2 === 0).map((p) => {
        const i = p.day;
        const x = pad + (i / Math.max(series.length - 1, 1)) * (w - pad * 2);
        const y = h - pad - (p.remaining / max) * (h - pad * 2);
        return <circle key={p.day} cx={x} cy={y} r="3.5" fill="#fff" stroke="#111" strokeWidth="2" />;
      })}
    </svg>
  );
}

export default function App() {
  const [districts, setDistricts] = useState(null);
  const [dErr, setDErr] = useState('');
  const [fDistrict, setFDistrict] = useState('Bharatpur');
  const [fDrug, setFDrug] = useState('ORS');
  const [query, setQuery] = useState('');
  const [rows, setRows] = useState(null);
  const [rErr, setRErr] = useState('');
  const [selPhc, setSelPhc] = useState('PHC004');
  const [selDrug, setSelDrug] = useState('ORS');
  const [fc, setFc] = useState(null);
  const [fLoading, setFLoading] = useState(false);
  const [planDrug, setPlanDrug] = useState('ORS');
  const [plan, setPlan] = useState(null);
  const [alerts, setAlerts] = useState(null);

  useEffect(() => {
    api.districts().then(setDistricts).catch(() => setDErr('District summary unavailable. Check backend.'));
    api.alerts().then(setAlerts).catch(() => {});
  }, []);

  useEffect(() => {
    setRows(null); setRErr('');
    api.phcs({ district: fDistrict, drug: fDrug })
      .then((j) => setRows(j.phcs || []))
      .catch(() => setRErr('Stock table failed to load. Verify the API base.'));
  }, [fDistrict, fDrug]);

  useEffect(() => {
    setFLoading(true);
    api.forecast(selPhc, selDrug).then((j) => { setFc(j); setFLoading(false); }).catch(() => setFLoading(false));
  }, [selPhc, selDrug]);

  useEffect(() => {
    api.redistribute(planDrug).then(setPlan).catch(() => {});
  }, [planDrug]);

  useReveal([rows, fc, plan, alerts, districts]);

  const filtered = useMemo(() => {
    if (!rows) return [];
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => `${r.phc_id} ${r.phc_name}`.toLowerCase().includes(q));
  }, [rows, query]);

  const totals = useMemo(() => {
    if (!districts) return { phc: 30, crit: 0 };
    const crit = districts.districts.reduce((a, d) => a + d.critical, 0);
    return { phc: 30, crit };
  }, [districts]);

  return (
    <div>
      <header className="nav">
        <div className="nav-inner">
          <span className="brand"><span className="brand-mark">AS</span> Aarogya Setu Grid</span>
          <nav className="nav-links" aria-label="Sections">
            <a href="#overview">Overview</a>
            <a href="#stocks">Stocks</a>
            <a href="#forecast">Forecast</a>
            <a href="#planner">Planner</a>
            <a href="#alerts">Alerts</a>
          </nav>
          <a className="nav-cta" href="#planner">Open planner</a>
        </div>
      </header>

      <main className="wrap">
        <section className="hero rv" style={{ '--i': 0 }}>
          <span className="eyebrow">Track 03 · Smart Health · 30 PHCs live</span>
          <h1>Every PHC stock-out, seen fourteen days early.</h1>
          <p>One federated view of medicines, beds, and doctors across three districts, with AI forecasts and transfer plans.</p>
          <div className="hero-row">
            <a className="btn btn-dark" href="#forecast"><Crosshair size={16} weight="bold" /> View forecast</a>
            <a className="btn" href="#stocks"><Package size={16} weight="bold" /> Browse stocks</a>
          </div>
          <p className="meta" style={{ marginTop: 14 }}>Prototype · Gemini narration on server · offline sample fallback · {totals.phc} PHCs · {totals.crit} critical rows</p>
        </section>

        <section id="overview" className="section">
          <h2>District overview</h2>
          <p className="sub">Critical means fewer than 7 days of cover. Watch means 7 to 14 days. Counts update per drug slice on the backend.</p>
          {!districts && !dErr && (
            <div className="bento"><div className="card rv"><div className="skel" /><div className="skel" /><div className="skel" /></div></div>
          )}
          {dErr && <div className="error">{dErr}</div>}
          {districts && (
            <div className="bento">
              {districts.districts.map((d, i) => (
                <div className="card rv" style={{ '--i': i }} key={d.district}>
                  <h3>{d.district}</h3>
                  <div className="big">{d.critical}</div>
                  <div><span className="tag t-red">Critical rows</span> <span className="tag t-yellow">{d.watch} watch</span></div>
                  <p className="meta" style={{ marginTop: 10 }}>{d.phc_count} PHCs · {d.drug_rows} drug rows tracked</p>
                </div>
              ))}
              <div className="card rv bento-wide" style={{ '--i': 3 }}>
                <h3><Pulse size={16} weight="bold" style={{ verticalAlign: -2 }} /> How it stays live</h3>
                <p className="meta">PHC registers sync nightly. Forecast recomputes on read. Collector verifies batch and register on every handover.</p>
                <p style={{ marginTop: 10 }}><span className="tag t-blue">Federated</span> <span className="tag t-gray">Hindi + English</span></p>
              </div>
            </div>
          )}
        </section>

        <section id="stocks" className="section">
          <h2>Stocks by PHC</h2>
          <p className="sub">Filter by district and drug, then search by name. Select a row to load its forecast below.</p>
          <div className="controls">
            <label className="f">District
              <select value={fDistrict} onChange={(e) => setFDistrict(e.target.value)}>
                {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </label>
            <label className="f">Drug
              <select value={fDrug} onChange={(e) => setFDrug(e.target.value)}>
                {DRUGS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </label>
            <label className="f">Search
              <input type="search" placeholder="e.g. Deeg or PHC004" value={query} onChange={(e) => setQuery(e.target.value)} />
            </label>
          </div>
          {!rows && !rErr && <div className="card rv"><div className="skel" /><div className="skel" /><div className="skel" /></div>}
          {rErr && <div className="error">{rErr}</div>}
          {rows && filtered.length === 0 && (
            <div className="card rv"><strong>No PHCs match.</strong><p className="meta">Clear the search or switch district. Registers sync nightly.</p></div>
          )}
          {rows && filtered.length > 0 && (
            <div className="table-wrap rv">
              <table>
                <thead><tr><th>PHC</th><th>Stock</th><th>Burn / day</th><th>Days left</th><th>Status</th><th>Beds free</th><th>Doctors</th></tr></thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={`${r.phc_id}-${r.drug}`} onClick={() => { setSelPhc(r.phc_id); setSelDrug(r.drug); document.querySelector('#forecast')?.scrollIntoView({ behavior: 'smooth' }); }} style={{ cursor: 'pointer' }}>
                      <td><strong>{r.phc_id}</strong><br /><span className="meta">{r.phc_name}</span></td>
                      <td className="num">{r.stock_units}</td>
                      <td className="num">{r.avg_daily_use}</td>
                      <td className="num">{r.days_to_zero}</td>
                      <td><StatusTag s={r.status} /></td>
                      <td className="num">{r.beds_free}/{r.beds_total}</td>
                      <td className="num">{r.doctors_present}/{r.doctors_required}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section id="forecast" className="section">
          <h2>Forecast and advice</h2>
          <p className="sub">Fourteen-day burn with weekend surge. Advice is Gemini when the key is set, otherwise the built-in protocol.</p>
          <div className="controls">
            <label className="f">PHC
              <select value={selPhc} onChange={(e) => setSelPhc(e.target.value)}>
                {Array.from({ length: 30 }, (_, i) => `PHC${String(i + 1).padStart(3, '0')}`).map((id) => <option key={id} value={id}>{id}</option>)}
              </select>
            </label>
            <label className="f">Drug
              <select value={selDrug} onChange={(e) => setSelDrug(e.target.value)}>
                {DRUGS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </label>
          </div>
          {fLoading && <div className="card rv"><div className="skel" /><div className="skel" /></div>}
          {fc && !fLoading && !fc.error && (
            <div className="split">
              <div className="panel rv">
                <h3 style={{ marginTop: 0 }}>{fc.phc_name} · {fc.drug}</h3>
                <p><StatusTag s={fc.status} /> <span className="meta">{fc.warning} · source: {fc.advice_source}</span></p>
                <Chart series={fc.series} />
                <div className="kv">
                  <div>Days to zero<strong>{fc.days_to_zero}</strong></div>
                  <div>Stock<strong>{fc.stock_units}</strong></div>
                  <div>Burn / day<strong>{fc.avg_daily_use}</strong></div>
                  <div>Beds free<strong>{fc.beds.free}/{fc.beds.total}</strong></div>
                  <div>Doctors<strong>{fc.doctors.present}/{fc.doctors.required}</strong></div>
                </div>
              </div>
              <div className="panel rv" style={{ '--i': 1 }}>
                <h3 style={{ marginTop: 0 }}>Officer advice</h3>
                <div className="advice">{fc.advice}</div>
                <p className="meta" style={{ marginTop: 12 }}>Verify against register before ordering. Weekend burn runs 8% higher.</p>
              </div>
            </div>
          )}
          {fc && fc.error && <div className="error">PHC or drug not found. Pick a listed combination.</div>}
        </section>

        <section id="planner" className="section">
          <h2>Redistribution planner</h2>
          <p className="sub">Surplus over 21 days covers critical under 7 days. Nearest-first keeps cold chain intact.</p>
          <div className="controls">
            <label className="f">Drug
              <select value={planDrug} onChange={(e) => setPlanDrug(e.target.value)}>
                {DRUGS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </label>
          </div>
          {!plan && <div className="card rv"><div className="skel" /><div className="skel" /></div>}
          {plan && (
            <div className="split">
              <div className="panel rv">
                <p><span className="tag t-red">{plan.critical} critical</span> <span className="tag t-green">{plan.surplus} surplus</span> <span className="tag t-gray">{plan.moves.length} moves</span></p>
                {plan.moves.length === 0 && (
                  <div className="state"><strong>No safe surplus for {plan.drug}.</strong><p className="meta">Escalate to the district warehouse and raise an emergency indent. All critical PHCs stay flagged above.</p></div>
                )}
                {plan.moves.map((m, i) => (
                  <div className="move" key={`${m.from_id}-${m.to_id}-${i}`}>
                    <Swap size={18} weight="bold" />
                    <div><span className="q">{m.qty} units</span> · {m.from_id} {m.from_name} → {m.to_id} {m.to_name}<br /><span className="meta">{m.km} km · {m.reason}</span></div>
                  </div>
                ))}
              </div>
              <div className="panel rv" style={{ '--i': 1 }}>
                <h3 style={{ marginTop: 0 }}>Why this plan holds</h3>
                <div className="advice">{plan.rationale}</div>
                <p className="meta" style={{ marginTop: 12 }}>Source: {plan.rationale_source}. Confirm vehicle cold chain for insulin.</p>
              </div>
            </div>
          )}
        </section>

        <section id="alerts" className="section">
          <h2>Collector alerts</h2>
          <p className="sub">Stock-outs, full beds, and absent doctors in one queue. Newest critical first.</p>
          {!alerts && <div className="card rv"><div className="skel" /><div className="skel" /></div>}
          {alerts && (
            <div className="panel rv">
              <p><BellRinging size={16} weight="bold" style={{ verticalAlign: -2 }} /> <strong>{alerts.count}</strong> <span className="meta">active flags · {alerts.alerts.filter((a) => a.type === 'stock-out').length} stock · {alerts.alerts.filter((a) => a.type === 'beds-full').length} beds · {alerts.alerts.filter((a) => a.type === 'no-doctor').length} staffing</span></p>
              {alerts.alerts.slice(0, 14).map((a, i) => (
                <div className="alert" key={`${a.type}-${a.phc_id}-${i}`}>
                  {a.type === 'stock-out' ? <Package size={18} weight="bold" /> : a.type === 'beds-full' ? <Ambulance size={18} weight="bold" /> : <BellRinging size={18} weight="bold" />}
                  <div>{a.text}<br /><span className="meta">{a.phc_id} · {a.district} · {a.drug} · {a.days_to_zero} days</span></div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="section">
          <h2>Built to scale across India</h2>
          <p className="sub">One district tonight, every state next. Same register format, same forecast math.</p>
          <div className="steps">
            <div className="card rv"><div className="step-num">01</div><h3>Same inward register</h3><p className="meta">PHC id, drug, stock, burn, beds, doctors. Any state exports this CSV in a day.</p></div>
            <div className="card rv" style={{ '--i': 1 }}><div className="step-num">02</div><h3>Shared forecast model</h3><p className="meta">One Gemini prompt pack and burn curve reused per district. No retraining per site.</p></div>
            <div className="card rv" style={{ '--i': 2 }}><div className="step-num">03</div><h3>Collector-first handover</h3><p className="meta">Moves print as indents with batch and signature lines. Pilot-ready in weeks.</p></div>
          </div>
        </section>

        <footer className="footer">
          Aarogya Setu Grid · Track 03 prototype for Code for Communities 2.0 · Sample registers in <span className="meta">data/phcs.csv</span> · Start API with <span className="meta">uvicorn main:app</span> · Frontend env <span className="meta">VITE_API_BASE</span>
        </footer>
      </main>
    </div>
  );
}
