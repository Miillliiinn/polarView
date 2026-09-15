import maplibregl from 'maplibre-gl';
import { globalCache } from '../../../../api/classCache';
import { toGeoJsonFeatureCollection } from '../../../../api/geoJsonConvertion';
import type { CelestrakOmm, SatellitePosition } from './satelliteEphemeris';
import { type ViewportBounds } from './geoUtils';
import { createSatelliteIcon } from '../../icons/satellite/satelliteIcon';

const SOURCE_POINTS = 'satellites';
const SOURCE_TRACK = 'satellites-track';
const LAYER_POINTS = 'satellites-layer';
const LAYER_LABELS = 'satellites-labels-layer';
const LAYER_TRACK = 'satellites-track-layer';

// Marge ajoutée autour du viewport visible pour que les satellites
// n'apparaissent/disparaissent pas brutalement pile sur le bord de l'écran.
const VIEWPORT_MARGIN_DEG = 5;

// Icônes satellite (canvas -> ImageData -> map.addImage). Deux tailles/
// couleurs : normal et sélectionné. Une icône pleine grandeur agrandit
// mécaniquement la zone cliquable par rapport à l'ancien point de 3-5px.
const ICON_ID = 'satellite-icon';
const ICON_ID_SELECTED = 'satellite-icon-selected';
const ICON_SIZE = 28;
const ICON_SIZE_SELECTED = 36;
const ICON_COLOR = '#66d9ff';
const ICON_COLOR_SELECTED = '#ffcc00';

function ensureSatelliteImages(map: maplibregl.Map) {
  if (!map.hasImage(ICON_ID)) {
    map.addImage(ICON_ID, createSatelliteIcon(ICON_COLOR, ICON_SIZE));
  }
  if (!map.hasImage(ICON_ID_SELECTED)) {
    map.addImage(ICON_ID_SELECTED, createSatelliteIcon(ICON_COLOR_SELECTED, ICON_SIZE_SELECTED));
  }
}

// ---------------------------------------------------------------------------
// Le calcul lourd (SGP4, ground track) a été déplacé dans satelliteWorker.ts.
// Ce fichier ne fait plus que :
//  - piloter les sources/layers maplibre (thread principal, obligatoire)
//  - transmettre au worker les infos dont il a besoin (données OMM, viewport,
//    satellite sélectionné)
//  - injecter dans les sources les GeoJSON reçus du worker
// ---------------------------------------------------------------------------

type WorkerOutboundMessage =
  | { type: 'positions'; positions: SatellitePosition[]; selectedId: number | null }
  | { type: 'track'; segments: number[][][]; selectedId: number };

const listenersAttached = new WeakSet<maplibregl.Map>();
const celestUnsubscribeByMap = new WeakMap<maplibregl.Map, () => void>();
const workerByMap = new WeakMap<maplibregl.Map, Worker>();
const moveHandlerByMap = new WeakMap<maplibregl.Map, () => void>();
const cleanupByMap = new WeakMap<maplibregl.Map, () => void>();

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

function trackToFeatureCollection(
  segments: number[][][],
  selectedId: number
): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: segments.map((coords) => ({
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: coords },
      properties: { id: selectedId },
    })),
  } as GeoJSON.FeatureCollection;
}

function boundsToViewport(bounds: maplibregl.LngLatBounds): ViewportBounds {
  return {
    south: bounds.getSouth() - VIEWPORT_MARGIN_DEG,
    north: bounds.getNorth() + VIEWPORT_MARGIN_DEG,
    west: bounds.getWest() - VIEWPORT_MARGIN_DEG,
    east: bounds.getEast() + VIEWPORT_MARGIN_DEG,
  };
}

function addSatellitesSourceAndLayers(map: maplibregl.Map) {
  ensureSatelliteImages(map);

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
        'line-color': '#b59100',
        'line-width': 1.5,
        'line-dasharray': [2, 2],
        'line-opacity': 0.85,
      },
    });
  }

  if (!map.getLayer(LAYER_POINTS)) {
    map.addLayer({
      id: LAYER_POINTS,
      type: 'symbol',
      source: SOURCE_POINTS,
      layout: {
        visibility: 'none',
        'icon-image': ['case', ['get', 'selected'], ICON_ID_SELECTED, ICON_ID],
        'icon-size': 1,
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
      },
    });
  }

if (!map.getLayer(LAYER_LABELS)) {
    map.addLayer({
      id: LAYER_LABELS,
      type: 'symbol',
      source: SOURCE_POINTS,
      layout: {
        visibility: 'visible', 
        'text-field': ['get', 'name'],
        'text-font': ['Noto Sans Regular'],
        'text-size': 12,
        'text-offset': [0, 1.6],
        'text-anchor': 'top',
        'text-allow-overlap': true,    
        'text-ignore-placement': true,
        'text-optional': false,       
      },
      paint: {
        'text-color': '#e8f6ff',
        'text-halo-color': '#001018',
        'text-halo-width': 1,
      },
    });
  }
}//001018

function clearTrack(map: maplibregl.Map) {
  const trackSource = map.getSource(SOURCE_TRACK) as maplibregl.GeoJSONSource | undefined;
  trackSource?.setData(emptyFC());
}

function setSelectedSatellite(map: maplibregl.Map, id: number | null) {
  (map as any)._satellitesSelectedId = id;
  const worker = workerByMap.get(map);
  worker?.postMessage({ type: 'selected', id });
  if (id === null) {
    clearTrack(map);
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

function getOmmById(id: number): CelestrakOmm | undefined {
  const omms = globalCache.getCelestrackCache() as CelestrakOmm[];
  return omms.find((o) => o.id === id);
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

    const omm = getOmmById(id);

    const objectId = omm?.objectId;
    const meanMotion = omm?.meanMotion;
    const eccentricity = omm?.eccentricity;
    const inclination = omm?.inclination;
    const raOfAscNode = omm?.raOfAscNode;
    const argOfPericenter = omm?.argOfPericenter;
    const meanAnomaly = omm?.meanAnomaly;
    const ephemerisType = omm?.ephemerisType;
    const classificationType = omm?.classificationType;
    const elementSetNo = omm?.elementSetNo;
    const revAtEpoch = omm?.revAtEpoch;
    const bstar = omm?.bstar;
    const meanMotionDot = omm?.meanMotionDot;
    const meanMotionDdot = omm?.meanMotionDdot;

    // omm.epoch est une string ISO : on la parse une seule fois en Date,
    // et c'est CE Date (epochDate) qu'on réutilise partout ensuite —
    // jamais la string brute, qui n'a pas de .getTime().
    const epochDate = omm?.epoch ? new Date(omm.epoch) : null;
    const formattedDate = epochDate
      ? epochDate.toLocaleString('fr-FR', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'N/A';

    // Date de lancement estimée à partir du nombre de révolutions et de la
    // période orbitale (approximation ; omm.launchDate donne la vraie date
    // si tu préfères l'utiliser directement).
    const rev = Number(revAtEpoch);
    const mm = Number(meanMotion);
    let launchDateFormatted = 'N/A';

    if (epochDate && rev > 0 && mm > 0) {
      const daysInOrbit = rev / mm;
      const launchTimestamp = epochDate.getTime() - daysInOrbit * 24 * 60 * 60 * 1000;
      const launchDate = new Date(launchTimestamp);
      launchDateFormatted = launchDate.toLocaleString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    const popup = new maplibregl.Popup({ closeButton: true, closeOnClick: false })
      .setLngLat(coordinates)
      .setHTML(`
        Nom: <strong>${props.name ?? 'Satellite'}</strong><br/>
        Start: <strong style="font-size: 0.90em; font-weight: 1200;">${launchDateFormatted}</strong><br/>
        NORAD ID: <strong>${id}</strong><br/>
        Altitude: <strong>${props.altitudeKm} km</strong><br/>
        Vitesse: <strong>${props.velocityKmS * 3600} km/h</strong><br/>
        Last signal: <strong style="font-size: 0.90em; font-weight: 1200;">${formattedDate}</strong><br/>
        objectId: <strong>${objectId}</strong></br>
        Tour d'orbite / jour: <strong>${meanMotion?.toFixed(2)}</strong></br>
        Eccentricity: <strong>${eccentricity}</strong></br>
        Inclinaison: <strong>${inclination}</strong></br>
        RaOfAscNode: <strong>${raOfAscNode}</strong></br>
        ArgOfPericenter: <strong>${argOfPericenter}</strong></br>
        Mean Anomaly: <strong>${meanAnomaly}</strong></br>
        Ephemeris Type: <strong>${ephemerisType}</strong></br>
        Classification Type: <strong>${classificationType}</strong></br>
        ElementSetNo: <strong>${elementSetNo}</strong></br>
        Tour d'orbite total: <strong>${revAtEpoch}</strong></br>
        Bstar: <strong>${bstar}</strong></br>
        Mean Motion Dot: <strong>${meanMotionDot}</strong></br>
        Mean Motion Ddot: <strong>${meanMotionDdot}</strong></br>
      `)
      .addTo(map);

    popup.on('close', () => {
      if (getSelectedSatellite(map) === id) deselectSatellite(map);
    });

    (map as any)._satellitesActivePopup = popup;
  });

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

function handleWorkerMessage(map: maplibregl.Map, e: MessageEvent<WorkerOutboundMessage>) {
  const msg = e.data;
  if (msg.type === 'positions') {
    const source = map.getSource(SOURCE_POINTS) as maplibregl.GeoJSONSource | undefined;
    source?.setData(satellitesToFeatureCollection(msg.positions, msg.selectedId));
    return;
  }
  if (msg.type === 'track') {
    // On ignore un track qui arriverait pour un satellite qui n'est plus
    // sélectionné (message en vol au moment d'un changement de sélection).
    if (msg.selectedId !== getSelectedSatellite(map)) return;
    const trackSource = map.getSource(SOURCE_TRACK) as maplibregl.GeoJSONSource | undefined;
    trackSource?.setData(trackToFeatureCollection(msg.segments, msg.selectedId));
  }
}

export function setupSatellitesLayer(map: maplibregl.Map): () => void {
  // Idempotence : si setupSatellitesLayer est rappelée sur le même map sans
  // que le cleanup précédent ait été exécuté (remount de composant, double
  // appel, hot reload...), on nettoie d'abord l'ancienne instance. Sans ça,
  // le vieux Worker n'est jamais terminé et continue de tourner en tâche de
  // fond (propagation SGP4 + postMessage à 50ms, indéfiniment) : c'est le
  // scénario typique d'un ralentissement qui s'aggrave avec le temps.
  const previousCleanup = cleanupByMap.get(map);
  if (previousCleanup) {
    previousCleanup();
  }

  addSatellitesSourceAndLayers(map);
  setupSatellitesClickPopup(map);

  // Le calcul lourd (SGP4 + ground track) tourne dans ce worker, hors du
  // thread principal, pour laisser le rendu (avions, bateaux, carte) fluide.
  const worker = new Worker(new URL('./satelliteWorker.ts', import.meta.url), { type: 'module' });
  worker.onmessage = (e: MessageEvent<WorkerOutboundMessage>) => handleWorkerMessage(map, e);
  workerByMap.set(map, worker);

  worker.postMessage({ type: 'omms', omms: globalCache.getCelestrackCache() as CelestrakOmm[] });
  worker.postMessage({ type: 'viewport', bounds: boundsToViewport(map.getBounds()) });
  worker.postMessage({ type: 'selected', id: getSelectedSatellite(map) });
  // Le worker reste volontairement à l'arrêt tant que la couche n'est pas
  // affichée. C'est toggleSatellitesLayer() qui envoie 'start'/'stop' selon
  // la visibilité réelle — sinon le calcul SGP4 à 20Hz tourne en tâche de
  // fond dès le chargement de la page, même si l'utilisateur n'a jamais
  // cliqué sur "Satellites" (visibleSatellites vaut false par défaut).

  if (!celestUnsubscribeByMap.has(map)) {
    const unsubscribe = globalCache.subscribeCelest(() => {
      worker.postMessage({ type: 'omms', omms: globalCache.getCelestrackCache() as CelestrakOmm[] });
    });
    celestUnsubscribeByMap.set(map, unsubscribe);
  }

  // Le viewport ne change pas à chaque frame : on ne l'envoie au worker
  // qu'après un pan/zoom, pas toutes les 50ms.
  const onMoveEnd = () => {
    worker.postMessage({ type: 'viewport', bounds: boundsToViewport(map.getBounds()) });
  };
  map.on('moveend', onMoveEnd);
  moveHandlerByMap.set(map, onMoveEnd);

  const cleanup = () => {
    worker.postMessage({ type: 'stop' });
    worker.terminate();
    workerByMap.delete(map);

    const onMoveEndHandler = moveHandlerByMap.get(map);
    if (onMoveEndHandler) map.off('moveend', onMoveEndHandler);
    moveHandlerByMap.delete(map);

    const unsubscribe = celestUnsubscribeByMap.get(map);
    if (unsubscribe) {
      unsubscribe();
      celestUnsubscribeByMap.delete(map);
    }

    deselectSatellite(map);

    if (map.getLayer(LAYER_LABELS)) map.removeLayer(LAYER_LABELS);
    if (map.getLayer(LAYER_POINTS)) map.removeLayer(LAYER_POINTS);
    if (map.getLayer(LAYER_TRACK)) map.removeLayer(LAYER_TRACK);
    if (map.getSource(SOURCE_POINTS)) map.removeSource(SOURCE_POINTS);
    if (map.getSource(SOURCE_TRACK)) map.removeSource(SOURCE_TRACK);

    cleanupByMap.delete(map);
  };

  cleanupByMap.set(map, cleanup);
  return cleanup;
}

export function toggleSatellitesLayer(map: maplibregl.Map, visible: boolean) {
  const vis = visible ? 'visible' : 'none';
  if (map.getLayer(LAYER_POINTS)) map.setLayoutProperty(LAYER_POINTS, 'visibility', vis);
  if (map.getLayer(LAYER_LABELS)) map.setLayoutProperty(LAYER_LABELS, 'visibility', vis);
  if (map.getLayer(LAYER_TRACK)) map.setLayoutProperty(LAYER_TRACK, 'visibility', vis);

  const worker = workerByMap.get(map);
  worker?.postMessage({ type: visible ? 'start' : 'stop' });

  if (!visible) {
    deselectSatellite(map);
  }
}