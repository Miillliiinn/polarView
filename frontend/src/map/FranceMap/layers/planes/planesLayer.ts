import maplibregl from 'maplibre-gl';
import api from '../../../../api/apiBridge';
import { globalCache } from '../../../../api/classCache';
import { registerAllPlaneIcons } from '../../icons/planeType/utils/iconRegistry';

export function setupPlanesLayer(map: maplibregl.Map)
{
  registerAllPlaneIcons(map);

  map.addSource('planes', {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] }
  });

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

map.on('click', 'planes-layer', async (e) => {
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

  const buildContent = (photoHtml: string) => `
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
  `;

  const popup = new maplibregl.Popup()
    .setLngLat(coordinates)
    .setHTML(buildContent('<em>Chargement de la photo...</em>'))
    .addTo(map);

  try
  {
    const res = await api.get(`/planes/${icao24}/picture`);
    const photo = res.data;

    if (popup.isOpen())
    {
      const container = popup.getElement().querySelector('#photo-container');
      if (container) {
        container.innerHTML = photo?.thumbnailSrc
          ? `<img src="${photo.thumbnailSrc}" width="210" style="border-radius:4px;margin-top:4px;" /><br/><small><small>🖼️ ${photo.photographer || 'Inconnu'}</small></small>`
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
  });

  map.on('mouseenter', 'planes-layer', () => {
    map.getCanvas().style.cursor = 'pointer';
  });
  map.on('mouseleave', 'planes-layer', () => {
    map.getCanvas().style.cursor = '';
  });
}

export function togglePlaneLayer(map: maplibregl.Map, visible: boolean)
{
  if (!map.getLayer('planes-layer')) return;
  map.setLayoutProperty('planes-layer', 'visibility', visible ? 'visible' : 'none');
}