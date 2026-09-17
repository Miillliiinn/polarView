import maplibregl from 'maplibre-gl';
import api from '../../../../api/apiBridge';

import { globalCache } from '../../../../api/classCache';
import { type ShipPosition } from '../../../../api/aisstream/front_aisStreamAPI';
import { toGeoJsonFeatureCollection } from '../../../../api/geoJsonConvertion.ts';
import { registerBoatIcons } from '../../icons/boatType/index.ts';

const SOURCE_ID = 'boats';
const LAYER_ID = 'boats-layer';

const HEADING_NOT_AVAILABLE = 511;

// Liste des types de bateaux exposés au filtre (doit correspondre aux
// valeurs de `shipTypeLabel` / aux clés utilisées par registerBoatIcons).
export const BOAT_TYPES = [
  'Cargo',
  'Pétrolier',
  'Passagers',
  'Pêche',
  'Plaisance',
  'Voilier',
  'Vitesse',
  'Remorqueur',
  'Remorqueur portuaire',
  'Pilotage',
  'Dragage',
  'Plongée',
  'Militaire',
  'Navire non combattant',
  'Autorité / Police',
  'Secours (SAR)',
  'Transport médical',
  'Équipement anti-pollution',
  'Bateau-port',
  'Navire local',
  'Autre',
  'Non spécifié',
  'Inconnu',
] as const;

export type BoatType = typeof BOAT_TYPES[number];

const listenersAttached = new WeakSet<maplibregl.Map>();
const aisUnsubscribeByMap = new WeakMap<maplibregl.Map, () => void>();
// La couche "Bateaux" est masquée par défaut au chargement de la page. Sans
// ce flag, updateSource() continuerait à reconvertir tout le cache AIS en
// GeoJSON et à appeler setData() à chaque message AIS reçu, même invisible —
// même défaut que celui corrigé sur la couche satellites.
const boatsVisibleByMap = new WeakMap<maplibregl.Map, boolean>();

// Types de bateaux actuellement sélectionnés (filtre d'affichage). Par
// défaut (absence d'entrée) on considère que tous les types sont affichés.
const boatTypeFilterByMap = new WeakMap<maplibregl.Map, Set<string>>();

function applyBoatTypeFilter(map: maplibregl.Map)
{
  if (!map.getLayer(LAYER_ID)) return;

  const selected = boatTypeFilterByMap.get(map);

  // Pas de filtre explicite enregistré -> on affiche tous les types.
  if (!selected || selected.size >= BOAT_TYPES.length) {
    map.setFilter(LAYER_ID, null);
    return;
  }

  map.setFilter(LAYER_ID, [
    'in',
    ['get', 'shipTypeLabel'],
    ['literal', Array.from(selected)],
  ]);
}

/**
 * Définit les types de bateaux à afficher. Un tableau vide masque tous les
 * bateaux (sans toucher à la visibilité globale de la couche, gérée par
 * toggleBoatsLayer).
 */
export function setBoatTypeFilter(map: maplibregl.Map, types: string[])
{
  boatTypeFilterByMap.set(map, new Set(types));
  applyBoatTypeFilter(map);
}

export function getBoatTypeFilter(map: maplibregl.Map): Set<string>
{
  return boatTypeFilterByMap.get(map) ?? new Set(BOAT_TYPES);
}

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
            ? `<img src="${photo.thumbUrl}" width="210" class="popup-photo-img" style="border-radius:4px;margin-top:4px;cursor:zoom-in;" /><br/><small><small>🖼️ <a href="${photo.sourceUrl}" target="_blank" rel="noopener">source</a></small></small>`
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
  // Le layer est recréé (nouveau style, reprise après perte de contexte
  // WebGL) sans filtre : on réapplique la sélection de types déjà connue.
  applyBoatTypeFilter(map);

  if (!aisUnsubscribeByMap.has(map)) {
    const updateSource = () => {
      if (!boatsVisibleByMap.get(map)) return;
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
  boatsVisibleByMap.set(map, visible);

  if (!map.getLayer(LAYER_ID)) return;
  map.setLayoutProperty(LAYER_ID, 'visibility', visible ? 'visible' : 'none');

  // En réaffichant la couche, le cache AIS a pu bouger pendant qu'elle était
  // masquée (aucune mise à jour n'était appliquée) : on resynchronise une
  // fois immédiatement plutôt que d'attendre le prochain message AIS.
  if (visible)
  {
    const source = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource | undefined;
    source?.setData(shipsToFeatureCollection(globalCache.getAisCache()));
  }
}