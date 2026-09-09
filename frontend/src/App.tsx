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

/* --- Icônes de navigation (style filaire tactique) --- */

const IconFrance = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21s-7-6.1-7-11.5A7 7 0 0 1 12 2a7 7 0 0 1 7 7.5C19 14.9 12 21 12 21z" />
    <circle cx="12" cy="9.5" r="2.4" />
  </svg>
);

const IconPlane = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 15.5 21 8.2c1-.4 1.9.6 1.5 1.6L14.9 21l-2-6.3-6.4-1.9z" />
    <path d="M8.5 12.8 2.5 15.5l2.7 1.1 1.2 2.7 2.6-6" />
  </svg>
);

const IconTrain = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="3" width="14" height="13" rx="4" />
    <path d="M5 11h14" />
    <path d="M8 20l-2.5 2M16 20l2.5 2" />
    <circle cx="8.5" cy="14" r="0.6" fill="currentColor" />
    <circle cx="15.5" cy="14" r="0.6" fill="currentColor" />
  </svg>
);

const IconBoat = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 17h18l-2 3.2a2 2 0 0 1-1.7 1H6.7a2 2 0 0 1-1.7-1L3 17z" />
    <path d="M6 17l1-8h10l1 8" />
    <path d="M12 9V3M12 3l4 2.2M12 5.5 9 6.8" />
  </svg>
);

const IconCloud = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 18a4.5 4.5 0 0 1-.6-8.96A5.5 5.5 0 0 1 17.2 8.1 4 4 0 0 1 16.5 18H7z" />
  </svg>
);

const IconSun = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 2.5v2.4M12 19.1v2.4M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7" />
  </svg>
);

const IconMoon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5z" />
  </svg>
);

const IconSignal = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 20h.01M7 20v-4M12 20v-8M17 20V8M22 20V4" />
  </svg>
);

const NAV_LINKS = [
  { to: '/', label: 'France', end: true, icon: IconFrance },
  { to: '/avions', label: 'Avions', end: false, icon: IconPlane },
  { to: '/trains', label: 'Trains', end: false, icon: IconTrain },
  { to: '/bateaux', label: 'Bateaux', end: false, icon: IconBoat },
  { to: '/meteo', label: 'Météo', end: false, icon: IconCloud },
];

/* --- Fonctions utilitaires du poste de contrôle --- */

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function useUptime() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function usePing() {
  const [ping, setPing] = useState(12);
  useEffect(() => {
    const interval = setInterval(() => {
      setPing(Math.floor(Math.random() * 8) + 10);
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  return ping;
}

const formatTime = (date: Date) =>
  date.toLocaleTimeString('fr-FR', { hour12: false });

const formatDate = (date: Date) =>
  date.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });

const isDaytime = (date: Date) => {
  const h = date.getHours();
  return h >= 7 && h < 20;
};

/* --- Bandeau d'instruments (Poste de contrôle) --- */

function ControlDeck() {
  const now = useClock();
  const uptime = useUptime();
  const ping = usePing();
  const location = useLocation();

  const active = NAV_LINKS.find(({ to, end }) =>
    end ? location.pathname === to : location.pathname.startsWith(to)
  );

  return (
    <div className="control-deck">
      <div className="deck-row">
        <div className="deck-item">
          <span className="deck-icon">{isDaytime(now) ? <IconSun /> : <IconMoon />}</span>
          <div className="deck-text">
            <span className="deck-label">Heure UTC+1</span>
            <span className="deck-value mono">{formatTime(now)}</span>
          </div>
        </div>

        <div className="deck-item">
          <div className="deck-text">
            <span className="deck-label">Date Système</span>
            <span className="deck-value">{formatDate(now)}</span>
          </div>
        </div>

        <div className="deck-item">
          <div className="deck-text">
            <span className="deck-label">Temps de Session</span>
            <span className="deck-value mono">{uptime}</span>
          </div>
        </div>

        <div className="deck-item">
          <span className="deck-icon"><IconSignal /></span>
          <div className="deck-text">
            <span className="deck-label">Latence Réseau</span>
            <span className="deck-value mono text-amber">{ping} ms</span>
          </div>
        </div>

        <div className="deck-item">
          <div className="deck-text">
            <span className="deck-label">Canal Visualisé</span>
            <span className="deck-value highlight">{active?.label ?? 'France'}</span>
          </div>
        </div>

        <div className="deck-item status-item">
          <span className="status-dot" />
          <div className="deck-text">
            <span className="deck-label">Réseau Opérationnel</span>
            <span className="deck-value mono badge-status">LIVE MONITORING</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = (expanded: boolean) => {
    setIsExpanded(expanded);
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 50);
  };

  useEffect(() => {
    if (isHome) {
      const t = setTimeout(() => window.dispatchEvent(new Event('resize')), 60);
      return () => clearTimeout(t);
    }
  }, [isHome]);

  const showMapChrome = isHome && !isExpanded;

  return (
      <div className={`app-shell ${!isExpanded ? 'ambient-active' : ''}`}>
      <nav className={`site-nav ${isExpanded ? 'is-nav-hidden' : ''}`}>
        <div className="nav-inner">
          <div className="nav-brand">
            <span className="nav-brand-dot" />
            <span className="brand-title">TRACKER VIEW</span>
            <span className="brand-tag">HQ-OPS</span>
          </div>
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
        <ControlDeck />
      </nav>

      <div className={`home-page ${isExpanded ? 'is-expanded' : ''} ${!isHome && !isExpanded ? 'is-hidden-route' : ''}`}>

        {showMapChrome && (
          <header className="project-intro">
            <div className="tactical-badge">SECTEUR METROPOLITAIN · OPÉRATIONNEL</div>
            <h2>Poste de Surveillance Multi-Flux Temps Réel</h2>
            <p className="intro-lead">Supervision centralisée des lignes ferroviaires, du trafic aérien et de la navigation maritime.</p>
          </header>
        )}

        <div className={`map-wrapper ${isExpanded ? 'fullscreen' : isHome ? 'preview' : 'hidden'}`}>

          {showMapChrome && (
            <div className="map-overlay" onClick={() => toggleExpand(true)}>
              <span className="expand-badge">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <polyline points="9 21 3 21 3 15"></polyline>
                  <line x1="21" y1="3" x2="14" y2="10"></line>
                  <line x1="3" y1="21" x2="10" y2="14"></line>
                </svg>
                Plein Écran Tactical View
              </span>
            </div>
          )}

          {isExpanded && (
            <button
              className="close-expanded-btn"
              onClick={() => toggleExpand(false)}
              title="Réduire"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}

          {/* Bordure verte maximale ajustée aux coins */}
          <span className="map-frame-corner tl" aria-hidden="true" />
          <span className="map-frame-corner tr" aria-hidden="true" />
          <span className="map-frame-corner bl" aria-hidden="true" />
          <span className="map-frame-corner br" aria-hidden="true" />

          {/* Bandeaux d'information radar */}
          <span className="map-readout" aria-hidden="true">GRID 48.8566° N, 2.3522° E &middot; FLUX EN DIRECT</span>
          <span className="map-sec-code" aria-hidden="true">ZONE ALPHA-1</span>

          <div className={`map-container-inner ${!isExpanded ? 'disabled-events' : ''}`}>
            <FranceMap />
          </div>

        </div>
      </div>

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