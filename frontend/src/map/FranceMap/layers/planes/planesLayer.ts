import maplibregl from 'maplibre-gl';
import api from '../../../../api/apiBridge';
import { createPlaneIcon } from '../../icons/planeIcon';

export function setupPlanesLayer(map: maplibregl.Map) {
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
      .addTo(map);

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