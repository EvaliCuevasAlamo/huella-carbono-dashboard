import { useEffect, useState } from 'react';
import { MapContainer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Card from './Card';
import { byYear, fmt } from '../utils/data';

// Fuente de geometrías (se descarga al abrir el dashboard)
const GEOJSON_URL = 'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson';
// Escala secuencial verde claro → oscuro (Fase 2)
const SCALE = [[2, '#E3F1E8'], [5, '#A8D5B9'], [8, '#6FB98D'], [12, '#2F8F63'], [20, '#1B6B4A'], [Infinity, '#0F3D2A']];
const colorFor = (v) => (v == null ? '#D5DADD' : SCALE.find(([max]) => v < max)[1]);
const LABELS = ['< 2', '2–5', '5–8', '8–12', '12–20', '≥ 20'];

export default function WorldMap({ rows, year, selected, onSelect }) {
  const [geo, setGeo] = useState(null);
  const [error, setError] = useState(false);
  useEffect(() => { fetch(GEOJSON_URL).then((r) => r.json()).then(setGeo).catch(() => setError(true)); }, []);

  const cur = byYear(rows, year);
  const pc = Object.fromEntries(cur.map((r) => [r.iso_code, { name: r.country, v: (r.co2 * 1e6) / r.population }]));
  const iso = (f) => f.properties['ISO3166-1-Alpha-3'] || f.properties.ISO_A3;
  const ranked = Object.values(pc).sort((a, b) => b.v - a.v);

  return (
    <Card>
      <h3>Emisiones de CO₂ per cápita (t por persona), {year}</h3><small>Clic en un país filtra el dashboard</small>
      <div className="map">
        {error ? <p>No se pudo cargar el mapa (revisa tu conexión).</p> : (
          <MapContainer center={[20, 10]} zoom={1.5} zoomSnap={0.5} scrollWheelZoom={false} attributionControl={false} style={{ height: '100%' }}>
            {geo && <GeoJSON key={`${year}-${selected}-${cur.length}`} data={geo}
              style={(f) => { const d = pc[iso(f)]; return { fillColor: colorFor(d?.v), fillOpacity: 0.95, color: d?.name === selected ? '#E8A33D' : '#fff', weight: d?.name === selected ? 3 : 0.5 }; }}
              onEachFeature={(f, layer) => {
                const d = pc[iso(f)];
                layer.bindTooltip(d ? `${d.name}: ${fmt(d.v)} t/persona` : `${f.properties.ADMIN || f.properties.name}: sin datos`);
                if (d) layer.on('click', () => onSelect(d.name));
              }} />}
          </MapContainer>
        )}
        <div className="legend">
          <b>t / persona</b>
          {SCALE.map(([, c], i) => <span key={c}><i style={{ background: c }} />{LABELS[i]}</span>)}
          <span><i style={{ background: '#D5DADD' }} />Sin datos</span>
          <b style={{ marginTop: 8 }}>Más alto</b>{ranked.slice(0, 3).map((r) => <span key={r.name}>{r.name} {fmt(r.v)}</span>)}
          <b style={{ marginTop: 8 }}>Más bajo</b>{ranked.slice(-1).map((r) => <span key={r.name}>{r.name} {fmt(r.v)}</span>)}
        </div>
      </div>
    </Card>
  );
}
