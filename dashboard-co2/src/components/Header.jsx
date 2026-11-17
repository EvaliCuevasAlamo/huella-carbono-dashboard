import Card from './Card';

export default function Header({ range, setRange, continents, continent, setContinent, countries, country, setCountry }) {
  const [y0, y1] = range;
  return (
    <header className="header">
      <Card level={1} className="title">
        <h1>Huella de carbono: ¿quién contamina más?</h1>
        <small>Dashboard estratégico · CO₂ por país · 2010–2023</small>
      </Card>
      <Card level={3} className="filter">
        Año: {y0} – {y1}
        <input type="range" min="2010" max="2023" value={y0} onChange={(e) => setRange([Math.min(+e.target.value, y1), y1])} />
        <input type="range" min="2010" max="2023" value={y1} onChange={(e) => setRange([y0, Math.max(+e.target.value, y0)])} />
      </Card>
      <Card level={3} className="filter">
        Continente
        <select value={continent} onChange={(e) => { setContinent(e.target.value); setCountry('Todos'); }}>
          {['Todos', ...continents].map((c) => <option key={c}>{c}</option>)}
        </select>
      </Card>
      <Card level={3} className="filter">
        País
        <select value={country} onChange={(e) => setCountry(e.target.value)}>
          {['Todos', ...countries].map((c) => <option key={c}>{c}</option>)}
        </select>
      </Card>
    </header>
  );
}
