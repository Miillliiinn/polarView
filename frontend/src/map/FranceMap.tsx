import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './FranceMap.css';
import { toGeoJsonFeatureCollection } from '../api/geoJsonConvertion';
import { globalCache } from '../api/classCache';
import api from '../api/apiBridge';
import { applyVigilanceColors } from './meteofranceFeature';

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
  ctx.moveTo(0, -45 * s);
  ctx.lineTo(4 * s, -30 * s);
  ctx.lineTo(4 * s, -5 * s);
  ctx.lineTo(42 * s, 12 * s);
  ctx.lineTo(42 * s, 18 * s);
  ctx.lineTo(5 * s, 8 * s);
  ctx.lineTo(5 * s, 28 * s);
  ctx.lineTo(16 * s, 38 * s);
  ctx.lineTo(16 * s, 43 * s);
  ctx.lineTo(2 * s, 35 * s);
  ctx.lineTo(0, 45 * s);
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

const VIGILANCE_COLORS: Record<number, string> = {
  1: '#2fa84f',
  2: '#ffd500',
  3: '#ff8c00',
  4: '#e30613',
};

export default function FranceMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [vigilanceVisible, setVigilanceVisible] = useState(false);

  useEffect(() => {
    if (map.current) return;

    const mapInstance = new maplibregl.Map({
      container: mapContainer.current!,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      bounds: FRANCE_BOUNDS,
      fitBoundsOptions: { padding: 100 },
      maxBounds: [
        [FRANCE_BOUNDS[0][0] - 2, FRANCE_BOUNDS[0][1] - 2],
        [FRANCE_BOUNDS[1][0] + 2, FRANCE_BOUNDS[1][1] + 2]
      ]
    });
    map.current = mapInstance;

    mapInstance.addControl(new maplibregl.NavigationControl(), 'top-right');

    mapInstance.on('error', (e) => {
      console.error('[FranceMap] Erreur MapLibre:', e);
    });

    let vigilanceInterval: ReturnType<typeof setInterval> | null = null;

    mapInstance.on('load', () => {
      if (!map.current) return;

      //////////////////////////////////////////////////////////////////////
      // --- VIGILANCE MÉTÉO FRANCE ---
      //////////////////////////////////////////////////////////////////////

      mapInstance.addSource('departements', {
        type: 'geojson',
        data: 'https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements.geojson',
        promoteId: 'code'
      });

      mapInstance.addLayer({
        id: 'vigilance-fill',
        type: 'fill',
        source: 'departements',
        layout: {
          visibility: 'none' // masqué par défaut
        },
        paint: {
          'fill-color': [
            'match',
            ['feature-state', 'couleur'],
            1, VIGILANCE_COLORS[1],
            2, VIGILANCE_COLORS[2],
            3, VIGILANCE_COLORS[3],
            4, VIGILANCE_COLORS[4],
            'rgba(0,0,0,0)'
          ],
          'fill-opacity': 0.35
        }
      });

      mapInstance.addLayer({
        id: 'vigilance-outline',
        type: 'line',
        source: 'departements',
        layout: {
          visibility: 'none' // masqué par défaut
        },
        paint: {
          'line-color': '#ffffff',
          'line-width': 0.5,
          'line-opacity': 0.4
        }
      });

      const onDepartementsLoaded = (e: maplibregl.MapSourceDataEvent) => {
        if (e.sourceId === 'departements' && e.isSourceLoaded)
        {
          applyVigilanceColors(mapInstance);
        }
      };
      mapInstance.on('sourcedata', onDepartementsLoaded);

      vigilanceInterval = setInterval(() => {
        if (map.current && map.current.isStyleLoaded()) {
          applyVigilanceColors(map.current);
        }
      }, 5000);

      //////////////////////////////////////////////////////////////////////
      // --- AVIONS ---
      //////////////////////////////////////////////////////////////////////

      mapInstance.addImage('plane-ground', createPlaneIcon('#989898', 96));
      mapInstance.addImage('plane-low', createPlaneIcon('#a199ff', 96));
      mapInstance.addImage('plane-mid', createPlaneIcon('#7c70ff', 96));
      mapInstance.addImage('plane-high', createPlaneIcon('#5b4dff', 96));
      mapInstance.addImage('plane-cruise', createPlaneIcon('#1500ff', 96));

      const trainCanvas = createTrainIcon('#457b9d', 64);
      mapInstance.addImage('train-icon', trainCanvas, { pixelRatio: 2 });

      mapInstance.addSource('planes', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      mapInstance.addLayer({
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

      mapInstance.on('click', 'planes-layer', async (e) => {
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
        try {
          const res = await api.get(`/planes/${icao24}/picture`);
          const photo = res.data;
          popup.setHTML(`
              Callsign: <strong>${callsign}</strong><br/>
              Altitude: <strong>${altitude} m</strong><br/>
              ${photo?.thumbnailSrc
                  ? `<img src="${photo.thumbnailSrc}" width="220" style="border-radius:4px;margin-top:4px;" /><br/><small>${photo.photographer || 'Inconnu'}</small>`
                  : `<em>Aucune photo disponible</em>`
              }
          `);
        } catch (err) {
          console.error('Erreur récupération photo avion :', err);
          popup.setHTML(`
              <strong>${callsign}</strong><br/>
              Altitude: ${altitude} m<br/>
              <em>Erreur de chargement de la photo</em>
          `);
        }
      });

      mapInstance.on('mouseenter', 'planes-layer', () => {
        mapInstance.getCanvas().style.cursor = 'pointer';
      });
      mapInstance.on('mouseleave', 'planes-layer', () => {
        mapInstance.getCanvas().style.cursor = '';
      });

      //////////////////////////////////////////////////////////////////////
      // --- TRAINS ---
      //////////////////////////////////////////////////////////////////////

      mapInstance.addSource('trains', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      mapInstance.addLayer({
        id: 'trains-layer',
        type: 'symbol',
        source: 'trains',
        layout: {
          'icon-image': 'train-icon',
          'icon-size': 0.5,
          'icon-allow-overlap': true
        }
      });

      mapInstance.on('click', 'trains-layer', (e) => {
        const feature = e.features?.[0];
        if (!feature || !map.current) return;
        new maplibregl.Popup()
          .setLngLat((feature.geometry as any).coordinates)
          .setHTML(`<strong>${feature.properties?.name || 'Train inconnu'}</strong>`)
          .addTo(map.current);
      });

      mapInstance.on('mouseenter', 'trains-layer', () => {
        mapInstance.getCanvas().style.cursor = 'pointer';
      });
      mapInstance.on('mouseleave', 'trains-layer', () => {
        mapInstance.getCanvas().style.cursor = '';
      });
    });

    return () => {
      if (vigilanceInterval) clearInterval(vigilanceInterval);
      mapInstance.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!map.current || !map.current.isStyleLoaded()) return;

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
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Toggle affichage/masquage de la couche vigilance
  const toggleVigilance = () => {
    if (!map.current || !map.current.getLayer('vigilance-fill')) return;
    const newVisibility = !vigilanceVisible;
    const visibilityValue = newVisibility ? 'visible' : 'none';

    map.current.setLayoutProperty('vigilance-fill', 'visibility', visibilityValue);
    map.current.setLayoutProperty('vigilance-outline', 'visibility', visibilityValue);

    setVigilanceVisible(newVisibility);
  };

  return (
    <div className="france-map-wrapper">
      <div ref={mapContainer} className="map-container" />
      <button className="vigilance-toggle-btn" onClick={toggleVigilance}>
        {vigilanceVisible ? 'Masquer vigilance' : 'Afficher vigilance'}
      </button>
    </div>
  );
}