import maplibregl from 'maplibre-gl';

import { globalCache } from '../../../../api/classCache';
import { type ShipPosition } from '../../../../api/aisstream/front_aisStreamAPI'; // TODO: vérifier ce chemin
import { toGeoJsonFeatureCollection } from '../../../../api/geoJsonConvertion.ts';// TODO: vérifier ce chemin
import { registerBoatIcons } from '../../icons/boatType.ts';

const SOURCE_ID = 'boats';
const LAYER_ID = 'boats-layer';

// AIS : heading = 511 signifie "cap non disponible", on évite de faire tourner l'icône dans ce cas
const HEADING_NOT_AVAILABLE = 511;

function shipsToFeatureCollection(ships: ShipPosition[]): GeoJSON.FeatureCollection {
  return toGeoJsonFeatureCollection(
    ships.map((ship) => ({
      long: ship.longitude,
      lat: ship.latitude,
      properties: {
        mmsi: ship.mmsi,
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
    if (map.getSource(SOURCE_ID)) return; // déjà en place (ex: rappel après changement de style)

    map.addSource(SOURCE_ID, {
        type: 'geojson',
        data: shipsToFeatureCollection(globalCache.getAisCache()),
    });

    map.addLayer({
        id: LAYER_ID,
        type: 'symbol',
        source: SOURCE_ID,
        layout: {
            // shipTypeLabel doit correspondre exactement aux clés utilisées dans registerBoatIcons
            // (ex: 'Cargo', 'Pêche', 'Voilier', ...)
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
            // masqué par défaut, comme les autres couches (avions/trains/vigilance) : activé via toggleBoatsLayer
            'visibility': 'none',
        },
    });
}

export function setupBoatsLayer(map: maplibregl.Map): () => void
{
    registerBoatIcons(map);
    addBoatsSourceAndLayer(map);

    // Mise à jour du tracé à chaque flush du cache AIS (voir Cache.AIS_FLUSH_INTERVAL_MS)
    const updateSource = () => {
        const source = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource | undefined;
        if (!source) return;
        source.setData(shipsToFeatureCollection(globalCache.getAisCache()));
    };

    const unsubscribe = globalCache.subscribeAis(updateSource);

    // A appeler quand le composant/la couche est détruit(e), pour éviter les fuites
    return () => {
        unsubscribe();
        if (map.getLayer(LAYER_ID)) map.removeLayer(LAYER_ID);
        if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
    };
}

export function toggleBoatsLayer(map: maplibregl.Map, visible: boolean)
{
    if (!map.getLayer(LAYER_ID)) return;
    map.setLayoutProperty(LAYER_ID, 'visibility', visible ? 'visible' : 'none');
}