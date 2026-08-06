import maplibregl from 'maplibre-gl';

const GARE_DATA_FRANCE =
  'https://ressources.data.sncf.com/api/explore/v2.1/catalog/datasets/gares-de-voyageurs/exports/geojson';

export function setupGareLayer(map: maplibregl.Map)
{
  if (map.getSource('gare')) return;

  map.addSource('gare', {
    type: 'geojson',
    data: GARE_DATA_FRANCE
  });

  map.addLayer({
    id: 'gare-layer',
    type: 'circle',
    source: 'gare',
    layout: {
      visibility: 'none'
    },
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 2, 12, 5],
      'circle-color': '#f2c14e',
      'circle-stroke-color': '#0a1628',
      'circle-stroke-width': 1
    }
  });

  map.on('click', 'gare-layer', (e) => {
    const feature = e.features?.[0];
    if (!feature) return;
    console.log(feature.properties);
    new maplibregl.Popup()
      .setLngLat((feature.geometry as any).coordinates)
      .setHTML(`<strong>${feature.properties?.nom || 'e'}</strong>`)
      .addTo(map);
  });

  map.on('mouseenter', 'gare-layer', () => {
    map.getCanvas().style.cursor = 'pointer';
  });
  map.on('mouseleave', 'gare-layer', () => {
    map.getCanvas().style.cursor = '';
  });
}

export function toggleGareLayer(map: maplibregl.Map, visible: boolean)
{
  if (!map.getLayer('gare-layer')) return;
  map.setLayoutProperty('gare-layer', 'visibility', visible ? 'visible' : 'none');
}