import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './FranceMap.css';

import { FRANCE_BOUNDS } from './constants';
import { setupVigilanceLayer, toggleVigilanceLayer } from './layers/meteo/vigilanceLayer';
import { setupPlanesLayer, togglePlaneLayer } from './layers/planes/planesLayer';
import { setupTrainsLayer } from './layers/trains/trainsLayer';
import { setupRailLayer, toggleRailLayer } from './layers/trains/trainsLayer';
import { toggleGareLayer, setupGareLayer } from './layers/trains/gareLayer';
import { setupBoatsLayer, toggleBoatsLayer } from './layers/boats/boatsLayer';
import { usePlanesRealtimeSync } from './hooks/usePlanesRealtimeSync';

export default function FranceMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [vigilanceVisible, setVigilanceVisible] = useState(false);
  const [visibleTrains, setVisibleTrains] = useState(false);
  const [visiblePlanes, setVisiblePlanes] = useState(false);
  const [visibleBoats, setVisibleBoats] = useState(false);

  useEffect(() => {
    if (map.current) return;

    const mapInstance = new maplibregl.Map({
      container: mapContainer.current!,
      style: 'https://tiles.openfreemap.org/styles/dark', //liberty dark bright fiord positron
      bounds: FRANCE_BOUNDS,
      fitBoundsOptions: { padding: 100 },
      maxBounds: [
        [FRANCE_BOUNDS[0][0] - 2, FRANCE_BOUNDS[0][1] - 2],
        [FRANCE_BOUNDS[1][0] + 2, FRANCE_BOUNDS[1][1] + 2]
      ]
    });
    map.current = mapInstance;

    mapInstance.addControl(new maplibregl.NavigationControl(), 'top-right');

    mapInstance.on('error', (e) => {
      console.error('[FranceMap] Erreur MapLibre:', e);
    });

    let cleanupVigilance: (() => void) | null = null;
    let cleanupBoats: (() => void) | null = null;

    mapInstance.on('load', () => {
      if (!map.current) return;

      cleanupVigilance = setupVigilanceLayer(mapInstance);
      setupRailLayer(mapInstance);
      setupTrainsLayer(mapInstance);
      setupGareLayer(mapInstance);
      cleanupBoats = setupBoatsLayer(mapInstance);
      setupPlanesLayer(mapInstance);
    });

    return () => {
      cleanupVigilance?.();
      cleanupBoats?.();
      mapInstance.remove();
      map.current = null;
    };
  }, []);

  usePlanesRealtimeSync(map);

  const handleToggleVigilance = () => {
    if (!map.current) return;
    const newVisibility = !vigilanceVisible;
    toggleVigilanceLayer(map.current, newVisibility);
    setVigilanceVisible(newVisibility);
  };

  const handleTrainsData = () => {
    if (!map.current) return;
    const newVisibility = !visibleTrains;
    toggleRailLayer(map.current, newVisibility);
    toggleGareLayer(map.current, newVisibility);
    setVisibleTrains(newVisibility);
  };

    const handleBoatsData = () => {
    if (!map.current) return;
    const newVisibility = !visibleBoats;
    toggleBoatsLayer(map.current, newVisibility);
    setVisibleBoats(newVisibility);
  };

  const handlePlanesData = () => {
    if (!map.current) return;
    const newVisibility = !visiblePlanes;
    togglePlaneLayer(map.current, newVisibility);
    setVisiblePlanes(newVisibility);
  };

  return (
    <div className="france-map-wrapper">
      <div ref={mapContainer} className="map-container" />

      <div className="map-controls">
{/*------------------------------------------------------------------------------------*/}
        <button
          type="button"
          className="map-toggle-btn map-toggle-btn--plane"
          data-active={visiblePlanes}
          onClick={handlePlanesData}
        >
          <span className="map-toggle-btn__dot" aria-hidden="true" />
          {visiblePlanes ? 'Masquer les avions' : 'Afficher les avions'}
        </button>
{/*------------------------------------------------------------------------------------*/}
        <button
          type="button"
          className="map-toggle-btn map-toggle-btn--rail"
          data-active={visibleTrains}
          onClick={handleTrainsData}
        >
          <span className="map-toggle-btn__dot" aria-hidden="true" />
          {visibleTrains ? 'Masquer les trains' : 'Afficher les trains'}
        </button>
{/*------------------------------------------------------------------------------------*/}
        <button
          type="button"
          className="map-toggle-btn map-toggle-btn--vigilance"
          data-active={vigilanceVisible}
          onClick={handleToggleVigilance}
        >
          <span className="map-toggle-btn__dot" aria-hidden="true" />
          {vigilanceVisible ? 'Masquer vigilance' : 'Afficher vigilance'}
        </button>
{/*------------------------------------------------------------------------------------*/}
        <button
          type="button"
          className="map-toggle-btn map-toggle-btn--boat"
          data-active={visibleBoats}
          onClick={handleBoatsData}
        >
          <span className="map-toggle-btn__dot" aria-hidden="true" />
          {visibleBoats ? 'Masquer les bateaux' : 'Afficher les bateaux'}
        </button>
      </div>
    </div>
  );
}
