import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './FranceMap.css';

import { FRANCE_BOUNDS } from './constants';
import { setupVigilanceLayer, toggleVigilanceLayer } from './layers/meteo/vigilanceLayer';
import {
  setupPlanesLayer,
  togglePlaneLayer,
  setPlaneTypeFilter,
  setAltitudeFilter,
  PLANE_TYPES,
  PLANE_TYPE_LABELS,
  ALTITUDE_STOPS,
  ALTITUDE_LABELS,
} from './layers/planes/planesLayer';
import { setupTrainsLayer } from './layers/trains/trainsLayer';
import { setupRailLayer, toggleRailLayer } from './layers/trains/trainsLayer';
import { toggleGareLayer, setupGareLayer } from './layers/trains/gareLayer';
import { setupBoatsLayer, toggleBoatsLayer, setBoatTypeFilter, BOAT_TYPES } from './layers/boats/boatsLayer';
import { setupSatellitesLayer, toggleSatellitesLayer } from './layers/satellite/satelliteLayer'; 
import { usePlanesRealtimeSync } from './hooks/usePlanesRealtimeSync';
import { setupPhotoLightbox } from './utils/popUpImage';
import { mapGestion } from '../../tools/gestion/classUsefull';

/* --- Icône burger --- */
const IconBurger = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="7" x2="20" y2="7" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="17" x2="20" y2="17" />
  </svg>
);

/* --- Styles OpenFreeMap disponibles --- */
const MAP_STYLES = [
  { id: 'bright', label: 'Simple', url: 'https://tiles.openfreemap.org/styles/bright' },
  { id: 'dark', label: 'Sombre', url: 'https://tiles.openfreemap.org/styles/dark' },
  { id: 'fiord', label: 'Bleu', url: 'https://tiles.openfreemap.org/styles/fiord' },
  { id: 'positron', label: 'Blanche', url: 'https://tiles.openfreemap.org/styles/positron' },
    { id: 'liberty', label: '3D', url: 'https://tiles.openfreemap.org/styles/liberty' },
];

const CONTEXT_RESTORE_TIMEOUT_MS = 800;

export default function FranceMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const contextLostTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [vigilanceVisible, setVigilanceVisible] = useState(false);
  const [visibleTrains, setVisibleTrains] = useState(false);
  const [visibleSatellites, setVisibleSatellites] = useState(false);

  // Bateaux : plus un simple on/off, mais un filtre par type. La couche est
  // visible dès qu'au moins un type est sélectionné.
  const [boatTypesSelected, setBoatTypesSelected] = useState<Set<string>>(new Set());
  const [boatsMenuOpen, setBoatsMenuOpen] = useState(false);
  const boatsMenuRef = useRef<HTMLDivElement>(null);
  const visibleBoats = boatTypesSelected.size > 0;

  // Avions : même principe, mais avec deux critères combinés (type ET
  // altitude). La couche n'est visible que si les deux ont au moins une
  // sélection (sinon le filtre MapLibre ne matcherait de toute façon rien).
// Initialise les types d'avions à Vide (aucun avion sélectionné au départ)
const [planeTypesSelected, setPlaneTypesSelected] = useState<Set<string>>(new Set());

// Garde toutes les altitudes sélectionnées (Altitude = TOUT)
const [altitudesSelected, setAltitudesSelected] = useState<Set<string>>(new Set(ALTITUDE_STOPS));
  const [planesVisible, setPlanesVisible] = useState(false);
  const [planesMenuOpen, setPlanesMenuOpen] = useState(false);
  const planesMenuRef = useRef<HTMLDivElement>(null);
  const visiblePlanes = planesVisible && planeTypesSelected.size > 0 && altitudesSelected.size > 0;

  const [currentStyleId, setCurrentStyleId] = useState('bright');
  const [styleMenuOpen, setStyleMenuOpen] = useState(false);
  const styleMenuRef = useRef<HTMLDivElement>(null);

  const stateRef = useRef({
    vigilanceVisible,
    visibleTrains,
    visiblePlanes,
    visibleBoats,
    visibleSatellites,
    boatTypesSelected,
    planeTypesSelected,
    altitudesSelected,
  });
  useEffect(() => {
    stateRef.current = {
      vigilanceVisible,
      visibleTrains,
      visiblePlanes,
      visibleBoats,
      visibleSatellites,
      boatTypesSelected,
      planeTypesSelected,
      altitudesSelected,
    };
  }, [vigilanceVisible, visibleTrains, visiblePlanes, visibleBoats, visibleSatellites, boatTypesSelected, planeTypesSelected, altitudesSelected]);

  const currentStyleIdRef = useRef(currentStyleId);
  useEffect(() => {
    currentStyleIdRef.current = currentStyleId;
  }, [currentStyleId]);

  const cleanupRefs = useRef<{ vigilance: (() => void) | null; boats: (() => void) | null; satellites: (() => void) | null }>({
    vigilance: null,
    boats: null,
    satellites: null,
  });

  const initLayers = (mapInstance: maplibregl.Map) => {
    cleanupRefs.current.vigilance = setupVigilanceLayer(mapInstance);
    setupRailLayer(mapInstance);
    setupTrainsLayer(mapInstance);
    setupGareLayer(mapInstance);
    cleanupRefs.current.boats = setupBoatsLayer(mapInstance);
    setupPlanesLayer(mapInstance);
    cleanupRefs.current.satellites = setupSatellitesLayer(mapInstance);

    const s = stateRef.current;
    toggleVigilanceLayer(mapInstance, s.vigilanceVisible);
    toggleRailLayer(mapInstance, s.visibleTrains);
    toggleGareLayer(mapInstance, s.visibleTrains);
    setBoatTypeFilter(mapInstance, Array.from(s.boatTypesSelected));
    toggleBoatsLayer(mapInstance, s.visibleBoats);
    setPlaneTypeFilter(mapInstance, Array.from(s.planeTypesSelected));
    setAltitudeFilter(mapInstance, Array.from(s.altitudesSelected));
    togglePlaneLayer(mapInstance, s.visiblePlanes);
    toggleSatellitesLayer(mapInstance, s.visibleSatellites);
  };

  // Crée (ou recrée) l'instance MapLibre et branche tous ses listeners.
  const createMap = () => {
    if (!mapContainer.current) return;

    const mapInstance = new maplibregl.Map({
      container: mapContainer.current,
      style: MAP_STYLES.find((s) => s.id === currentStyleIdRef.current)!.url,
      bounds: FRANCE_BOUNDS,
      fitBoundsOptions: { padding: 100 },
      maxBounds: [
        [FRANCE_BOUNDS[0][0] - 2, FRANCE_BOUNDS[0][1] - 2],
        [FRANCE_BOUNDS[1][0] + 2, FRANCE_BOUNDS[1][1] + 2],
      ],
      // trackResize (true par défaut) fait déjà tourner un ResizeObserver
      // interne sur le container. On le laisse explicite pour lisibilité.
      trackResize: true,
      // On désactive le contrôle d'attribution par défaut (toujours ouvert
      // sur desktop) pour le remplacer par une version compacte ci-dessous.
      attributionControl: false,
    });
    map.current = mapInstance;

    mapInstance.addControl(new maplibregl.NavigationControl(), 'top-right');
    // Crédits OpenFreeMap/OSM repliés par défaut (juste l'icône "i"),
    // cliquables pour dérouler le détail - requis par la licence des tuiles,
    // mais on évite qu'il reste ouvert en permanence à l'écran.
    mapInstance.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

    mapInstance.on('error', (e) => {
      console.error('[FranceMap] Erreur MapLibre:', e);
    });

    mapInstance.on('load', () => {
      if (!map.current) return;
      initLayers(mapInstance);
    });

    
    const resizeObserver = new ResizeObserver(() => {
      mapInstance.resize();
    });
    resizeObserver.observe(mapContainer.current);
    (mapInstance as any)._franceMapResizeObserver = resizeObserver;
    mapInstance.on('webglcontextlost', () => {
      console.warn(
        '[FranceMap] Contexte WebGL perdu (souvent déclenché par DevTools / mode responsive). ' +
        'Attente d\'une restauration automatique...'
      );

      if (contextLostTimeoutRef.current) clearTimeout(contextLostTimeoutRef.current);
      contextLostTimeoutRef.current = setTimeout(() => {
        console.warn(
          `[FranceMap] Contexte WebGL non restauré après ${CONTEXT_RESTORE_TIMEOUT_MS}ms, recréation de la carte.`
        );
        contextLostTimeoutRef.current = null;

        resizeObserver.disconnect();
        cleanupRefs.current.vigilance?.();
        cleanupRefs.current.boats?.();
        cleanupRefs.current.satellites?.();
        mapInstance.remove();
        map.current = null;
        createMap();
      }, CONTEXT_RESTORE_TIMEOUT_MS);
    });

    mapInstance.on('webglcontextrestored', () => {
      if (contextLostTimeoutRef.current) {
        clearTimeout(contextLostTimeoutRef.current);
        contextLostTimeoutRef.current = null;
      }
      console.info('[FranceMap] Contexte WebGL restauré, réinitialisation des couches.');
      initLayers(mapInstance);
      mapInstance.resize();
    });
  };

  useEffect(() => {
    if (map.current) return;

    setupPhotoLightbox();
    createMap();

    return () => {
      if (contextLostTimeoutRef.current) clearTimeout(contextLostTimeoutRef.current);
      (map.current as any)?._franceMapResizeObserver?.disconnect();
      cleanupRefs.current.vigilance?.();
      cleanupRefs.current.boats?.();
      cleanupRefs.current.satellites?.();
      map.current?.remove();
      map.current = null;
    };
  }, []);

  usePlanesRealtimeSync(map);

  useEffect(() => {
    if (!styleMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (styleMenuRef.current && !styleMenuRef.current.contains(e.target as Node)) {
        setStyleMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [styleMenuOpen]);

  useEffect(() => {
    if (!boatsMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (boatsMenuRef.current && !boatsMenuRef.current.contains(e.target as Node)) {
        setBoatsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [boatsMenuOpen]);

  useEffect(() => {
    if (!planesMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (planesMenuRef.current && !planesMenuRef.current.contains(e.target as Node)) {
        setPlanesMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [planesMenuOpen]);

  const handleStyleChange = (styleId: string) => {
    setStyleMenuOpen(false);
    if (!map.current || styleId === currentStyleId) return;

    const styleOption = MAP_STYLES.find((s) => s.id === styleId);
    if (!styleOption) return;

    // Coupe le polling/websocket des couches actuelles avant de changer de style
    cleanupRefs.current.vigilance?.();
    cleanupRefs.current.boats?.();
    cleanupRefs.current.satellites?.();

    const mapInstance = map.current;

    // 'style.load' se déclenche une fois le nouveau style entièrement chargé
    // (léger : setStyle ne recharge que les tuiles du nouveau style, pas la page)
    mapInstance.once('style.load', () => {
      initLayers(mapInstance);
    });

    mapInstance.setStyle(styleOption.url);
    setCurrentStyleId(styleId);
  };

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

  const applyBoatSelection = (next: Set<string>) => {
    setBoatTypesSelected(next);
    if (!map.current) return;
    setBoatTypeFilter(map.current, Array.from(next));
    toggleBoatsLayer(map.current, next.size > 0);
  };

  const handleBoatTypeToggle = (type: string) => {
    const next = new Set(boatTypesSelected);
    if (next.has(type)) next.delete(type);
    else next.add(type);
    applyBoatSelection(next);
  };

  const handleBoatsToggleAll = () => {
    const allSelected = boatTypesSelected.size === BOAT_TYPES.length;
    applyBoatSelection(allSelected ? new Set() : new Set(BOAT_TYPES));
  };

  const applyPlaneSelection = (nextTypes: Set<string>, nextAltitudes: Set<string>) => {
    setPlaneTypesSelected(nextTypes);
    setAltitudesSelected(nextAltitudes);
    
    if (!map.current) return;
    
    setPlaneTypeFilter(map.current, Array.from(nextTypes));
    setAltitudeFilter(map.current, Array.from(nextAltitudes));
    
    // On calcule si la couche doit être affichée
    const isVisible = planesVisible && nextTypes.size > 0 && nextAltitudes.size > 0;
    togglePlaneLayer(map.current, isVisible);
  };

  const handlePlaneTypeToggle = (type: string) => {
    const next = new Set(planeTypesSelected);
    if (next.has(type)) next.delete(type);
    else next.add(type);
    applyPlaneSelection(next, altitudesSelected);
  };

  const handlePlaneTypeToggleAll = () => {
    const allSelected = planeTypesSelected.size === PLANE_TYPES.length;
    const nextTypes = allSelected ? new Set<string>() : new Set(PLANE_TYPES);
    // Si on sélectionne tout, on s'assure d'avoir aussi au moins toutes les altitudes pour afficher la couche
    const nextAltitudes = (!allSelected && altitudesSelected.size === 0) 
      ? new Set(ALTITUDE_STOPS) 
      : altitudesSelected;

    applyPlaneSelection(nextTypes, nextAltitudes);
  };

  const handleAltitudeToggle = (stop: string) => {
    const next = new Set(altitudesSelected);
    if (next.has(stop)) next.delete(stop);
    else next.add(stop);
    applyPlaneSelection(planeTypesSelected, next);
  };

  const handleAltitudeToggleAll = () => {
    const allSelected = altitudesSelected.size === ALTITUDE_STOPS.length;
    const nextAltitudes = allSelected ? new Set<string>() : new Set(ALTITUDE_STOPS);

    // Conserve la sélection des types d'avions telle quelle sans interférer
    applyPlaneSelection(planeTypesSelected, nextAltitudes);
  };

  const handleSatellitesData = () => {
    if (!map.current) return;
    const newVisibility = !visibleSatellites;
    toggleSatellitesLayer(map.current, newVisibility);
    setVisibleSatellites(newVisibility);
  };

  return (
    <div className="france-map-wrapper">
      <div ref={mapContainer} className="map-container" />

      {mapGestion.getMapIsExpanded() !== false && (
        <>
          {/* Filtres de données (Satellites, Avions, etc.) */}
          <div className="map-controls">
            <button
              type="button"
              className="map-toggle-btn map-toggle-btn--satellite"
              data-active={visibleSatellites}
              onClick={handleSatellitesData}
            >
              <span className="map-toggle-btn__dot" aria-hidden="true" />
              Satellites
            </button>

            <div className="map-filter-switcher" ref={planesMenuRef}>
              <button
                type="button"
                className="map-toggle-btn map-toggle-btn--plane"
                data-active={visiblePlanes}
                aria-haspopup="menu"
                aria-expanded={planesMenuOpen}
                onClick={() => {
                  setPlanesMenuOpen((v) => !v);
                  
                  // Si la couche n'était pas active, on l'active dans React ET sur MapLibre
                  if (!planesVisible) {
                    setPlanesVisible(true);
                    if (map.current) {
                      togglePlaneLayer(map.current, planeTypesSelected.size > 0 && altitudesSelected.size > 0);
                    }
                  }
                }}
              >
                <span className="map-toggle-btn__dot" aria-hidden="true" />
                Avions
              </button>

              {planesMenuOpen && (
                <div className="map-filter-menu map-filter-menu--planes" role="menu">
                  <div className="map-filter-menu-section-label">Type d'avion</div>
                  <button
                    type="button"
                    role="menuitem"
                    className="map-style-menu-item map-filter-menu-item--all"
                    data-active={planeTypesSelected.size === PLANE_TYPES.length}
                    onClick={handlePlaneTypeToggleAll}
                  >
                    Tout
                  </button>
                  {PLANE_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      role="menuitemcheckbox"
                      aria-checked={planeTypesSelected.has(type)}
                      className="map-style-menu-item"
                      data-active={planeTypesSelected.has(type)}
                      onClick={() => handlePlaneTypeToggle(type)}
                    >
                      {PLANE_TYPE_LABELS[type]}
                    </button>
                  ))}

                  <div className="map-filter-menu-section-label">Altitude</div>
                  <button
                    type="button"
                    role="menuitem"
                    className="map-style-menu-item map-filter-menu-item--all"
                    data-active={altitudesSelected.size === ALTITUDE_STOPS.length}
                    onClick={handleAltitudeToggleAll}
                  >
                    Tout
                  </button>
                  {ALTITUDE_STOPS.map((stop) => (
                    <button
                      key={stop}
                      type="button"
                      role="menuitemcheckbox"
                      aria-checked={altitudesSelected.has(stop)}
                      className="map-style-menu-item"
                      data-active={altitudesSelected.has(stop)}
                      onClick={() => handleAltitudeToggle(stop)}
                    >
                      {ALTITUDE_LABELS[stop]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              className="map-toggle-btn map-toggle-btn--rail"
              data-active={visibleTrains}
              onClick={handleTrainsData}
            >
              <span className="map-toggle-btn__dot" aria-hidden="true" />
              Trains
            </button>

            <button
              type="button"
              className="map-toggle-btn map-toggle-btn--vigilance"
              data-active={vigilanceVisible}
              onClick={handleToggleVigilance}
            >
              <span className="map-toggle-btn__dot" aria-hidden="true" />
              Vigilance
            </button>

            <div className="map-filter-switcher" ref={boatsMenuRef}>
              <button
                type="button"
                className="map-toggle-btn map-toggle-btn--boat"
                data-active={visibleBoats}
                aria-haspopup="menu"
                aria-expanded={boatsMenuOpen}
                onClick={() => setBoatsMenuOpen((v) => !v)}
              >
                <span className="map-toggle-btn__dot" aria-hidden="true" />
                Bateaux
              </button>

              {boatsMenuOpen && (
                <div className="map-filter-menu map-filter-menu--boats" role="menu">
                  <button
                    type="button"
                    role="menuitem"
                    className="map-style-menu-item map-filter-menu-item--all"
                    data-active={boatTypesSelected.size === BOAT_TYPES.length}
                    onClick={handleBoatsToggleAll}
                  >
                    Tout
                  </button>
                  {BOAT_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      role="menuitemcheckbox"
                      aria-checked={boatTypesSelected.has(type)}
                      className="map-style-menu-item"
                      data-active={boatTypesSelected.has(type)}
                      onClick={() => handleBoatTypeToggle(type)}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sélecteur de calque de carte */}
          <div className="map-style-switcher" ref={styleMenuRef}>
            <button
              type="button"
              className="map-style-btn"
              onClick={() => setStyleMenuOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={styleMenuOpen}
              title="Changer le fond de carte"
            >
              <IconBurger />
            </button>

            {styleMenuOpen && (
              <div className="map-style-menu" role="menu">
                {MAP_STYLES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    role="menuitem"
                    className="map-style-menu-item"
                    data-active={s.id === currentStyleId}
                    onClick={() => handleStyleChange(s.id)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );}