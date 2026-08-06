import maplibregl from 'maplibre-gl';
import { registerTrainIcons, DEFAULT_TRAIN_ICON_ID } from '../../icons/trainType';

export function setupTrainsLayer(map: maplibregl.Map)
{
  registerTrainIcons(map);

  map.addSource('trains', {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] }
  });

  map.addLayer({
    id: 'trains-layer',
    type: 'symbol',
    source: 'trains',
    layout: {
      'icon-image': [
        'match',
        ['coalesce', ['get', 'type'], ''],
        'RER', 'train-rer',
        'TRANSILIEN', 'train-transilien',
        'TGV INOUI', 'train-tgv-inoui',
        'OUIGO', 'train-ouigo',
        'BreizhGo', 'train-breizhgo',
        'ZOU !', 'train-zou',
        'FLUO', 'train-fluo',
        DEFAULT_TRAIN_ICON_ID
      ],
      'icon-size': 0.5,
      'icon-allow-overlap': true
    }
  });

  map.on('click', 'trains-layer', (e) => {
    const feature = e.features?.[0];
    if (!feature) return;

    const props = feature.properties ?? {};
    const trainNumber = props.trainNumber || props.nb || 'Train inconnu';
    const type = props.type || 'Type inconnu';
    const direction = props.direction ? `Direction : <strong>${props.direction}</strong><br/>` : '';
    const departureTime = props.departureTime
      ? `Départ : <strong>${props.departureTime}</strong><br/>`
      : '';

    new maplibregl.Popup()
      .setLngLat((feature.geometry as any).coordinates)
      .setHTML(`
        <strong>${trainNumber}</strong> — ${type}<br/>
        ${direction}
        ${departureTime}
      `)
      .addTo(map);
  });

  map.on('mouseenter', 'trains-layer', () => {
    map.getCanvas().style.cursor = 'pointer';
  });
  map.on('mouseleave', 'trains-layer', () => {
    map.getCanvas().style.cursor = '';
  });
}

const RAIL_SOURCE_URL =
  'https://ressources.data.sncf.com/api/explore/v2.1/catalog/datasets/formes-des-lignes-du-rfn/exports/geojson';
 
export function setupRailLayer(map: maplibregl.Map){
  if (map.getSource('railways')) return;
 
  map.addSource('railways', {
    type: 'geojson',
    data: RAIL_SOURCE_URL,
  });
 
  map.addLayer({
    id: 'railways-line',
    type: 'line',
    source: 'railways',
    filter: ['==', ['get', 'mnemo'], 'EXPLOITE'],
    layout: {
      visibility: 'none'
    },
    paint: {
      'line-color': '#c30e0e',
      'line-width': 1
    }
  });
}
 

export function toggleRailLayer(map: maplibregl.Map, visible: boolean)
{
  if (!map.getLayer('railways-line')) return;
  map.setLayoutProperty('railways-line', 'visibility', visible ? 'visible' : 'none');
}