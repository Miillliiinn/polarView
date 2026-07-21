import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './FranceMap.css';
import { toGeoJsonFeatureCollection } from '../api/geoJsonConvertion';
import { globalCache } from '../api/classCache';

const FRANCE_BOUNDS: [[number, number], [number, number]] = [
  [-5.5, 41.0],
  [9.9, 51.3]
];

export default function FranceMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  // Initialisation de la carte (une seule fois)
  useEffect(() => {
    console.log('[FranceMap] useEffect init — début');

    if (map.current) {
      console.log('[FranceMap] map.current existe déjà, on sort');
      return;
    }

    console.log('[FranceMap] création de la map...');
    map.current = new maplibregl.Map({
      container: mapContainer.current!,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      bounds: FRANCE_BOUNDS,
      fitBoundsOptions: { padding: 100 },
      maxBounds: [
        [FRANCE_BOUNDS[0][0] - 2, FRANCE_BOUNDS[0][1] - 2],
        [FRANCE_BOUNDS[1][0] + 2, FRANCE_BOUNDS[1][1] + 2]
      ]
    });
    console.log('[FranceMap] map créée:', map.current);

    map.current.on('error', (e) => {
      console.error('[FranceMap] Erreur MapLibre:', e);
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      console.log('[FranceMap] événement load déclenché');
      if (!map.current) return;

      // --- Avions (cercle rouge temporaire, sans icône) ---
      map.current.addSource('planes', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      map.current.addLayer({
        id: 'planes-layer',
        type: 'circle',
        source: 'planes',
        paint: {
          'circle-radius': 6,
          'circle-color': '#ff0000',
          'circle-stroke-width': 1,
          'circle-stroke-color': '#ffffff'
        }
      });

      map.current.on('click', 'planes-layer', (e) => {
        const feature = e.features?.[0];
        if (!feature || !map.current) return;
        new maplibregl.Popup()
          .setLngLat((feature.geometry as any).coordinates)
          .setHTML(`<strong>${feature.properties?.callsign || 'Vol inconnu'}</strong>`)
          .addTo(map.current);
      });

      map.current.on('mouseenter', 'planes-layer', () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer';
      });
      map.current.on('mouseleave', 'planes-layer', () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
      });

      // --- Trains (cercle bleu temporaire, sans icône) ---
      map.current.addSource('trains', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      map.current.addLayer({
        id: 'trains-layer',
        type: 'circle',
        source: 'trains',
        paint: {
          'circle-radius': 6,
          'circle-color': '#0000ff',
          'circle-stroke-width': 1,
          'circle-stroke-color': '#ffffff'
        }
      });

      map.current.on('click', 'trains-layer', (e) => {
        const feature = e.features?.[0];
        if (!feature || !map.current) return;
        new maplibregl.Popup()
          .setLngLat((feature.geometry as any).coordinates)
          .setHTML(`<strong>${feature.properties?.name || 'Train inconnu'}</strong>`)
          .addTo(map.current);
      });

      map.current.on('mouseenter', 'trains-layer', () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer';
      });
      map.current.on('mouseleave', 'trains-layer', () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
      });

      console.log('[FranceMap] sources et couches ajoutées avec succès');
    });
  }, []);

  // Rafraîchissement périodique des données depuis le cache
  useEffect(() => {
    const interval = setInterval(() => {
      if (!map.current || !map.current.isStyleLoaded()) return;

      // Avions
      const planesSource = map.current.getSource('planes') as maplibregl.GeoJSONSource | undefined;
      if (planesSource) {
        const planes = globalCache.getOpCache();
        const planesGeojson = toGeoJsonFeatureCollection(
          planes.map((p: any) => ({
            long: p.longitude,
            lat: p.latitude,
            properties: { icao24: p.icao24, callsign: p.callsign, heading: p.heading ?? 0 }
          }))
        );
        console.log('[FranceMap] planes — nb features:', planesGeojson.features.length);
        planesSource.setData(planesGeojson);
      }

      // Trains
      const trainsSource = map.current.getSource('trains') as maplibregl.GeoJSONSource | undefined;
      if (trainsSource) {
        const trains = globalCache.getSncfCache();
        const trainsGeojson = toGeoJsonFeatureCollection(
          trains.map((t: any) => ({
            long: t.longitude,
            lat: t.latitude,
            properties: { name: t.name ?? t.trainNumber ?? '' }
          }))
        );
        console.log('[FranceMap] trains — nb features:', trainsGeojson.features.length);
        trainsSource.setData(trainsGeojson);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="france-map-wrapper">
      <div ref={mapContainer} className="map-container" />
    </div>
  );
}


// import { useEffect, useRef } from 'react';
// import maplibregl from 'maplibre-gl';
// import 'maplibre-gl/dist/maplibre-gl.css';
// import './FranceMap.css';
// import { toGeoJsonFeatureCollection } from '../api/geoJsonConvertion';
// import { globalCache } from '../api/classCache';

// const FRANCE_BOUNDS: [[number, number], [number, number]] = [
//   [-5.5, 41.0],
//   [9.9, 51.3]
// ];

// export default function FranceMap() {
//   const mapContainer = useRef<HTMLDivElement>(null);
//   const map = useRef<maplibregl.Map | null>(null);

//   useEffect(() =>
//   {
//     if (map.current) return;

//     map.current = new maplibregl.Map(
//     {
//       container: mapContainer.current!,
//       style: 'https://tiles.openfreemap.org/styles/liberty',
//       bounds: FRANCE_BOUNDS,
//       fitBoundsOptions: { padding: 100 },
//       maxBounds: [ [FRANCE_BOUNDS[0][0] - 2, FRANCE_BOUNDS[0][1] - 2], [FRANCE_BOUNDS[1][0] + 2, FRANCE_BOUNDS[1][1] + 2] ]
//     });
//     map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
//   }, []);

//   return (
//     <div className="france-map-wrapper">
//       <div ref={mapContainer} className="map-container" />
//     </div>
//   );
// }
