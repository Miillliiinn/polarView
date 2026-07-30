import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './FranceMap.css';
import { toGeoJsonFeatureCollection } from '../api/geoJsonConvertion';
import { globalCache } from '../api/classCache';
import api from '../api/apiBridge';

// Silhouette d'avion plus réaliste (vue du dessus), pointant vers le haut (nord)
function createPlaneIcon(color: string, size = 96): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.translate(size / 2, size / 2);
  ctx.fillStyle = color;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = size * 0.02;

  const s = size / 100; // facteur d'échelle sur une grille de référence 100x100

  ctx.beginPath();
  // Fuselage / nez
  ctx.moveTo(0, -45 * s);
  ctx.lineTo(4 * s, -30 * s);
  ctx.lineTo(4 * s, -5 * s);
  // Aile droite
  ctx.lineTo(42 * s, 12 * s);
  ctx.lineTo(42 * s, 18 * s);
  ctx.lineTo(5 * s, 8 * s);
  // Fuselage arrière droit
  ctx.lineTo(5 * s, 28 * s);
  // Empennage droit
  ctx.lineTo(16 * s, 38 * s);
  ctx.lineTo(16 * s, 43 * s);
  ctx.lineTo(2 * s, 35 * s);
  // Pointe queue
  ctx.lineTo(0, 45 * s);
  // Symétrie côté gauche
  ctx.lineTo(-2 * s, 35 * s);
  ctx.lineTo(-16 * s, 43 * s);
  ctx.lineTo(-16 * s, 38 * s);
  ctx.lineTo(-5 * s, 28 * s);
  ctx.lineTo(-5 * s, 8 * s);
  ctx.lineTo(-42 * s, 18 * s);
  ctx.lineTo(-42 * s, 12 * s);
  ctx.lineTo(-4 * s, -5 * s);
  ctx.lineTo(-4 * s, -30 * s);
  ctx.closePath();

  ctx.fill();
  ctx.stroke();

  return ctx.getImageData(0, 0, size, size);
}

function createTrainIcon(color = '#457b9d', size = 64): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.3, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();

  return ctx.getImageData(0, 0, size, size);
}

const FRANCE_BOUNDS: [[number, number], [number, number]] = [
  [-5.5, 41.0],
  [9.9, 51.3]
];

export default function FranceMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  // Initialisation de la carte (une seule fois)
  useEffect(() => {
    if (map.current) return;

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

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.current.on('error', (e) => {
      console.error('[FranceMap] Erreur MapLibre:', e);
    });

    map.current.on('load', () => {
      if (!map.current) return;

      // --- Icônes avion par tranche d'altitude (couleurs différentes) ---
      map.current.addImage('plane-ground', createPlaneIcon('#989898', 96));   // gris — au sol
      map.current.addImage('plane-low', createPlaneIcon('#a199ff', 96));      // orange — basse altitude
      map.current.addImage('plane-mid', createPlaneIcon('#7c70ff', 96));      // jaune — moyenne altitude
      map.current.addImage('plane-high', createPlaneIcon('#5b4dff', 96));     // rouge — haute altitude
      map.current.addImage('plane-cruise', createPlaneIcon('#1500ff', 96));   // bleu — croisière

      const trainCanvas = createTrainIcon('#457b9d', 64);
      map.current.addImage('train-icon', trainCanvas, { pixelRatio: 2 });

      // --- Source et couche avions ---
      map.current.addSource('planes', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      map.current.addLayer({
        id: 'planes-layer',
        type: 'symbol',
        source: 'planes',
        layout: {
          'icon-image': [
            'step',
            ['coalesce', ['get', 'altitude'], 0],
            'plane-ground',
            100, 'plane-low',
            3000, 'plane-mid',
            8000, 'plane-high',
            11000, 'plane-cruise'
          ],
          'icon-size': 0.5,
          'icon-rotate': ['coalesce', ['get', 'heading'], 0],
          'icon-rotation-alignment': 'map',
          'icon-allow-overlap': true
        }
      });

      map.current.on('click', 'planes-layer', async (e) => {
          const feature = e.features?.[0];
          if (!feature || !map.current) return;

          const icao24 = feature.properties?.icao24;
          const callsign = feature.properties?.callsign || 'Vol inconnu';
          const altitude = feature.properties?.altitude ?? '?';
          const coordinates = (feature.geometry as any).coordinates;

          const popup = new maplibregl.Popup()
              .setLngLat(coordinates)
              .setHTML(`
                  <strong>${callsign}</strong><br/>
                  Altitude: ${altitude} m<br/>
                  <em>Chargement de la photo...</em>
              `)
              .addTo(map.current);

          if (!icao24) return;
          try
          {
            console.log(icao24);
              const res = await api.get(`/planes/${icao24}/picture`);
              const photo = res.data;
              popup.setHTML(`
                  <strong>${callsign}</strong><br/>
                  Altitude: ${altitude} m<br/>
                  ${photo?.thumbnailSrc
                      ? `<img src="${photo.thumbnailSrc}" width="${photo.thumbnailWidth || 150}" style="border-radius:4px;margin-top:4px;" /><br/><small>📷 ${photo.photographer || 'Inconnu'}</small>`
                      : `<em>Aucune photo disponible</em>`
                  }
              `);
          }
          catch (err)
          {
              console.error('Erreur récupération photo avion :', err);
              popup.setHTML(`
                  <strong>${callsign}</strong><br/>
                  Altitude: ${altitude} m<br/>
                  <em>Erreur de chargement de la photo</em>
              `);
          }
      });

      map.current.on('mouseenter', 'planes-layer', () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer';
      });
      map.current.on('mouseleave', 'planes-layer', () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
      });

      // --- Source et couche trains ---
      map.current.addSource('trains', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      map.current.addLayer({
        id: 'trains-layer',
        type: 'symbol',
        source: 'trains',
        layout: {
          'icon-image': 'train-icon',
          'icon-size': 0.5,
          'icon-allow-overlap': true
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
            properties: {
              icao24: p.icao24,
              callsign: p.callsign,
              heading: p.heading ?? 0,
              altitude: p.altitude ?? 0
            }
          }))
        );
        planesSource.setData(planesGeojson);
      }

      // Trains
      // const trainsSource = map.current.getSource('trains') as maplibregl.GeoJSONSource | undefined;
      // if (trainsSource) {
      //   const trains = globalCache.getSncfCache();
      //   const trainsGeojson = toGeoJsonFeatureCollection(
      //     trains.map((t: any) => ({
      //       long: t.longitude,
      //       lat: t.latitude,
      //       properties: { name: t.name ?? t.trainNumber ?? '' }
      //     }))
      //   );
      //   trainsSource.setData(trainsGeojson);
      // }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="france-map-wrapper">
      <div ref={mapContainer} className="map-container" />
    </div>
  );
}