import Papa from 'papaparse';

export async function loadData() {
  const txt = await (await fetch(import.meta.env.BASE_URL + 'data/co2.csv')).text();
  return Papa.parse(txt, { header: true, dynamicTyping: true, skipEmptyLines: true }).data;
}
const sum = (a, k) => a.reduce((s, r) => s + (r[k] || 0), 0);
export const byYear = (rows, y) => rows.filter((r) => r.year === y);
// KPI principal: t CO2 por persona (co2 en Mt, población en personas)
export const perCapita = (rows) => (sum(rows, 'co2') * 1e6) / (sum(rows, 'population') || 1);
// Intensidad: kg CO2 por USD de PIB
export const intensity = (rows) => (sum(rows, 'co2') * 1e9) / (sum(rows, 'gdp') || 1);
export const totalCo2 = (rows) => sum(rows, 'co2');
// Variación % entre dos años
export const variation = (rows, y0, y1) => {
  const a = totalCo2(byYear(rows, y0)), b = totalCo2(byYear(rows, y1));
  return a ? ((b - a) / a) * 100 : 0;
};
// País con la variación más negativa
export const bestImprovement = (rows, y0, y1) =>
  [...new Set(rows.map((r) => r.country))]
    .map((c) => ({ country: c, v: variation(rows.filter((r) => r.country === c), y0, y1) }))
    .sort((a, b) => a.v - b.v)[0];
export const topN = (rows, y, n = 5) => byYear(rows, y).sort((a, b) => b.co2 - a.co2).slice(0, n);
export const fmt = (n, d = 1) => Number(n).toLocaleString('es-MX', { maximumFractionDigits: d, minimumFractionDigits: d });
