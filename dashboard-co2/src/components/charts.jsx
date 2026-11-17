import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, ScatterChart, Scatter, ZAxis, CartesianGrid, ResponsiveContainer, Cell, LabelList } from 'recharts';
import Card from './Card';
import { byYear, topN, fmt } from '../utils/data';

const C = { verde: '#1B6B4A', azul: '#1D6A96', ambar: '#E8A33D', carbon: '#2F3E46', verdeMed: '#6FB98D' };
const CONT_COLORS = { Asia: C.azul, 'América del Norte': C.verde, Europa: C.carbon, África: C.ambar, 'América del Sur': C.verdeMed, Oceanía: '#7AA6C2' };

// Barras horizontales: Top 5 emisores totales
export function Top5Chart({ rows, year }) {
  const data = topN(rows, year).map((r) => ({ name: r.country, gt: r.co2 / 1000 }));
  return (
    <Card>
      <h3>Top 5 emisores totales (Gt CO₂)</h3><small>{year}</small>
      <div className="chart"><ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ right: 40 }}>
          <XAxis type="number" hide /><YAxis type="category" dataKey="name" width={70} />
          <Tooltip formatter={(v) => `${fmt(v)} Gt`} />
          <Bar dataKey="gt">
            {data.map((d, i) => <Cell key={d.name} fill={i === 0 ? C.verde : C.verdeMed} />)}
            <LabelList dataKey="gt" position="right" formatter={(v) => fmt(v)} />
          </Bar>
        </BarChart>
      </ResponsiveContainer></div>
    </Card>
  );
}

// Línea multiserie: emisiones por continente
export function ContinentLines({ rows, y0, y1 }) {
  const conts = [...new Set(rows.map((r) => r.continent))];
  const data = [];
  for (let y = y0; y <= y1; y++) {
    const p = { year: y };
    conts.forEach((c) => { p[c] = byYear(rows, y).filter((r) => r.continent === c).reduce((s, r) => s + r.co2, 0) / 1000; });
    data.push(p);
  }
  return (
    <Card>
      <h3>Emisiones por continente (Gt CO₂)</h3><small>{y0}–{y1}</small>
      <div className="chart"><ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid stroke="#e5ebe8" /><XAxis dataKey="year" /><YAxis /><Tooltip formatter={(v) => `${fmt(v)} Gt`} /><Legend />
          {conts.map((c) => <Line key={c} dataKey={c} stroke={CONT_COLORS[c]} dot={false} strokeWidth={2} />)}
        </LineChart>
      </ResponsiveContainer></div>
    </Card>
  );
}

// Dispersión: PIB per cápita (log) vs CO2 per cápita, burbuja = población
export function GdpScatter({ rows, year }) {
  const data = byYear(rows, year).map((r) => ({ name: r.country, x: r.gdp / r.population, y: (r.co2 * 1e6) / r.population, z: r.population }));
  return (
    <Card>
      <h3>PIB per cápita vs. CO₂ per cápita</h3><small>Burbuja = población · eje X en escala log</small>
      <div className="chart"><ResponsiveContainer>
        <ScatterChart margin={{ left: -10 }}>
          <CartesianGrid stroke="#e5ebe8" />
          <XAxis type="number" dataKey="x" scale="log" domain={[1000, 100000]} ticks={[1000, 3000, 10000, 30000, 100000]} tickFormatter={(v) => `${v / 1000}k`} name="PIB pc (USD)" />
          <YAxis type="number" dataKey="y" name="t CO₂/persona" />
          <ZAxis dataKey="z" range={[40, 600]} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(v, n) => (n === 'z' ? v : fmt(v, 0))} labelFormatter={() => ''} />
          <Scatter data={data} fill={C.verde} fillOpacity={0.6}>
            {data.map((d) => <Cell key={d.name} fill={d.y > 10 ? C.ambar : C.verde} />)}
            <LabelList dataKey="name" fontSize={9} />
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer></div>
    </Card>
  );
}

// Barras apiladas: emisiones por fuente (Top 5)
export function FuelStacked({ rows, year }) {
  const data = topN(rows, year).map((r) => ({ name: r.country, Carbón: r.coal_co2 / 1000, Petróleo: r.oil_co2 / 1000, Gas: r.gas_co2 / 1000, Cemento: r.cement_co2 / 1000, 'Quema de gas': r.flaring_co2 / 1000 }));
  return (
    <Card level={3}>
      <h3>Emisiones por fuente de combustible (Gt)</h3><small>Top 5 · {year}</small>
      <div className="chart"><ResponsiveContainer>
        <BarChart data={data}>
          <XAxis dataKey="name" /><YAxis /><Tooltip formatter={(v) => `${fmt(v, 2)} Gt`} /><Legend />
          <Bar dataKey="Carbón" stackId="a" fill={C.carbon} /><Bar dataKey="Petróleo" stackId="a" fill={C.ambar} />
          <Bar dataKey="Gas" stackId="a" fill={C.azul} /><Bar dataKey="Cemento" stackId="a" fill={C.verdeMed} />
          <Bar dataKey="Quema de gas" stackId="a" fill="#C5CDD1" />
        </BarChart>
      </ResponsiveContainer></div>
    </Card>
  );
}
