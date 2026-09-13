import maplibregl from 'maplibre-gl';
import { globalCache } from '../../../../api/classCache';
import { toGeoJsonFeatureCollection } from '../../../../api/geoJsonConvertion';
import {
  buildSatrecCache,
  computeGroundTrack,
  propagateOne,
  type CelestrakOmm,
  type SatellitePosition,
  type SatRecEntry,
} from './satelliteEphemeris';

const SOURCE_POINTS = 'satellites';
const SOURCE_TRACK = 'satellites-track';
const LAYER_POINTS = 'satellites-layer';
const LAYER_LABELS = 'satellites-labels-layer';
const LAYER_TRACK = 'satellites-track-layer';

// Cadence de rendu de la position : contrairement aux avions (qui
// extrapolent entre deux fixes ADS-B), un satellite a un modèle physique
// complet (SGP4) donc sa position exacte est calculable à tout instant.
// Une cadence rapide = un mouvement fluide, sans jump visible, sans
// avoir besoin d'interpoler quoi que ce soit.
const POSITION_RENDER_INTERVAL_MS = 100;

// La trajectoire (ground track) du satellite sélectionné ne change presque
// pas d'une frame à l'autre : on la recalcule à part, moins souvent.
const TRACK_REFRESH_INTERVAL_MS = 4000;
const TRACK_PAST_MIN = 15;
const TRACK_FUTURE_MIN = 45;
const TRACK_STEP_SEC = 30;

// Marge ajoutée autour du viewport visible pour que les satellites
// n'apparaissent/disparaissent pas brutalement pile sur le bord de l'écran.
const VIEWPORT_MARGIN_DEG = 5;

function normalizeLon(lon: number): number {
  return ((lon + 180) % 360 + 360) % 360 - 180;
}

/**
 * Teste si (lon, lat) tombe dans les limites visibles de la carte (+ marge),
 * en gérant le cas où le viewport traverse l'antiméridien (west > east
 * après normalisation).
 */
function isInViewport(lon: number, lat: number, bounds: maplibregl.LngLatBounds): boolean {
  const south = bounds.getSouth() - VIEWPORT_MARGIN_DEG;
  const north = bounds.getNorth() + VIEWPORT_MARGIN_DEG;
  if (lat < south || lat > north) return false;

  const west = normalizeLon(bounds.getWest() - VIEWPORT_MARGIN_DEG);
  const east = normalizeLon(bounds.getEast() + VIEWPORT_MARGIN_DEG);
  const lonN = normalizeLon(lon);

  if (west <= east) return lonN >= west && lonN <= east;
  // Le viewport traverse l'antiméridien (±180°)
  return lonN >= west || lonN <= east;
}

const listenersAttached = new WeakSet<maplibregl.Map>();
const celestUnsubscribeByMap = new WeakMap<maplibregl.Map, () => void>();
const positionTimerByMap = new WeakMap<maplibregl.Map, ReturnType<typeof setInterval>>();
const trackTimerByMap = new WeakMap<maplibregl.Map, ReturnType<typeof setInterval>>();
const satrecCacheByMap = new WeakMap<maplibregl.Map, Map<number, SatRecEntry>>();

function emptyFC(): GeoJSON.FeatureCollection {
  return { type: 'FeatureCollection', features: [] };
}

function satellitesToFeatureCollection(
  positions: SatellitePosition[],
  selectedId: number | null
): GeoJSON.FeatureCollection {
  return toGeoJsonFeatureCollection(
    positions.map((pos) => ({
      long: pos.longitude,
      lat: pos.latitude,
      properties: {
        id: pos.id,
        name: pos.name,
        altitudeKm: Math.round(pos.altitudeKm),
        velocityKmS: Number(pos.velocityKmS.toFixed(2)),
        selected: pos.id === selectedId,
      },
    }))
  );
}

function addSatellitesSourceAndLayers(map: maplibregl.Map) {
  if (!map.getSource(SOURCE_POINTS)) {
    map.addSource(SOURCE_POINTS, { type: 'geojson', data: emptyFC() });
  }
  if (!map.getSource(SOURCE_TRACK)) {
    map.addSource(SOURCE_TRACK, { type: 'geojson', data: emptyFC() });
  }

  if (!map.getLayer(LAYER_TRACK)) {
    map.addLayer({
      id: LAYER_TRACK,
      type: 'line',
      source: SOURCE_TRACK,
      layout: { visibility: 'none', 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': '#ffcc00',
        'line-width': 1.5,
        'line-dasharray': [2, 2],
        'line-opacity': 0.85,
      },
    });
  }

  if (!map.getLayer(LAYER_POINTS)) {
    map.addLayer({
      id: LAYER_POINTS,
      type: 'circle',
      source: SOURCE_POINTS,
      layout: { visibility: 'none' },
      paint: {
        'circle-radius': ['case', ['get', 'selected'], 5, 3],
        'circle-color': ['case', ['get', 'selected'], '#ffcc00', '#66d9ff'],
        'circle-stroke-width': 1,
        'circle-stroke-color': '#0a2a3a',
      },
    });
  }

  if (!map.getLayer(LAYER_LABELS)) {
    map.addLayer({
      id: LAYER_LABELS,
      type: 'symbol',
      source: SOURCE_POINTS,
      layout: {
        visibility: 'none',
        'text-field': ['get', 'name'],
        'text-font': ['Noto Sans Regular'],
        'text-size': 10,
        'text-offset': [0, 1.1],
        'text-anchor': 'top',
        'text-optional': true,
      },
      paint: {
        'text-color': '#e8f6ff',
        'text-halo-color': '#001018',
        'text-halo-width': 1,
      },
    });
  }
}

function clearTrack(map: maplibregl.Map) {
  const trackSource = map.getSource(SOURCE_TRACK) as maplibregl.GeoJSONSource | undefined;
  trackSource?.setData(emptyFC());
}

function setSelectedSatellite(map: maplibregl.Map, id: number | null) {
  (map as any)._satellitesSelectedId = id;
  if (id === null) {
    clearTrack(map);
  } else {
    refreshTrack(map);
  }
}

function getSelectedSatellite(map: maplibregl.Map): number | null {
  return (map as any)._satellitesSelectedId ?? null;
}

function deselectSatellite(map: maplibregl.Map) {
  setSelectedSatellite(map, null);
  const popup = (map as any)._satellitesActivePopup as maplibregl.Popup | undefined;
  popup?.remove();
  (map as any)._satellitesActivePopup = undefined;
}

function setupSatellitesClickPopup(map: maplibregl.Map) {
  if (listenersAttached.has(map)) return;

  map.on('click', LAYER_POINTS, (e) => {
    const feature = e.features?.[0];
    if (!feature) return;

    const props = feature.properties ?? {};
    const id = props.id as number;
    const coordinates = (feature.geometry as any).coordinates;

    setSelectedSatellite(map, id);

    const existing = (map as any)._satellitesActivePopup as maplibregl.Popup | undefined;
    if (existing) existing.remove();

    const popup = new maplibregl.Popup({ closeButton: true, closeOnClick: false })
      .setLngLat(coordinates)
      .setHTML(`
        Nom: <strong>${props.name ?? 'Satellite'}</strong><br/>
        NORAD ID: <strong>${id}</strong><br/>
        Altitude: <strong>${props.altitudeKm} km</strong><br/>
        Vitesse: <strong>${props.velocityKmS} km/s</strong><br/>
      `)
      .addTo(map);

    popup.on('close', () => {
      if (getSelectedSatellite(map) === id) deselectSatellite(map);
    });

    (map as any)._satellitesActivePopup = popup;
  });

  // Clic ailleurs sur la carte (pas sur un satellite) -> on retire le popup
  // et la trajectoire. queryRenderedFeatures re-vérifie le même point : si
  // le clic vient d'atteindre un satellite, le handler ci-dessus l'a déjà
  // sélectionné et on le retrouve ici, donc pas de désélection accidentelle.
  map.on('click', (e) => {
    if (!map.getLayer(LAYER_POINTS)) return;
    const hits = map.queryRenderedFeatures(e.point, { layers: [LAYER_POINTS] });
    if (hits.length === 0) deselectSatellite(map);
  });

  map.on('mouseenter', LAYER_POINTS, () => {
    map.getCanvas().style.cursor = 'pointer';
  });
  map.on('mouseleave', LAYER_POINTS, () => {
    map.getCanvas().style.cursor = '';
  });

  listenersAttached.add(map);
}

function refreshSatrecs(map: maplibregl.Map) {
  const omms = globalCache.getCelestrackCache() as CelestrakOmm[];
  const previous = satrecCacheByMap.get(map) ?? new Map<number, SatRecEntry>();
  satrecCacheByMap.set(map, buildSatrecCache(omms, previous));
}

function updatePositions(map: maplibregl.Map) {
  const satrecCache = satrecCacheByMap.get(map);
  if (!satrecCache) return;

  const now = new Date();
  const selectedId = getSelectedSatellite(map);
  const bounds = map.getBounds();
  const positions: SatellitePosition[] = [];

  satrecCache.forEach((entry) => {
    const pos = propagateOne(entry, now);
    if (!pos) return;
    // Le satellite sélectionné reste affiché même s'il sort du cadre, pour
    // ne pas perdre le point qu'on est en train de suivre.
    if (pos.id === selectedId || isInViewport(pos.longitude, pos.latitude, bounds)) {
      positions.push(pos);
    }
  });

  const source = map.getSource(SOURCE_POINTS) as maplibregl.GeoJSONSource | undefined;
  source?.setData(satellitesToFeatureCollection(positions, selectedId));
}

function refreshTrack(map: maplibregl.Map) {
  const selectedId = getSelectedSatellite(map);
  if (selectedId === null) return;

  const satrecCache = satrecCacheByMap.get(map);
  const entry = satrecCache?.get(selectedId);
  const trackSource = map.getSource(SOURCE_TRACK) as maplibregl.GeoJSONSource | undefined;
  if (!entry || !trackSource) return;

  const segments = computeGroundTrack(entry, new Date(), TRACK_PAST_MIN, TRACK_FUTURE_MIN, TRACK_STEP_SEC);
  trackSource.setData({
    type: 'FeatureCollection',
    features: segments.map((coords) => ({
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: coords },
      properties: { id: selectedId },
    })),
  });
}

export function setupSatellitesLayer(map: maplibregl.Map): () => void {
  addSatellitesSourceAndLayers(map);
  setupSatellitesClickPopup(map);

  refreshSatrecs(map);
  updatePositions(map);

  if (!celestUnsubscribeByMap.has(map)) {
    const unsubscribe = globalCache.subscribeCelest(() => {
      refreshSatrecs(map);
      updatePositions(map);
    });
    celestUnsubscribeByMap.set(map, unsubscribe);
  }

  if (positionTimerByMap.has(map)) clearInterval(positionTimerByMap.get(map)!);
  positionTimerByMap.set(map, setInterval(() => updatePositions(map), POSITION_RENDER_INTERVAL_MS));

  if (trackTimerByMap.has(map)) clearInterval(trackTimerByMap.get(map)!);
  trackTimerByMap.set(map, setInterval(() => refreshTrack(map), TRACK_REFRESH_INTERVAL_MS));

  return () => {
    const posTimer = positionTimerByMap.get(map);
    if (posTimer) clearInterval(posTimer);
    positionTimerByMap.delete(map);

    const trackTimer = trackTimerByMap.get(map);
    if (trackTimer) clearInterval(trackTimer);
    trackTimerByMap.delete(map);

    const unsubscribe = celestUnsubscribeByMap.get(map);
    if (unsubscribe) {
      unsubscribe();
      celestUnsubscribeByMap.delete(map);
    }

    deselectSatellite(map);

    satrecCacheByMap.delete(map);

    if (map.getLayer(LAYER_LABELS)) map.removeLayer(LAYER_LABELS);
    if (map.getLayer(LAYER_POINTS)) map.removeLayer(LAYER_POINTS);
    if (map.getLayer(LAYER_TRACK)) map.removeLayer(LAYER_TRACK);
    if (map.getSource(SOURCE_POINTS)) map.removeSource(SOURCE_POINTS);
    if (map.getSource(SOURCE_TRACK)) map.removeSource(SOURCE_TRACK);
  };
}

export function toggleSatellitesLayer(map: maplibregl.Map, visible: boolean) {
  const vis = visible ? 'visible' : 'none';
  if (map.getLayer(LAYER_POINTS)) map.setLayoutProperty(LAYER_POINTS, 'visibility', vis);
  if (map.getLayer(LAYER_LABELS)) map.setLayoutProperty(LAYER_LABELS, 'visibility', vis);
  if (map.getLayer(LAYER_TRACK)) map.setLayoutProperty(LAYER_TRACK, 'visibility', vis);
  if (!visible) {
    deselectSatellite(map);
  }
}