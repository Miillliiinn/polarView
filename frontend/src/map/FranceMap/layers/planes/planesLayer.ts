import maplibregl from 'maplibre-gl';
import api from '../../../../api/apiBridge';
import { globalCache } from '../../../../api/classCache';
import { registerAllPlaneIcons } from '../../icons/planeType/utils/iconRegistry';
import { type PlaneIconType } from '../../icons/planeType/utils/planeIconResolver';
import { ALTITUDE_STOPS, type AltitudeStop } from '../../icons/planeType/utils/altitudeColors';

const LAYER_ID = 'planes-layer';

export const PLANE_TYPE_LABELS: Partial<Record<PlaneIconType, string>> = {
  // 1. Avions commerciaux & jets les plus courants
  L2J: 'Bimoteur commercial / Bijet',
  L4J: 'Quadrijet (gros porteur)',
  L3J: 'Trijet',

  // 2. Aviation générale & turbopropulseurs légers
  L1P: 'Monomoteur léger',
  L2P: 'Bimoteur léger',
  L2T: 'Biturbopropulseur',
  L1T: 'Monoturbopropulseur',

  // 3. Hélicoptères
  H1P: 'Hélicoptère léger',
  H2T: 'Hélicoptère biturbine',
  H3T: 'Hélicoptère lourd',

  // 4. Appareils militaires
  JETM: 'Avion de chasse',
  L2JM: 'Bijet militaire',
  L4JM: 'Quadrijet militaire',
  L2TM: 'Biturbopropulseur militaire',
  L1TM: 'Turbopropulseur militaire',
  L1PM: 'Monomoteur léger militaire',
  L2PM: 'Bimoteur léger militaire',
  L3JM: 'Trijet militaire',

  // 5. Divers & au sol (en dernier)
  uav: 'Drone (UAV)',
  glider: 'Planeur',
  balloon: 'Ballon',
  groundVehicle: 'Véhicule au sol',
};

export const PLANE_TYPES = Object.keys(PLANE_TYPE_LABELS) as PlaneIconType[];

export const ALTITUDE_LABELS: Record<AltitudeStop, string> = {
  ground: 'Au sol',
  taxiing: 'Roulage',
  initial_climb: 'Décollage',
  low_approach: 'Approche basse',
  approach: 'Approche',
  climb: 'Montée',
  low: 'Basse altitude',
  mid: 'Altitude moyenne',
  high: 'Haute altitude',
  cruise: 'Croisière',
  stratosphere: 'Stratosphère',
};

export { ALTITUDE_STOPS };

const listenersAttached = new WeakSet<maplibregl.Map>();

// Filtres actuels par carte. Absence d'entrée == tout est affiché.
const planeTypeFilterByMap = new WeakMap<maplibregl.Map, Set<string>>();
const altitudeFilterByMap = new WeakMap<maplibregl.Map, Set<string>>();

function applyPlaneFilters(map: maplibregl.Map)
{
  if (!map.getLayer(LAYER_ID)) return;

  const types = planeTypeFilterByMap.get(map);
  const altitudes = altitudeFilterByMap.get(map);

  const subFilters: maplibregl.ExpressionSpecification[] = [];

  if (types && types.size < PLANE_TYPES.length) {
    subFilters.push(['in', ['get', 'planeType'], ['literal', Array.from(types)]] as maplibregl.ExpressionSpecification);
  }
  if (altitudes && altitudes.size < ALTITUDE_STOPS.length) {
    subFilters.push(['in', ['get', 'altitudeStop'], ['literal', Array.from(altitudes)]] as maplibregl.ExpressionSpecification);
  }

  const filter: maplibregl.FilterSpecification | null =
    subFilters.length > 0 ? (['all', ...subFilters] as maplibregl.FilterSpecification) : null;

  map.setFilter(LAYER_ID, filter);
}

/** Types d'avions à afficher (voir PLANE_TYPES pour la liste complète). */
export function setPlaneTypeFilter(map: maplibregl.Map, types: string[])
{
  planeTypeFilterByMap.set(map, new Set(types));
  applyPlaneFilters(map);
}

/** Tranches d'altitude à afficher (voir ALTITUDE_STOPS). */
export function setAltitudeFilter(map: maplibregl.Map, stops: string[])
{
  altitudeFilterByMap.set(map, new Set(stops));
  applyPlaneFilters(map);
}

function onPlaneClick(map: maplibregl.Map) {
  return async (e: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] }) => {
    const feature = e.features?.[0];
    if (!feature) return;

    const icao24 = feature.properties?.icao24;
    if (!icao24) return;

    const cache = globalCache.getOpCache() || [];
    const planeData = cache.find((f) => f.icao24 === icao24);

    const callsign = feature.properties?.callsign || planeData?.callsign || 'Vol inconnu';
    const altitude = feature.properties?.altitude ?? planeData?.altitude ?? '?';
    const coordinates = (feature.geometry as any).coordinates;

    //const kind = planeData?.kind ?? 'N/A';
    const source = planeData?.source ?? 'N/A';
    const icaoAircraftClass = planeData?.icaoAircraftClass ?? 'N/A';
    const typeLabel = planeData?.typeLabel ?? 'N/A';
    const model = planeData?.model ?? 'N/A';
    const vel = planeData?.velocity;

    const mod = typeLabel ?? model ?? 'plane';

    const buildContent = (photoHtml: string) => `
      Model: <strong>${mod}</strong><br/>
      Icao: <strong>${icao24}</strong><br />
      Icao Class : <strong>${icaoAircraftClass}</strong><br />
      Callsign: <strong>${callsign}</strong><br/>
      Altitude: <strong>${altitude} m</strong><br/>
      source: <strong>${source}</strong><br />
      Vitesse: <strong>${vel != null ? (vel * 3.6).toFixed(1) : '?'} km/h</strong></br>
      <div id="photo-container">${photoHtml}</div>
    `;

    const existing = (map as any)._planesActivePopup as maplibregl.Popup | undefined;
    if (existing) existing.remove();

    const popup = new maplibregl.Popup()
      .setLngLat(coordinates)
      .setHTML(buildContent('<em>Chargement de la photo...</em>'))
      .addTo(map);

    (map as any)._planesActivePopup = popup;

    try
    {
      const res = await api.get(`/planes/${icao24}/picture`);
      const photo = res.data;

      if (popup.isOpen()) {
        const container = popup.getElement().querySelector('#photo-container');
        if (container)
        {
          container.innerHTML = photo?.thumbnailSrc
            ? `<img src="${photo.thumbnailSrc}" width="210" class="popup-photo-img" style="border-radius:4px;margin-top:4px;cursor:zoom-in;" /><br/><small><small>🖼️ ${photo.photographer || 'Inconnu'}</small></small>`
            : `<em>Aucune photo disponible</em>`;
        }
      }
    }
    catch (err)
    {
      console.error('Erreur récupération photo avion :', err);
      if (popup.isOpen()) {
        const container = popup.getElement().querySelector('#photo-container');
        if (container) {
          container.innerHTML = `<em>Aucune photo disponible (Erreur serveur)</em>`;
        }
      }
    }
  };
}

function attachPlaneListeners(map: maplibregl.Map) {
  if (listenersAttached.has(map)) return; // déjà attachés, on ne fait rien

  map.on('click', LAYER_ID, onPlaneClick(map));

  map.on('mouseenter', LAYER_ID, () => {
    map.getCanvas().style.cursor = 'pointer';
  });
  map.on('mouseleave', LAYER_ID, () => {
    map.getCanvas().style.cursor = '';
  });

  listenersAttached.add(map);
}

export function setupPlanesLayer(map: maplibregl.Map)
{
  registerAllPlaneIcons(map);

  if (!map.getSource('planes'))
  {
    map.addSource('planes', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] }
    });
  }

  if (!map.getLayer(LAYER_ID)) {
    map.addLayer({
      id: LAYER_ID,
      type: 'symbol',
      source: 'planes',
      layout: {
        'icon-image': ['coalesce', ['get', 'iconKey'], 'plane-generic-mid'],
        'icon-size': 0.5,
        'icon-rotate': ['coalesce', ['get', 'heading'], 0],
        'icon-rotation-alignment': 'map',
        'icon-allow-overlap': true,
        visibility: 'none'
      }
    });
  }

  attachPlaneListeners(map);

  // Le layer est recréé (nouveau style, reprise après perte de contexte
  // WebGL) sans filtre : on réapplique la sélection type/altitude connue.
  applyPlaneFilters(map);
}

export function togglePlaneLayer(map: maplibregl.Map, visible: boolean) {
  if (!map.getLayer(LAYER_ID)) return;
  map.setLayoutProperty(LAYER_ID, 'visibility', visible ? 'visible' : 'none');
}

/*
    registration: <strong>${registration}</strong><br/>
    longitude: <strong>${longitude}</strong><br/>
    latitude: <strong>${latitude}</strong><br/>
    onGround: <strong>${onGround}</strong><br/>
    verticalRate: <strong>${verticalRate}</strong><br/>
    squawk: <strong>${squawk}</strong><br/>
    typeCode: <strong>${typeCode}</strong><br/>
    typeLabel: <strong>${typeLabel}</strong><br/>
    engine: <strong>${engine}</strong><br/>
    kind: <strong>${kind}</strong><br/>
    isMilitary: <strong>${isMilitary}</strong><br/>
    isHelicopter: <strong>${isHelicopter}</strong><br/>
    source: <strong>${source}</strong><br />
    icaoAircraftClass : <strong>${icaoAircraftClass}</strong><br />
    manufacturerIcao : <strong>${manufacturerIcao}</strong><br />
    manufacturerName : <strong>${manufacturerName}</strong><br />
    manufacturerName : <strong>${manufacturerName}</strong><br />
    model : <strong>${model}</strong><br />
    operator : <strong>${operator}</strong><br />
    owner : <strong>${owner}</strong><br />
    typecode : <strong>${typecode}</strong><br />

    <br>-----</br>

    Callsign: <strong>${callsign}</strong><br/>
    Country: <strong>${originCountry}</strong></br>
    Altitude: <strong>${altitude} m</strong><br/>
    Cap: <strong>${heading ?? '?'} °</strong></br>
    Vitesse: <strong>${vel != null ? (vel * 3.6).toFixed(1) : '?'} km/h</strong></br>
    <div id="photo-container">${photoHtml}</div>


    ///



  const cache = globalCache.getOpCache() || [];
  const planeData = cache.find((f) => f.icao24 === icao24);

  const callsign = feature.properties?.callsign || planeData?.callsign || 'Vol inconnu';
  const altitude = feature.properties?.altitude ?? planeData?.altitude ?? '?';
  const heading = feature.properties?.heading ?? planeData?.heading ?? null;
  const coordinates = (feature.geometry as any).coordinates;

  const originCountry = planeData?.originCountry ?? 'Inconnu';
  const registration = planeData?.registration ?? 'N/A';
  const longitude = planeData?.longitude ?? coordinates[0];
  const latitude = planeData?.latitude ?? coordinates[1];
  const onGround = planeData?.onGround ?? 'N/A';
  const verticalRate = planeData?.verticalRate ?? 'N/A';
  const squawk = planeData?.squawk ?? 'N/A';
  const typeCode = planeData?.typeCode ?? 'N/A';
  const typeLabel = planeData?.typeLabel ?? 'N/A';
  const engine = planeData?.engines ?? 'N/A';
  const kind = planeData?.kind ?? 'N/A';
  const isMilitary = planeData?.isMilitary ?? 'N/A';
  const isHelicopter = planeData?.isHelicopter ?? 'N/A';
  //const lastSeen = planeData?.lastSeenSeconds ?? 'N/A';
  const source = planeData?.source ?? 'N/A';
  const icaoAircraftClass = planeData?.icaoAircraftClass ?? 'N/A';
  const manufacturerIcao = planeData?.manufacturerIcao ?? 'N/A';
  const manufacturerName = planeData?.manufacturerName ?? 'N/A';
  const model = planeData?.model ?? 'N/A';
  const operator = planeData?.operator ?? 'N/A';
  const owner = planeData?.owner ?? 'N/A';
  const typecode = planeData?.typecode ?? 'N/A';
  const vel = planeData?.velocity;

  const mod = typeLabel ?? model ?? "plane";

*/