import maplibregl from 'maplibre-gl';
import api from '../../../../api/apiBridge';

import { globalCache } from '../../../../api/classCache';
import { type ShipPosition } from '../../../../api/aisstream/front_aisStreamAPI';
import { toGeoJsonFeatureCollection } from '../../../../api/geoJsonConvertion.ts';
import { registerBoatIcons } from '../../icons/boatType.ts';

const SOURCE_ID = 'boats';
const LAYER_ID = 'boats-layer';

const HEADING_NOT_AVAILABLE = 511;

const listenersAttached = new WeakSet<maplibregl.Map>();
const aisUnsubscribeByMap = new WeakMap<maplibregl.Map, () => void>();

function shipsToFeatureCollection(ships: ShipPosition[]): GeoJSON.FeatureCollection
{
  return toGeoJsonFeatureCollection(
    ships.map((ship) => ({
      long: ship.longitude,
      lat: ship.latitude,
      properties: {
        mmsi: ship.mmsi,
        imo: ship.imo,
        name: ship.name,
        speed: ship.speed,
        heading: ship.heading,
        lastUpdate: ship.lastUpdate,
        shipType: ship.shipType,
        shipTypeLabel: ship.shipTypeLabel,
      },
    }))
  );
}

function addBoatsSourceAndLayer(map: maplibregl.Map)
{
  if (!map.getSource(SOURCE_ID)) {
    map.addSource(SOURCE_ID, {
      type: 'geojson',
      data: shipsToFeatureCollection(globalCache.getAisCache()),
    });
  }

  if (!map.getLayer(LAYER_ID)) {
    map.addLayer({
      id: LAYER_ID,
      type: 'symbol',
      source: SOURCE_ID,
      layout: {
        'icon-image': ['get', 'shipTypeLabel'],
        'icon-size': 0.5,
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
        'icon-rotation-alignment': 'map',
        'icon-rotate': [
          'case',
          ['==', ['get', 'heading'], HEADING_NOT_AVAILABLE],
          0,
          ['get', 'heading'],
        ],
        'visibility': 'none',
      },
    });
  }
}

function setupBoatsClickPopup(map: maplibregl.Map)
{
  if (listenersAttached.has(map)) return;

  map.on('click', LAYER_ID, async (e) => {
    const feature = e.features?.[0];
    if (!feature) return;

    const props = feature.properties ?? {};
    const imo = props.imo;
    const coordinates = (feature.geometry as any).coordinates;

    const name = props.name || 'Navire inconnu';
    const mmsi = props.mmsi ?? 'N/A';
    const speed = props.speed ?? 'N/A';
    const heading = props.heading ?? 'N/A';
    const shipTypeLabel = props.shipTypeLabel ?? 'N/A';

    const buildContent = (photoHtml: string) => `
        Nom: <strong>${name}</strong><br/>
        MMSI: <strong>${mmsi}</strong><br/>
        IMO: <strong>${imo ?? 'N/A'}</strong><br/>
        Type: <strong>${shipTypeLabel}</strong><br/>
        Vitesse: <strong>${speed} nds</strong><br/>
        Cap: <strong>${heading}°</strong><br/>
        <div id="ship-photo-container">${photoHtml}</div>
    `;

    const existing = (map as any)._boatsActivePopup as maplibregl.Popup | undefined;
    if (existing) existing.remove();

    const popup = new maplibregl.Popup()
      .setLngLat(coordinates)
      .setHTML(buildContent(imo ? '<em>Chargement de la photo...</em>' : '<em></em>'))
      .addTo(map);

    (map as any)._boatsActivePopup = popup;

    if (!imo) return;

    try
    {
      const res = await api.get(`/ships/${imo}/picture`);
      const photo = res.data;

      if (popup.isOpen())
      {
        const container = popup.getElement().querySelector('#ship-photo-container');
        if (container) {
          container.innerHTML = photo?.thumbUrl
            ? `<img src="${photo.thumbUrl}" width="210" style="border-radius:4px;margin-top:4px;" /><br/><small><small>🖼️ <a href="${photo.sourceUrl}" target="_blank" rel="noopener">source</a></small></small>`
            : `<em>Aucune photo disponible</em>`;
        }
      }
    }
    catch (err)
    {
      console.error('Erreur récupération photo bateau :', err);
      if (popup.isOpen()) {
        const container = popup.getElement().querySelector('#ship-photo-container');
        if (container) {
          container.innerHTML = `<em>Aucune photo disponible (Erreur serveur)</em>`;
        }
      }
    }
  });

  map.on('mouseenter', LAYER_ID, () => {
    map.getCanvas().style.cursor = 'pointer';
  });
  map.on('mouseleave', LAYER_ID, () => {
    map.getCanvas().style.cursor = '';
  });

  listenersAttached.add(map);
}

export function setupBoatsLayer(map: maplibregl.Map): () => void
{
  registerBoatIcons(map);
  addBoatsSourceAndLayer(map);
  setupBoatsClickPopup(map);

  if (!aisUnsubscribeByMap.has(map)) {
    const updateSource = () => {
      const source = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource | undefined;
      if (!source) return;
      source.setData(shipsToFeatureCollection(globalCache.getAisCache()));
    };

    const unsubscribe = globalCache.subscribeAis(updateSource);
    aisUnsubscribeByMap.set(map, unsubscribe);
  }

  return () => {
    const unsubscribe = aisUnsubscribeByMap.get(map);
    if (unsubscribe) {
      unsubscribe();
      aisUnsubscribeByMap.delete(map);
    }
    if (map.getLayer(LAYER_ID)) map.removeLayer(LAYER_ID);
    if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
  };
}

export function toggleBoatsLayer(map: maplibregl.Map, visible: boolean)
{
  if (!map.getLayer(LAYER_ID)) return;
  map.setLayoutProperty(LAYER_ID, 'visibility', visible ? 'visible' : 'none');
}