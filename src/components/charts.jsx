import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, CartesianGrid, ResponsiveContainer, Cell, LabelList } from 'recharts';
import Card from './Card';
import { byYear, topN, bottomN, fmt } from '../utils/data';

const C = { rojo: '#C62F2F', naranja: '#F08A4B', azul: '#2C7BB6', azulClaro: '#8EC1DA', carbon: '#2F3E46' };
const CONT_COLORS = { Asia: C.rojo, 'América del Norte': C.naranja, Europa: C.carbon, África: C.azulClaro, 'América del Sur': C.azul, Oceanía: '#7AA6C2' };

// Ancho del eje de nombres según el nombre más largo
const axisWidth = (data) => Math.min(220, Math.max(60, Math.max(...data.map((d) => d.name.length)) * 6.5 + 12));

// Etiqueta del eje como texto SVG simple (Recharts recorta con "…" las suyas)
const NameTick = ({ x, y, payload }) => (
  <text x={x - 6} y={y} dy={4} textAnchor="end" fontSize={16} fill="#2F3E46">{payload.value}</text>
);

// Barras horizontales con interruptor: 5 mayores / 5 menores emisores
export function Top5Chart({ rows, year }) {
  const [mode, setMode] = useState('top');
  const top = mode === 'top';
  const unit = top ? 'Gt' : 'Mt';
  const dec = top ? 1 : 3;
  const data = (top ? topN(rows, year) : bottomN(rows, year)).map((r) => ({ name: r.iso_code, v: top ? r.co2 / 1000 : r.co2 }));
  const colors = top ? [C.rojo, C.naranja] : [C.azul, C.azulClaro];
  return (
    <Card>
      <div className="card-head">
        <div>
          <h3>{top ? 'Top 5 emisores' : '5 menores emisores'} ({unit} CO₂)</h3><small>{year}</small>
        </div>
        <div className="toggle" role="group" aria-label="Ver mayores o menores emisores">
          <button type="button" className={top ? 'on' : ''} aria-pressed={top} onClick={() => setMode('top')}>Mayores</button>
          <button type="button" className={!top ? 'on' : ''} aria-pressed={!top} onClick={() => setMode('bottom')}>Menores</button>
        </div>
      </div>
      <div className="chart"><ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ right: 50 }}>
          <XAxis type="number" hide /><YAxis type="category" dataKey="name" width={axisWidth(data)} tick={<NameTick />} />
          <Tooltip formatter={(v) => `${fmt(v, dec)} ${unit}`} />
          <Bar dataKey="v">
            {data.map((d, i) => <Cell key={d.name} fill={i === 0 ? colors[0] : colors[1]} />)}
            <LabelList dataKey="v" position="right" formatter={(v) => fmt(v, dec)} />
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
      <div className="chart tall"><ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid stroke="#e5ebe8" /><XAxis dataKey="year" /><YAxis /><Tooltip formatter={(v) => `${fmt(v)} Gt`} /><Legend />
          {conts.map((c) => <Line key={c} dataKey={c} stroke={CONT_COLORS[c]} dot={false} strokeWidth={2} />)}
        </LineChart>
      </ResponsiveContainer></div>
    </Card>
  );
}

// Barras agrupadas: Top 10 emisores del año final, comparados con el año inicial
export function CompareChart({ rows, y0, y1 }) {
  const data = topN(rows, y1, 10).map((r) => {
    const start = rows.find((x) => x.country === r.country && x.year === y0);
    return { name: r.iso_code, ini: (start?.co2 || 0) / 1000, fin: r.co2 / 1000 };
  });
  return (
    <Card level={3}>
      <h3>Top 10 emisores: {y0} vs. {y1} (Gt CO₂)</h3><small>Los 10 mayores emisores en {y1}</small>
      <div className="chart tall"><ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ right: 20 }}>
          <CartesianGrid stroke="#e5ebe8" horizontal={false} />
          <XAxis type="number" /><YAxis type="category" dataKey="name" width={axisWidth(data)} interval={0} tick={<NameTick />} />
          <Tooltip formatter={(v) => `${fmt(v, 2)} Gt`} /><Legend />
          <Bar dataKey="ini" name={String(y0)} fill={C.azul} barSize={8} />
          <Bar dataKey="fin" name={String(y1)} fill={C.rojo} barSize={8} />
        </BarChart>
      </ResponsiveContainer></div>
    </Card>
  );
}
