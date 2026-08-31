// import maplibregl from 'maplibre-gl';
// import api from '../../../../api/apiBridge';
// import { createPlaneIcon } from '../../icons/planeType/planeIcon'; 
// import { globalCache } from '../../../../api/classCache';
// import { createA380Icon } from '../../icons/planeType/l4j';
// import { createH1PIcon } from '../../icons/planeType/h1p';
// import { createH2TIcon } from '../../icons/planeType/h2t';
// import { createL3JIcon } from '../../icons/planeType/l3j'; 
// import { createL2JIcon } from '../../icons/planeType/l2j';
// import { createL1PIcon } from '../../icons/planeType/l1p';
// import { createL1TIcon } from '../../icons/planeType/l1t';
// import { createCarIcon } from '../../icons/planeType/groundVehicule';
// import { createUAVIcon } from '../../icons/planeType/uav';
// import { createBalloonIcon } from '../../icons/planeType/balloon';
// import { createMilitaryHelicopterIcon } from '../../icons/planeType/MilitaryH';
// import { createGliderIcon } from '../../icons/planeType/glider';
// import { createA400MIcon } from '../../icons/planeType/MilitaryP';

// export function setupPlanesLayer(map: maplibregl.Map)
// {
//   //map.addImage('plane-ground', createPlaneIcon('#989898', 96));
//   // map.addImage('plane-low', createH2TIcon('#ff9999', 55));
//   map.addImage('plane-mid', createUAVIcon('#53ffc0', 75));
//   map.addImage('plane-high', createA400MIcon('#0fb9f1', 85)); //4db8ff
//   map.addImage('plane-cruise', createA380Icon('#7cff5e', 85)); //00ff1e


//   /* unknown, military,
//      privateJet, commercial, generalAviation  */ 

//   // map.addImage('plane-ground', createPlaneIcon('#989898', 96));
//   // map.addImage('plane-low', createPlaneIcon('#a199ff', 96));
//   // map.addImage('plane-mid', createPlaneIcon('#7c70ff', 96));
//   // map.addImage('plane-high', createPlaneIcon('#5b4dff', 96));
//   // map.addImage('plane-cruise', createPlaneIcon('#1500ff', 96));

//   map.addSource('planes', {
//     type: 'geojson',
//     data: { type: 'FeatureCollection', features: [] }
//   });

//   map.addLayer({
//     id: 'planes-layer',
//     type: 'symbol',
//     source: 'planes',
//     layout: {
//       'icon-image': [
//         'step',
//         ['coalesce', ['get', 'altitude'], 0],
//         'plane-ground',
//         100, 'plane-low',
//         3000, 'plane-mid',
//         8000, 'plane-high',
//         11000, 'plane-cruise'
//       ],
//       'icon-size': 0.5,
//       'icon-rotate': ['coalesce', ['get', 'heading'], 0],
//       'icon-rotation-alignment': 'map',
//       'icon-allow-overlap': true,
//       visibility: 'none'
//     }
//   });

//   map.on('click', 'planes-layer', async (e) => {
//     const feature = e.features?.[0];
//     if (!feature) return;

//     const cache = globalCache.getOpCache();

//     const icao24 = feature.properties?.icao24;
//     const callsign = feature.properties?.callsign || 'Vol inconnu';
//     const originCountry = cache.find((f) => f.icao24 === icao24)?.originCountry;
//     const registration = cache.find((f) => f.icao24 === icao24)?.registration;
//     const longitude = cache.find((f) => f.icao24 === icao24)?.longitude;
//     const latitude = cache.find((f) => f.icao24 === icao24)?.latitude;
//     const altitude = feature.properties?.altitude ?? '?';
//     const onGround = cache.find((f) => f.icao24 === icao24)?.onGround;
//     const verticalRate = cache.find((f) => f.icao24 === icao24)?.verticalRate;
//     const squawk = cache.find((f) => f.icao24 === icao24)?.squawk;
//     const typeCode = cache.find((f) => f.icao24 === icao24)?.typeCode;
//     const typeLabel = cache.find((f) => f.icao24 === icao24)?.typeLabel;
//     const engine = cache.find((f) => f.icao24 === icao24)?.engines;
//     const kind = cache.find((f) => f.icao24 === icao24)?.kind;
//     const isMilitary = cache.find((f) => f.icao24 === icao24)?.isMilitary;
//     const isHelicopter = cache.find((f) => f.icao24 === icao24)?.isHelicopter;
//     const lastSeen = cache.find((f) => f.icao24 === icao24)?.lastSeenSeconds;
//     const source = cache.find((f) => f.icao24 === icao24)?.source;
//     const icaoAircraftClass = cache.find((f) => f.icao24 === icao24)?.icaoAircraftClass
//     const manufacturerIcao = cache.find((f) => f.icao24 === icao24)?.manufacturerIcao
//     const manufacturerName = cache.find((f) => f.icao24 === icao24)?.manufacturerName
//     const model = cache.find((f) => f.icao24 === icao24)?.model
//     const operator = cache.find((f) => f.icao24 === icao24)?.operator
//     const owner = cache.find((f) => f.icao24 === icao24)?.owner
//     const typecode = cache.find((f) => f.icao24 === icao24)?.typecode
//     const heading = feature.properties?.heading || null;
//     const coordinates = (feature.geometry as any).coordinates;
//     const vel = cache.find((f) => f.icao24 === icao24)?.velocity;
//     const popup = new maplibregl.Popup()
//       .setLngLat(coordinates)
//       .setHTML(`
//           <strong>${callsign}</strong><br/>
//           Altitude: ${altitude} m<br/>
//           <em>Chargement de la photo...</em>
//       `)
//       .addTo(map);

//     if (!icao24) return;
//     try
//     {
//       const res = await api.get(`/planes/${icao24}/picture`);
//       const photo = res.data;
//       popup.setHTML(`
//         registration: <strong>${registration}</strong><br/>
//         longitude: <strong>${longitude}</strong><br/>
//         latitude: <strong>${latitude}</strong><br/>
//         onGround: <strong>${onGround}</strong><br/>
//         verticalRate: <strong>${verticalRate}</strong><br/>
//         squawk: <strong>${squawk}</strong><br/>
//         typeCode: <strong>${typeCode}</strong><br/>
//         typeLabel: <strong>${typeLabel}</strong><br/>
//         engine: <strong>${engine}</strong><br/>
//         kind: <strong>${kind}</strong><br/>
//         isMilitary: <strong>${isMilitary}</strong><br/>
//         isHelicopter: <strong>${isHelicopter}</strong><br/>
//         lastSeen: <strong>${lastSeen}</strong><br/>
//         source: <strong>${source}</strong><br />
//         icaoAircraftClass : <strong>${icaoAircraftClass}</strong><br />
//         manufacturerIcao : <strong>${manufacturerIcao}</strong><br />
//         manufacturerName : <strong>${manufacturerName}</strong><br />
//         model : <strong>${model}</strong><br />
//         operator : <strong>${operator}</strong><br />
//         owner : <strong>${owner}</strong><br />
//         typecode : <strong>${typecode}</strong><br />

//         <br>-----</br>

//           Callsign: <strong>${callsign}</strong><br/>
//           Country: <strong>${originCountry}</strong></br>
//           Altitude: <strong>${altitude} m</strong><br/>
//           Cap: <strong>${heading} °</strong></br>
//           Vitesse: <strong>${(vel * 3.6).toFixed(3)} km/h</strong></br>
//           ${photo?.thumbnailSrc
//               ? `<img src="${photo.thumbnailSrc}" width="210" style="border-radius:4px;margin-top:4px;" /><br/><small><small>🖼️ ${photo.photographer || 'Inconnu'}</small></small>`
//               : `<em>Aucune photo disponible</em>`
//           }
//       `);
//     } catch (err) {
//       console.error('Erreur récupération photo avion :', err);
//       popup.setHTML(`
//           <strong>${callsign}</strong><br/>
//           Altitude: ${altitude} m<br/>
//           <em>Erreur de chargement de la photo</em>
//       `);
//     }
//   });

//   map.on('mouseenter', 'planes-layer', () => {
//     map.getCanvas().style.cursor = 'pointer';
//   });
//   map.on('mouseleave', 'planes-layer', () => {
//     map.getCanvas().style.cursor = '';
//   });
// }

// export function togglePlaneLayer(map: maplibregl.Map, visible: boolean)
// {
//   if (!map.getLayer('planes-layer')) return;
//   map.setLayoutProperty('planes-layer', 'visibility', visible ? 'visible' : 'none');
// }



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