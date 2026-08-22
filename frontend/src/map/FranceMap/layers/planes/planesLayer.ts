import maplibregl from 'maplibre-gl';
import api from '../../../../api/apiBridge';
import { createPlaneIcon } from '../../icons/planeType/planeIcon'; 
import { globalCache } from '../../../../api/classCache';

export function setupPlanesLayer(map: maplibregl.Map)
{
  map.addImage('plane-ground', createPlaneIcon('#989898', 96));
  map.addImage('plane-low', createPlaneIcon('#a199ff', 96));
  map.addImage('plane-mid', createPlaneIcon('#7c70ff', 96));
  map.addImage('plane-high', createPlaneIcon('#5b4dff', 96));
  map.addImage('plane-cruise', createPlaneIcon('#1500ff', 96));

  map.addSource('planes', {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] }
  });

  map.addLayer({
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
      'icon-allow-overlap': true,
      visibility: 'none'
    }
  });

  map.on('click', 'planes-layer', async (e) => {
    const feature = e.features?.[0];
    if (!feature) return;

    const cache = globalCache.getOpCache();

    const icao24 = feature.properties?.icao24;
    const callsign = feature.properties?.callsign || 'Vol inconnu';
    const originCountry = cache.find((f) => f.icao24 === icao24)?.originCountry;
    const registration = cache.find((f) => f.icao24 === icao24)?.registration;
    const longitude = cache.find((f) => f.icao24 === icao24)?.longitude;
    const latitude = cache.find((f) => f.icao24 === icao24)?.latitude;
    const altitude = feature.properties?.altitude ?? '?';
    const onGround = cache.find((f) => f.icao24 === icao24)?.onGround;
    const verticalRate = cache.find((f) => f.icao24 === icao24)?.verticalRate;
    const squawk = cache.find((f) => f.icao24 === icao24)?.squawk;
    const typeCode = cache.find((f) => f.icao24 === icao24)?.typeCode;
    const typeLabel = cache.find((f) => f.icao24 === icao24)?.typeLabel;
    const engine = cache.find((f) => f.icao24 === icao24)?.engines;
    const kind = cache.find((f) => f.icao24 === icao24)?.kind;
    const isMilitary = cache.find((f) => f.icao24 === icao24)?.isMilitary;
    const isHelicopter = cache.find((f) => f.icao24 === icao24)?.isHelicopter;
    const lastSeen = cache.find((f) => f.icao24 === icao24)?.lastSeenSeconds;
    const source = cache.find((f) => f.icao24 === icao24)?.source;
    const heading = feature.properties?.heading || null;
    const coordinates = (feature.geometry as any).coordinates;
    const vel = cache.find((f) => f.icao24 === icao24)?.velocity;
    const popup = new maplibregl.Popup()
      .setLngLat(coordinates)
      .setHTML(`
          <strong>${callsign}</strong><br/>
          Altitude: ${altitude} m<br/>
          <em>Chargement de la photo...</em>
      `)
      .addTo(map);

    if (!icao24) return;
    try {
      const res = await api.get(`/planes/${icao24}/picture`);
      const photo = res.data;
      popup.setHTML(`
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
        lastSeen: <strong>${lastSeen}</strong><br/>
        source: <strong>${source}</strong><br />
        <br>-----</br>

          Callsign: <strong>${callsign}</strong><br/>
          Country: <strong>${originCountry}</strong></br>
          Altitude: <strong>${altitude} m</strong><br/>
          Cap: <strong>${heading} °</strong></br>
          Vitesse: <strong>${(vel * 3.6).toFixed(3)} km/h</strong></br>
          ${photo?.thumbnailSrc
              ? `<img src="${photo.thumbnailSrc}" width="210" style="border-radius:4px;margin-top:4px;" /><br/><small><small>🖼️ ${photo.photographer || 'Inconnu'}</small></small>`
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