import { useEffect, useMemo, useState } from 'react';
import Header from './components/Header';
import Kpis from './components/Kpis';
import WorldMap from './components/WorldMap';
import { Top5Chart, ContinentLines, CompareChart } from './components/charts';
import { loadData } from './utils/data';
import './styles/theme.css';
import './styles/dashboard.css';

export default function App() {
  const [data, setData] = useState([]);
  const [range, setRange] = useState([2010, 2023]);
  const [continent, setContinent] = useState('Todos');
  const [country, setCountry] = useState('Todos');
  useEffect(() => { loadData().then(setData); }, []);

  const [y0, y1] = range;
  const continents = useMemo(() => [...new Set(data.map((r) => r.continent))], [data]);
  // inContinent: filtrado por continente (para rankings); scope: además filtrado por país (para KPIs)
  const inContinent = useMemo(() => data.filter((r) => continent === 'Todos' || r.continent === continent), [data, continent]);
  const countries = useMemo(() => [...new Set(inContinent.map((r) => r.country))].sort((a, b) => a.localeCompare(b, 'es')), [inContinent]);
  const scope = useMemo(() => (country === 'Todos' ? inContinent : inContinent.filter((r) => r.country === country)), [inContinent, country]);

  if (!data.length) return <p style={{ padding: 20 }}>Cargando datos…</p>;
  const selectCountry = (name) => { setContinent('Todos'); setCountry((c) => (c === name ? 'Todos' : name)); };

  return (
    <main className="dash">
      <Header {...{ range, setRange, continents, continent, setContinent, countries, country, setCountry }} />
      <Kpis scope={scope} inContinent={inContinent} y0={y0} y1={y1} />
      <div className="mid">
        <WorldMap rows={data} year={y1} selected={country} onSelect={selectCountry} />
        <Top5Chart rows={inContinent} year={y1} />
      </div>
      <div className="bottom">
        <ContinentLines rows={inContinent} y0={y0} y1={y1} />
        <CompareChart rows={inContinent} y0={y0} y1={y1} />
      </div>
      <footer className="footer">Fuente: Our World in Data, emisiones anuales de CO₂ por país (Global Carbon Project), 2010–2023.</footer>
    </main>
  );
}
