import maplibregl from 'maplibre-gl';
import api from '../../../../api/apiBridge';
import { globalCache } from '../../../../api/classCache';
import { registerAllPlaneIcons } from '../../icons/planeType/utils/iconRegistry';

// Garde en mémoire, par instance de map, si les listeners "planes-layer"
// ont déjà été attachés. Comme map.on('click', 'planes-layer', ...) est
// une délégation basée sur l'id du layer (et non sur l'objet layer),
// les listeners survivent à un setStyle() / recréation du layer.
// Il ne faut donc les attacher qu'UNE SEULE FOIS par instance de map.
const listenersAttached = new WeakSet<maplibregl.Map>();

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

    const buildContent = (photoHtml: string) => `
      Model: <strong>${mod}</strong><br/>
      Catégorie: <strong>${kind}</strong><br/>
      Icao: <strong>${icao24}</strong><br />
      Icao Class : <strong>${icaoAircraftClass}</strong><br />
      Callsign: <strong>${callsign}</strong><br/>
      Altitude: <strong>${altitude} m</strong><br/>
      source: <strong>${source}</strong><br />
      Vitesse: <strong>${vel != null ? (vel * 3.6).toFixed(1) : '?'} km/h</strong></br>
      <div id="photo-container">${photoHtml}</div>
    `;

    // Ferme un éventuel popup encore ouvert avant d'en ouvrir un nouveau
    // (sécurité supplémentaire si jamais un doublon de listener subsiste).
    const existing = (map as any)._planesActivePopup as maplibregl.Popup | undefined;
    if (existing) existing.remove();

    const popup = new maplibregl.Popup()
      .setLngLat(coordinates)
      .setHTML(buildContent('<em>Chargement de la photo...</em>'))
      .addTo(map);

    (map as any)._planesActivePopup = popup;

    try {
      const res = await api.get(`/planes/${icao24}/picture`);
      const photo = res.data;

      if (popup.isOpen()) {
        const container = popup.getElement().querySelector('#photo-container');
        if (container) {
          container.innerHTML = photo?.thumbnailSrc
            ? `<img src="${photo.thumbnailSrc}" width="210" style="border-radius:4px;margin-top:4px;" /><br/><small><small>🖼️ ${photo.photographer || 'Inconnu'}</small></small>`
            : `<em>Aucune photo disponible</em>`;
        }
      }
    } catch (err) {
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

  map.on('click', 'planes-layer', onPlaneClick(map));

  map.on('mouseenter', 'planes-layer', () => {
    map.getCanvas().style.cursor = 'pointer';
  });
  map.on('mouseleave', 'planes-layer', () => {
    map.getCanvas().style.cursor = '';
  });

  listenersAttached.add(map);
}

/**
 * Recrée la source + le layer 'planes'.
 * À appeler à chaque changement de style (map.setStyle), car le style
 * détruit toutes les sources/layers custom.
 * Les listeners d'événements, eux, ne sont attachés qu'une fois (voir
 * attachPlaneListeners), pour éviter l'accumulation de handlers/popups.
 */
export function setupPlanesLayer(map: maplibregl.Map) {
  registerAllPlaneIcons(map);

  if (!map.getSource('planes')) {
    map.addSource('planes', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] }
    });
  }

  if (!map.getLayer('planes-layer')) {
    map.addLayer({
      id: 'planes-layer',
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
}

export function togglePlaneLayer(map: maplibregl.Map, visible: boolean) {
  if (!map.getLayer('planes-layer')) return;
  map.setLayoutProperty('planes-layer', 'visibility', visible ? 'visible' : 'none');
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

*/