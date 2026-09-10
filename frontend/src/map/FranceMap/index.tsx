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
import { setupPhotoLightbox } from './utils/popUpImage';

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
  { id: 'liberty', label: '3D', url: 'https://tiles.openfreemap.org/styles/liberty' },
  { id: 'dark', label: 'Dark', url: 'https://tiles.openfreemap.org/styles/dark' },
  { id: 'bright', label: 'Marin', url: 'https://tiles.openfreemap.org/styles/bright' },
  { id: 'fiord', label: 'Blue', url: 'https://tiles.openfreemap.org/styles/fiord' },
  { id: 'positron', label: 'White', url: 'https://tiles.openfreemap.org/styles/positron' },
];

// Délai après une perte de contexte WebGL avant de considérer que le
// navigateur ne la restaurera pas tout seul (cas fréquent en ouvrant les
// DevTools / le mode responsive sur certains GPU/drivers, notamment en
// environnement virtualisé où le rendu WebGL est logiciel). Passé ce délai,
// on recrée la carte de zéro plutôt que de laisser un fond bleu figé.
// Volontairement court : en plein travail de mise au point responsive,
// on veut retrouver la carte quasi instantanément.
const CONTEXT_RESTORE_TIMEOUT_MS = 800;

export default function FranceMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const contextLostTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [vigilanceVisible, setVigilanceVisible] = useState(false);
  const [visibleTrains, setVisibleTrains] = useState(false);
  const [visiblePlanes, setVisiblePlanes] = useState(false);
  const [visibleBoats, setVisibleBoats] = useState(false);

  const [currentStyleId, setCurrentStyleId] = useState('dark');
  const [styleMenuOpen, setStyleMenuOpen] = useState(false);
  const styleMenuRef = useRef<HTMLDivElement>(null);

  // Refs miroir des états, pour éviter les closures obsolètes dans les listeners MapLibre
  const stateRef = useRef({ vigilanceVisible, visibleTrains, visiblePlanes, visibleBoats });
  useEffect(() => {
    stateRef.current = { vigilanceVisible, visibleTrains, visiblePlanes, visibleBoats };
  }, [vigilanceVisible, visibleTrains, visiblePlanes, visibleBoats]);

  // currentStyleId dans une ref pour pouvoir le lire depuis createMap()
  // (utilisée aussi lors d'une recréation suite à perte de contexte)
  const currentStyleIdRef = useRef(currentStyleId);
  useEffect(() => {
    currentStyleIdRef.current = currentStyleId;
  }, [currentStyleId]);

  // Fonctions de nettoyage des couches à effet de bord (polling / websocket)
  const cleanupRefs = useRef<{ vigilance: (() => void) | null; boats: (() => void) | null }>({
    vigilance: null,
    boats: null,
  });

  // (Ré)installe toutes les couches personnalisées et restaure leur visibilité actuelle.
  // Appelé au premier chargement, après chaque changement de style (setStyle les efface),
  // ET après une restauration de contexte WebGL (qui efface tout aussi).
  const initLayers = (mapInstance: maplibregl.Map) => {
    cleanupRefs.current.vigilance = setupVigilanceLayer(mapInstance);
    setupRailLayer(mapInstance);
    setupTrainsLayer(mapInstance);
    setupGareLayer(mapInstance);
    cleanupRefs.current.boats = setupBoatsLayer(mapInstance);
    setupPlanesLayer(mapInstance);

    const s = stateRef.current;
    toggleVigilanceLayer(mapInstance, s.vigilanceVisible);
    toggleRailLayer(mapInstance, s.visibleTrains);
    toggleGareLayer(mapInstance, s.visibleTrains);
    toggleBoatsLayer(mapInstance, s.visibleBoats);
    togglePlaneLayer(mapInstance, s.visiblePlanes);
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
    // cliquables pour dérouler le détail — requis par la licence des tuiles,
    // mais on évite qu'il reste ouvert en permanence à l'écran.
    mapInstance.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

    mapInstance.on('error', (e) => {
      console.error('[FranceMap] Erreur MapLibre:', e);
    });

    mapInstance.on('load', () => {
      if (!map.current) return;
      initLayers(mapInstance);
    });

    // --- Filet de sécurité resize : en plus du trackResize interne de
    // MapLibre, on observe nous-mêmes le container. Utile en mode
    // responsive (device toolbar) où la taille peut changer très
    // rapidement/plusieurs fois de suite pendant qu'on redimensionne. ---
    const resizeObserver = new ResizeObserver(() => {
      mapInstance.resize();
    });
    resizeObserver.observe(mapContainer.current);
    (mapInstance as any)._franceMapResizeObserver = resizeObserver;

    // --- Gestion de la perte de contexte WebGL (ouverture DevTools / mode
    // responsive sur certains GPU-drivers, environnements virtualisés, etc.) ---
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

  const handleStyleChange = (styleId: string) => {
    setStyleMenuOpen(false);
    if (!map.current || styleId === currentStyleId) return;

    const styleOption = MAP_STYLES.find((s) => s.id === styleId);
    if (!styleOption) return;

    // Coupe le polling/websocket des couches actuelles avant de changer de style
    cleanupRefs.current.vigilance?.();
    cleanupRefs.current.boats?.();

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
        <button
          type="button"
          className="map-toggle-btn map-toggle-btn--plane"
          data-active={visiblePlanes}
          onClick={handlePlanesData}
        >
          <span className="map-toggle-btn__dot" aria-hidden="true" />
          Avions
        </button>

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

        <button
          type="button"
          className="map-toggle-btn map-toggle-btn--boat"
          data-active={visibleBoats}
          onClick={handleBoatsData}
        >
          <span className="map-toggle-btn__dot" aria-hidden="true" />
          Bateaux
        </button>
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
    </div>
  );
}