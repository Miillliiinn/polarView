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
import ShowAllCelestData from './api/celestrack/showData';
import { SatelliteData } from './api/celestrack/front_celestrack';

/* --- Icônes de navigation (style filaire tactique) --- */

const IconFrance = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21s-7-6.1-7-11.5A7 7 0 0 1 12 2a7 7 0 0 1 7 7.5C19 14.9 12 21 12 21z" />
    <circle cx="12" cy="9.5" r="2.4" />
  </svg>
);

const IconPlane = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.8 19.2 16 11l3.5-3.5c0.8-0.8 0.8-2 0-2.8s-2-0.8-2.8 0L13.2 8.2 5 6.4c-0.7-0.2-1.4 0.3-1.6 1s0.3 1.4 1 1.6l6.8 3.5-3.2 3.2-3.1-0.8c-0.5-0.1-1 0.1-1.3 0.5l-0.6 0.8c-0.3 0.4-0.2 1 0.2 1.3l3.5 3.5c0.3 0.4 0.9 0.5 1.3 0.2l0.8-0.6c0.4-0.3 0.6-0.8 0.5-1.3l-0.8-3.1 3.2-3.2 3.5 6.8c0.2 0.7 0.9 1.2 1.6 1s1.2-0.9 1-1.6z" />
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

const IconSatellite = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="6" height="6" rx="1" transform="rotate(-45 12 12)" />
    <path d="M9.17 9.17 4.22 4.22m3.54-1.41-4.95 4.95" />
    <path d="m14.83 14.83 4.95 4.95m-3.54 1.41 4.95-4.95" />
    <path d="M6.5 17.5a4 4 0 0 0 5.66 0" />
    <path d="m7.5 16.5-2 2" />
  </svg>
);

const IconWave = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0" />
    <path d="M2 17c2-3 4-3 6 0s4 3 6 0 4-3 6 0" />
  </svg>
);

const IconGauge = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18z" />
    <path d="M12 12 16 8" />
    <path d="M12 8v1M6 12h1M17 12h1" />
  </svg>
);

const IconWind = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 8h11a2.5 2.5 0 1 0-2.2-3.6" />
    <path d="M3 12h15a2.5 2.5 0 1 1-2.2 3.6" />
    <path d="M3 16h8a2 2 0 1 1-1.6 3.2" />
  </svg>
);

const NAV_LINKS = [
  { to: '/', label: 'France', end: true, icon: IconFrance },
  { to: '/avions', label: 'Avions', end: false, icon: IconPlane },
  { to: '/trains', label: 'Trains', end: false, icon: IconTrain },
  { to: '/bateaux', label: 'Bateaux', end: false, icon: IconBoat },
  { to: '/satellite', label: 'Satellite', end: false, icon: IconSatellite },
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

function useRandomWalk(min: number, max: number, step: number, intervalMs = 2500) {
  const [value, setValue] = useState(() => Math.floor((min + max) / 2));
  useEffect(() => {
    const id = setInterval(() => {
      setValue((v) => {
        const delta = (Math.random() * 2 - 1) * step;
        return Math.min(max, Math.max(min, Math.round(v + delta)));
      });
    }, intervalMs);
    return () => clearInterval(id);
  }, [min, max, step, intervalMs]);
  return value;
}

function usePacketCounter() {
  const [count, setCount] = useState(184200);
  useEffect(() => {
    const id = setInterval(() => {
      setCount((c) => c + Math.floor(Math.random() * 40) + 5);
    }, 1200);
    return () => clearInterval(id);
  }, []);
  return count;
}

function useMouseSpotlight(active: boolean) {
  useEffect(() => {
    if (!active) return;

    const handleMouseMove = (e: MouseEvent) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [active]);
}

const formatPackets = (n: number) => n.toLocaleString('fr-FR');

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
  //const location = useLocation();

  // const active = NAV_LINKS.find(({ to, end }) =>
  //   end ? location.pathname === to : location.pathname.startsWith(to)
  // );

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

        {/* <div className="deck-item">
          <div className="deck-text">
            <span className="deck-label">Canal Visualisé</span>
            <span className="deck-value highlight">{active?.label ?? 'France'}</span>
          </div>
        </div> */}

        {/* <div className="deck-item status-item">
          <span className="status-dot" />
          <div className="deck-text">
            <span className="deck-label">Réseau </span>
            <span className="deck-value mono badge-status">LIVE</span>
          </div>
        </div> */}

      </div>
    </div>
  );
}

/* --- Panneau de diagnostic système (sous la carte) --- */

function SystemReadout() {
  const signal = useRandomWalk(82, 99, 4);
  const coverage = useRandomWalk(88, 97, 3);
  const packets = usePacketCounter();
  const windSpeed = useRandomWalk(8, 34, 5, 4000);
  const pressure = useRandomWalk(1008, 1024, 2, 5000);
  const satellites = useRandomWalk(11, 18, 2, 6000);

  return (
    <div className="system-readout">
      <div className="readout-header">
        <span className="readout-title">DIAGNOSTIC SYSTÈME</span>
        <span className="readout-sub">MISE À JOUR CONTINUE</span>
      </div>

      <div className="readout-grid">
        <div className="readout-tile">
          <span className="readout-icon"><IconSatellite /></span>
          <div className="readout-text">
            <span className="readout-label">Satellites Liés</span>
            <span className="readout-value">{satellites}</span>
          </div>
        </div>

        <div className="readout-tile">
          <span className="readout-icon"><IconGauge /></span>
          <div className="readout-text">
            <span className="readout-label">Intégrité Signal</span>
            <span className="readout-value">{signal}%</span>
          </div>
          <div className="readout-bar">
            <div className="readout-bar-fill" style={{ width: `${signal}%` }} />
          </div>
        </div>

        <div className="readout-tile">
          <span className="readout-icon"><IconWave /></span>
          <div className="readout-text">
            <span className="readout-label">Couverture Radar</span>
            <span className="readout-value">{coverage}%</span>
          </div>
          <div className="readout-bar">
            <div className="readout-bar-fill amber" style={{ width: `${coverage}%` }} />
          </div>
        </div>

        <div className="readout-tile">
          <div className="readout-text">
            <span className="readout-label">Paquets Analysés</span>
            <span className="readout-value mono">{formatPackets(packets)}</span>
          </div>
        </div>

        <div className="readout-tile">
          <span className="readout-icon"><IconWind /></span>
          <div className="readout-text">
            <span className="readout-label">Vent Secteur</span>
            <span className="readout-value">{windSpeed} km/h</span>
          </div>
        </div>

        <div className="readout-tile">
          <div className="readout-text">
            <span className="readout-label">Pression Atmo.</span>
            <span className="readout-value">{pressure} hPa</span>
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
  useMouseSpotlight(!isExpanded);
  return (
    <div className={`app-shell ${!isExpanded ? 'ambient-active' : ''}`}>
      {!isExpanded && (
        <span className="cursor-spotlight" aria-hidden="true">
          <span className="crosshair crosshair-h" />
          <span className="crosshair crosshair-v" />
        </span>
      )}
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
                Plein Écran
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
          <span className="map-readout" aria-hidden="true">Europe Ouest &middot; LIVE</span>

          <div className={`map-container-inner ${!isExpanded ? 'disabled-events' : ''}`}>
            <FranceMap />
          </div>

        </div>

        {showMapChrome && <SystemReadout />}

      </div>

      <div className="app-content">
        <Routes>
          <Route path="/" element={null} />
          <Route path="/avions" element={<ShowAllPlanesData />} />
          <Route path="/trains" element={<ShowAllTrainsData />} />
          <Route path="/meteo" element={<ShowAllMeteoFranceData />} />
          <Route path="/bateaux" element={<ShowAllShipsData />} />
          <Route path="/satellite" element={<ShowAllCelestData />} />
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
  SatelliteData();

  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;