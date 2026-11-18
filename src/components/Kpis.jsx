import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import Card from './Card';
import { byYear, variation, bestImprovement, topN, topShare, totalCo2, mtLabel, fmt } from '../utils/data';

export default function Kpis({ scope, inContinent, y0, y1 }) {
  const years = Array.from({ length: y1 - y0 + 1 }, (_, i) => y0 + i);
  const spark = years.map((y) => ({ y, v: totalCo2(byYear(scope, y)) }));
  const total = spark[spark.length - 1].v;
  const totalVar = variation(scope, y0, y1);
  const main = mtLabel(total);

  const top = topN(inContinent, y1, 5);
  const topEm = mtLabel(top[0]?.co2 || 0);
  const share1 = topShare(inContinent, y1), share0 = topShare(inContinent, y0);
  const shareDelta = share1 - share0;
  const best = bestImprovement(inContinent, y0, y1);

  const arrow = (v) => (v >= 0 ? '▲' : '▼');
  const cls = (v) => (v >= 0 ? 'up' : 'down');
  const sign = (v) => (v >= 0 ? '+' : '');

  return (
    <div className="kpis">
      <Card level={1} className="kpi main">
        <h3>KPI principal · CO₂ total</h3>
        <div><span className="value">{main.value}</span> <small>{main.unit} CO₂ · {y1}</small></div>
        <small>{y0} → {y1}: {sign(totalVar)}{fmt(totalVar, 0)} %</small>
        <div style={{ height: 50 }}>
          <ResponsiveContainer><AreaChart data={spark}><Area dataKey="v" stroke="#2C7BB6" fill="#2C7BB6" fillOpacity={0.2} /></AreaChart></ResponsiveContainer>
        </div>
      </Card>
      <Card className="kpi">
        <h3>Mayor emisor</h3>
        <div className="value green">{top[0]?.country}</div>
        <small>{topEm.value} {topEm.unit} CO₂ · 1.º lugar en {y1}</small>
      </Card>
      <Card className="kpi">
        <h3>Variación % {y0}–{y1}</h3>
        <div className={`value ${cls(totalVar)}`}>{arrow(totalVar)} {sign(totalVar)}{fmt(totalVar)} %</div>
        <small>emisiones totales {totalVar >= 0 ? 'suben' : 'bajan'} vs. {y0}</small>
      </Card>
      <Card className="kpi">
        <h3>Mayor mejora</h3>
        <div className={`value ${cls(best.v)}`}>{arrow(best.v)} {fmt(best.v, 0)} %</div>
        <small>{best.country} ({y0}–{y1})<br />solo países con &gt; 10 Mt en {y0}</small>
      </Card>
      <Card className="kpi">
        <h3>Concentración Top 5</h3>
        <div className="value" style={{ color: 'var(--azul)' }}>{fmt(share1, 0)} %</div>
        <small>del total en {y1}<br />{arrow(shareDelta)} {fmt(Math.abs(shareDelta), 1)} pp vs. {y0}</small>
      </Card>
    </div>
  );
}
