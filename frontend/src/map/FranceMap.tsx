import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './FranceMap.css';

const FRANCE_BOUNDS: [[number, number], [number, number]] = [
  [-5.5, 41.0],
  [9.9, 51.3]
];

export default function FranceMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  useEffect(() =>
  {
    if (map.current) return;

    map.current = new maplibregl.Map(
    {
      container: mapContainer.current!,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      bounds: FRANCE_BOUNDS,
      fitBoundsOptions: { padding: 100 },
      maxBounds: [ [FRANCE_BOUNDS[0][0] - 2, FRANCE_BOUNDS[0][1] - 2], [FRANCE_BOUNDS[1][0] + 2, FRANCE_BOUNDS[1][1] + 2] ]
    });
    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
  }, []);

  return (
    <div className="france-map-wrapper">
      <div ref={mapContainer} className="map-container" />
    </div>
  );
}