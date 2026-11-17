import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import Card from './Card';
import { byYear, perCapita, intensity, variation, bestImprovement, topN, totalCo2, fmt } from '../utils/data';

export default function Kpis({ scope, inContinent, y0, y1 }) {
  const years = Array.from({ length: y1 - y0 + 1 }, (_, i) => y0 + i);
  const spark = years.map((y) => ({ y, v: perCapita(byYear(scope, y)) }));
  const pc = perCapita(byYear(scope, y1));
  const pcVar = spark[0].v ? ((pc - spark[0].v) / spark[0].v) * 100 : 0;

  const top = topN(inContinent, y1, 5);
  const topShare = (top.reduce((s, r) => s + r.co2, 0) / (totalCo2(byYear(inContinent, y1)) || 1)) * 100;
  const varPct = variation(scope, y0, y1);
  const best = bestImprovement(inContinent, y0, y1);
  const int1 = intensity(byYear(scope, y1)), int0 = intensity(byYear(scope, y0));
  const intVar = int0 ? ((int1 - int0) / int0) * 100 : 0;
  const arrow = (v) => (v >= 0 ? '▲' : '▼');
  const cls = (v) => (v >= 0 ? 'up' : 'down');

  return (
    <div className="kpis">
      <Card level={1} className="kpi main">
        <h3>KPI principal · CO₂ per cápita</h3>
        <div><span className="value">{fmt(pc)}</span> <small>t CO₂ por persona · {y1}</small></div>
        <small>{y0} → {y1}: {pcVar >= 0 ? '+' : ''}{fmt(pcVar, 0)} %</small>
        <div style={{ height: 50 }}>
          <ResponsiveContainer><AreaChart data={spark}><Area dataKey="v" stroke="#1B6B4A" fill="#1B6B4A" fillOpacity={0.2} /></AreaChart></ResponsiveContainer>
        </div>
      </Card>
      <Card className="kpi">
        <h3>Top 5 emisores</h3>
        <div className="value green">{top[0]?.country}</div>
        <small>{fmt(top[0]?.co2 / 1000)} Gt CO₂ · 1.º lugar<br />(5 países = {fmt(topShare, 0)} % del total)</small>
      </Card>
      <Card className="kpi">
        <h3>Variación % {y0}–{y1}</h3>
        <div className={`value ${cls(varPct)}`}>{arrow(varPct)} {varPct >= 0 ? '+' : ''}{fmt(varPct)} %</div>
        <small>emisiones totales {varPct >= 0 ? 'suben' : 'bajan'} vs. {y0}</small>
      </Card>
      <Card className="kpi">
        <h3>Mayor mejora</h3>
        <div className={`value ${cls(best.v)}`}>{arrow(best.v)} {fmt(best.v, 0)} %</div>
        <small>{best.country} ({y0}–{y1})</small>
      </Card>
      <Card className="kpi">
        <h3>CO₂ por PIB</h3>
        <div className="value" style={{ color: 'var(--azul)' }}>{fmt(int1, 2)}</div>
        <small>kg CO₂ por USD de PIB<br />{arrow(intVar)} {fmt(intVar, 0)} % vs. {y0}</small>
      </Card>
    </div>
  );
}
