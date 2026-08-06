import maplibregl from 'maplibre-gl';
import { VIGILANCE_COLORS } from '../../constants';
import { applyVigilanceColors } from './meteofranceFeature';

export function setupVigilanceLayer(map: maplibregl.Map): () => void
{
  map.addSource('departements', {
    type: 'geojson',
    data: 'https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements.geojson',
    promoteId: 'code'
  });

  map.addLayer({
    id: 'vigilance-fill',
    type: 'fill',
    source: 'departements',
    layout: {
      visibility: 'none'
    },
    paint: {
      'fill-color': [
        'match',
        ['feature-state', 'couleur'],
        1, VIGILANCE_COLORS[1],
        2, VIGILANCE_COLORS[2],
        3, VIGILANCE_COLORS[3],
        4, VIGILANCE_COLORS[4],
        'rgba(0,0,0,0)'
      ],
      'fill-opacity': 0.35
    }
  });

  map.addLayer({
    id: 'vigilance-outline',
    type: 'line',
    source: 'departements',
    layout: {
      visibility: 'none'
    },
    paint: {
      'line-color': '#ffffff',
      'line-width': 0.5,
      'line-opacity': 0.4
    }
  });

  const onDepartementsLoaded = (e: maplibregl.MapSourceDataEvent) => {
    if (e.sourceId === 'departements' && e.isSourceLoaded) {
      applyVigilanceColors(map);
    }
  };
  map.on('sourcedata', onDepartementsLoaded);

  const vigilanceInterval = setInterval(() => {
    if (map.isStyleLoaded()) {
      applyVigilanceColors(map);
    }
  }, 5000);

  return () => {
    clearInterval(vigilanceInterval);
    map.off('sourcedata', onDepartementsLoaded);
  };
}

export function toggleVigilanceLayer(map: maplibregl.Map, visible: boolean)
{
  if (!map.getLayer('vigilance-fill')) return;
  const value = visible ? 'visible' : 'none';
  map.setLayoutProperty('vigilance-fill', 'visibility', value);
  map.setLayoutProperty('vigilance-outline', 'visibility', value);
}
