import Papa from 'papaparse';

// Esquema del CSV limpio: country, iso_code, continent, year, co2 (Mt)
export async function loadData() {
  const txt = await (await fetch(import.meta.env.BASE_URL + 'data/co2.csv')).text();
  return Papa.parse(txt, { header: true, dynamicTyping: true, skipEmptyLines: true }).data;
}
const sum = (a, k) => a.reduce((s, r) => s + (r[k] || 0), 0);
export const byYear = (rows, y) => rows.filter((r) => r.year === y);
export const totalCo2 = (rows) => sum(rows, 'co2');
// Variación % entre dos años
export const variation = (rows, y0, y1) => {
  const a = totalCo2(byYear(rows, y0)), b = totalCo2(byYear(rows, y1));
  return a ? ((b - a) / a) * 100 : 0;
};
// País con la mayor reducción %. Solo cuenta países con más de MIN_MT en el año inicial
// (si no, ganan países diminutos con caídas enormes).
const MIN_MT = 10;
export const bestImprovement = (rows, y0, y1) =>
  [...new Set(rows.map((r) => r.country))]
    .map((c) => rows.filter((r) => r.country === c))
    .filter((cr) => totalCo2(byYear(cr, y0)) > MIN_MT)
    .map((cr) => ({ country: cr[0].country, v: variation(cr, y0, y1) }))
    .sort((a, b) => a.v - b.v)[0] || { country: '—', v: 0 };
export const topN = (rows, y, n = 5) => byYear(rows, y).sort((a, b) => b.co2 - a.co2).slice(0, n);
// Los N menores emisores (se ignoran valores en 0: territorios sin emisiones reportadas)
export const bottomN = (rows, y, n = 5) => byYear(rows, y).filter((r) => r.co2 > 0).sort((a, b) => a.co2 - b.co2).slice(0, n);
// Participación del Top N en el total del año (%)
export const topShare = (rows, y, n = 5) =>
  (topN(rows, y, n).reduce((s, r) => s + r.co2, 0) / (totalCo2(byYear(rows, y)) || 1)) * 100;
export const fmt = (n, d = 1) => Number(n).toLocaleString('es-MX', { maximumFractionDigits: d, minimumFractionDigits: d });
// Mt -> { value, unit }: Gt si es grande, Mt si es pequeño
export const mtLabel = (mt) => (mt >= 1000 ? { value: fmt(mt / 1000, 1), unit: 'Gt' } : { value: fmt(mt, 0), unit: 'Mt' });
