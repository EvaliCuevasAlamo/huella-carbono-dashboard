import Card from './Card';

const YEARS = Array.from({ length: 14 }, (_, i) => 2010 + i);

export default function Header({ range, setRange, continents, continent, setContinent, countries, country, setCountry }) {
  const [y0, y1] = range;
  return (
    <header className="header">
      <Card className="title">
        <h1>Huella de carbono: ¿quién contamina más?</h1>
        <small>Dashboard estratégico · CO₂ por país · 2010–2023</small>
      </Card>
      <Card level={3} className="filter">
        Años
        <div className="years">
          <select aria-label="Año inicial" value={y0} onChange={(e) => setRange([+e.target.value, y1])}>
            {YEARS.filter((y) => y <= y1).map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <span>–</span>
          <select aria-label="Año final" value={y1} onChange={(e) => setRange([y0, +e.target.value])}>
            {YEARS.filter((y) => y >= y0).map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
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
