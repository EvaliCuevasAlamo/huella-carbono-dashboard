import { useEffect, useState } from 'react';
import { MapContainer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Card from './Card';
import { byYear, fmt } from '../utils/data';

// Fuente de geometrías (se descarga al abrir el dashboard)
const GEOJSON_URL = 'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson';
// Escala divergente azul (menos emisiones) → rojo (más), en Mt de CO₂ totales
const SCALE = [[10, '#2C7BB6'], [50, '#8EC1DA'], [200, '#F4E3B1'], [1000, '#F08A4B'], [3000, '#C62F2F'], [Infinity, '#7F0F1F']];
const colorFor = (v) => (v == null ? '#D5DADD' : SCALE.find(([max]) => v < max)[1]);
// Nombre en español para países sin datos (el GeoJSON viene en inglés)
const regionEs = new Intl.DisplayNames(['es'], { type: 'region' });
const geoName = (f) => {
  const a2 = f.properties['ISO3166-1-Alpha-2'] || f.properties.ISO_A2;
  try { if (a2 && a2 !== '-99') return regionEs.of(a2); } catch { /* usa el nombre original */ }
  return f.properties.ADMIN || f.properties.name;
};
const LABELS = ['< 10', '10–50', '50–200', '200–1,000', '1,000–3,000', '≥ 3,000'];

export default function WorldMap({ rows, year, selected, onSelect }) {
  const [geo, setGeo] = useState(null);
  const [error, setError] = useState(false);
  useEffect(() => { fetch(GEOJSON_URL).then((r) => r.json()).then(setGeo).catch(() => setError(true)); }, []);

  const cur = byYear(rows, year);
  const tot = Object.fromEntries(cur.map((r) => [r.iso_code, { name: r.country, v: r.co2 }]));
  const iso = (f) => f.properties['ISO3166-1-Alpha-3'] || f.properties.ISO_A3;
  const ranked = Object.values(tot).sort((a, b) => b.v - a.v);

  return (
    <Card>
      <h3>Emisiones totales de CO₂ (Mt), {year}</h3><small>Clic en un país filtra el dashboard</small>
      <div className="map">
        {error ? <p>No se pudo cargar el mapa (revisa tu conexión).</p> : (
          <MapContainer center={[20, 10]} zoom={1.5} zoomSnap={0.5} scrollWheelZoom={false} attributionControl={false} style={{ height: '100%' }}>
            {geo && <GeoJSON key={`${year}-${selected}-${cur.length}`} data={geo}
              style={(f) => { const d = tot[iso(f)]; return { fillColor: colorFor(d?.v), fillOpacity: 0.95, color: d?.name === selected ? '#2F3E46' : '#fff', weight: d?.name === selected ? 3 : 0.5 }; }}
              onEachFeature={(f, layer) => {
                const d = tot[iso(f)];
                layer.bindTooltip(d ? `${d.name}: ${fmt(d.v, 0)} Mt` : `${geoName(f)}: sin datos`);
                if (d) layer.on('click', () => onSelect(d.name));
              }} />}
          </MapContainer>
        )}
        <div className="legend">
          <b>Mt CO₂</b>
          {SCALE.map(([, c], i) => <span key={c}><i style={{ background: c }} />{LABELS[i]}</span>)}
          <span><i style={{ background: '#D5DADD' }} />Sin datos</span>
          
        </div>
      </div>
    </Card>
  );
}
