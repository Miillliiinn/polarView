import { useEffect, useState } from 'react';
import './App.css';
import ShowAllPlanesData from './api/opensky/showData';
import ShowAllTrainsData from './api/sncf/showData';
import { BrowserRouter, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import FranceMap from './map/FranceMap';
import { TrainsData } from './api/sncf/front_sncfAPI';
import { PlanesData } from './api/opensky/front_openskyAPI';
import ShowAllMeteoFranceData from './api/meteofrance/showData';
import { MeteoFranceData } from './api/meteofrance/front_meteofranceAPI';
import { GareData } from './api/sncf/gare/front_gareAPI';
import { RailData } from './api/sncf/rail/rail';
import { AisStreamData } from './api/aisstream/front_aisStreamAPI';
import ShowAllShipsData from './api/aisstream/showData';

/* --- Icônes de navigation (traits fins, cohérentes avec le reste de l'UI) --- */

const IconFrance = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21s-7-6.1-7-11.5A7 7 0 0 1 12 2a7 7 0 0 1 7 7.5C19 14.9 12 21 12 21z" />
    <circle cx="12" cy="9.5" r="2.4" />
  </svg>
);

const IconPlane = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 15.5 21 8.2c1-.4 1.9.6 1.5 1.6L14.9 21l-2-6.3-6.4-1.9z" />
    <path d="M8.5 12.8 2.5 15.5l2.7 1.1 1.2 2.7 2.6-6" />
  </svg>
);

const IconTrain = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="3" width="14" height="13" rx="4" />
    <path d="M5 11h14" />
    <path d="M8 20l-2.5 2M16 20l2.5 2" />
    <circle cx="8.5" cy="14" r="0.6" fill="currentColor" />
    <circle cx="15.5" cy="14" r="0.6" fill="currentColor" />
  </svg>
);

const IconBoat = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 17h18l-2 3.2a2 2 0 0 1-1.7 1H6.7a2 2 0 0 1-1.7-1L3 17z" />
    <path d="M6 17l1-8h10l1 8" />
    <path d="M12 9V3M12 3l4 2.2M12 5.5 9 6.8" />
  </svg>
);

const IconCloud = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 18a4.5 4.5 0 0 1-.6-8.96A5.5 5.5 0 0 1 17.2 8.1 4 4 0 0 1 16.5 18H7z" />
  </svg>
);

const NAV_LINKS = [
  { to: '/', label: 'France', end: true, icon: IconFrance },
  { to: '/avions', label: 'Avions', end: false, icon: IconPlane },
  { to: '/trains', label: 'Trains', end: false, icon: IconTrain },
  { to: '/bateaux', label: 'Bateaux', end: false, icon: IconBoat },
  { to: '/meteo', label: 'Météo', end: false, icon: IconCloud },
];

function AppContent()
{
  const location = useLocation();
  const isHome = location.pathname === '/';

  // État pour la carte agrandie
  const [isExpanded, setIsExpanded] = useState(false);

  // Fonction pour basculer la taille sans recharger la carte
  const toggleExpand = (expanded: boolean) => {
    setIsExpanded(expanded);
    // Notifie la bibliothèque de cartes (OpenFreeMap / MapLibre) que le conteneur a changé de taille
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 50);
  };

  // Quand on revient sur la page d'accueil, le conteneur de la carte redevient visible
  // (il était masqué en display:none, jamais démonté) : on force MapLibre à se redessiner.
  useEffect(() => {
    if (isHome) {
      const t = setTimeout(() => window.dispatchEvent(new Event('resize')), 60);
      return () => clearTimeout(t);
    }
  }, [isHome]);

  const showMapChrome = isHome && !isExpanded;

  return (
    <div className="app-shell">
      {/* Masque la barre de navigation uniquement quand la carte est agrandie */}
      {!isExpanded && (
        <nav className="site-nav">
          <div className="nav-inner">
            <span className="nav-brand">
              <span className="nav-brand-dot" />
              TRACKER VIEW&nbsp;
            </span>
            <div className="nav-links">
              {NAV_LINKS.map(({ to, label, end, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                >
                  <Icon />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        </nav>
      )}

      {/*
        Conteneur unique de la carte, toujours monté dans le DOM (même hors de la page
        d'accueil) : on ne fait que le masquer en CSS pour ne jamais recharger MapLibre.
      */}
      <div className={`home-page ${isExpanded ? 'is-expanded' : ''} ${!isHome && !isExpanded ? 'is-hidden-route' : ''}`}>

        {/* Présentation du projet */}
        {showMapChrome && (
          <header className="project-intro">
            <p className="eyebrow">Suivi temps réel &middot; territoire français / Europe de l'ouest</p>
            <h1>Une seule carte pour tout ce qui bouge en France.</h1>
            <p className="intro-lead">
              Trains, avions et navires suivis en direct sur fond de carte OpenFreeMap,
              croisés avec les prévisions Météo-France.
            </p>
          </header>
        )}

        <div className={`map-wrapper ${isExpanded ? 'fullscreen' : isHome ? 'preview' : 'hidden'}`}>

          {/* Overlay d'agrandissement (uniquement en mode vignette) */}
          {showMapChrome && (
            <div className="map-overlay" onClick={() => toggleExpand(true)}>
              <span className="expand-badge">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <polyline points="9 21 3 21 3 15"></polyline>
                  <line x1="21" y1="3" x2="14" y2="10"></line>
                  <line x1="3" y1="21" x2="10" y2="14"></line>
                </svg>
                Agrandir la carte
              </span>
            </div>
          )}

          {/* Bouton réduire (uniquement en mode plein écran) */}
          {isExpanded && (
            <button
              className="close-expanded-btn"
              onClick={() => toggleExpand(false)}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="4" y2="22"></line>
                <line x1="4" y1="2" x2="22" y2="22"></line>
              </svg>
            </button>
          )}

          {/* Repères façon "verrouillage radar", coins de la carte */}
          <span className="map-frame-corner tl" aria-hidden="true" />
          <span className="map-frame-corner tr" aria-hidden="true" />
          <span className="map-frame-corner bl" aria-hidden="true" />
          <span className="map-frame-corner br" aria-hidden="true" />
          <span className="map-readout" aria-hidden="true">SECTEUR&nbsp;FR &middot; LIVE</span>

          {/* UN SEUL ET UNIQUE CHARGEMENT DE LA MAP */}
          <div className={`map-container-inner ${!isExpanded ? 'disabled-events' : ''}`}>
            <FranceMap />
          </div>

        </div>
      </div>

      {/* Routes pour les autres modules */}
      <div className="app-content">
        <Routes>
          <Route path="/" element={null} />
          <Route path="/avions" element={<ShowAllPlanesData />} />
          <Route path="/trains" element={<ShowAllTrainsData />} />
          <Route path="/meteo" element={<ShowAllMeteoFranceData />} />
          <Route path="/bateaux" element={<ShowAllShipsData />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  PlanesData();
  TrainsData();
  MeteoFranceData();
  GareData();
  RailData();
  AisStreamData();

  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;

/*
            <ul className="source-tags">
              <li>OPENFREEMAP</li>
              <li>SNCF</li>
              <li>OPENSKY</li>
              <li>AISSTREAM</li>
              <li>MÉTÉO-FRANCE</li>
              <li>WIKIMEDIA COMMONS</li>
              <li>ADSB.FI &middot; ADSB.LOL</li>
            </ul>
*/