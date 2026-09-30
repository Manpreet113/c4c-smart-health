// Offline fallback sample — mirrors backend/data/phcs.csv shape for the default demo slice.
// Used only when VITE_API_BASE is unreachable, so the deployed link never renders blank.
export const SAMPLE_ROWS = [
  { phc_id: 'PHC004', phc_name: 'Deeg Road PHC', district: 'Bharatpur', lat: 27.1892, lng: 77.4811, drug: 'ORS', stock_units: 800, avg_daily_use: 100, beds_total: 18, beds_free: 0, doctors_present: 1, doctors_required: 3 },
  { phc_id: 'PHC012', phc_name: 'Bhiwadi PHC', district: 'Alwar', lat: 28.2121, lng: 76.8174, drug: 'ORS', stock_units: 900, avg_daily_use: 110, beds_total: 20, beds_free: 1, doctors_present: 1, doctors_required: 3 },
  { phc_id: 'PHC003', phc_name: 'Nadbai Road PHC', district: 'Bharatpur', lat: 27.2311, lng: 77.2034, drug: 'ORS', stock_units: 3100, avg_daily_use: 95, beds_total: 15, beds_free: 8, doctors_present: 3, doctors_required: 3 },
  { phc_id: 'PHC027', phc_name: 'Mandawar PHC', district: 'Dausa', lat: 27.1412, lng: 76.5118, drug: 'ORS', stock_units: 2900, avg_daily_use: 85, beds_total: 19, beds_free: 9, doctors_present: 3, doctors_required: 3 },
  { phc_id: 'PHC024', phc_name: 'Mahwa PHC', district: 'Dausa', lat: 26.7012, lng: 76.9218, drug: 'ORS', stock_units: 500, avg_daily_use: 102, beds_total: 13, beds_free: 0, doctors_present: 0, doctors_required: 3 },
];

export function daysToZero(r) {
  return Math.round((r.stock_units / (r.avg_daily_use || 1)) * 10) / 10;
}
export function statusFor(d) {
  if (d < 7) return 'critical';
  if (d < 14) return 'watch';
  return 'healthy';
}
