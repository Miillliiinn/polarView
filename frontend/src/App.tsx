import './App.css'
import ShowAllPlanesData from './api/opensky/showData';
import ShowAllTrainsData from './api/sncf/showData';
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom';
import FranceMap from './map/FranceMap';
import { TrainsData } from './api/sncf/front_sncfAPI';
import { PlanesData } from './api/opensky/front_openskyAPI';
import ShowAllMeteoFranceData from './api/meteofrance/showData';
import { MeteoFranceData } from './api/meteofrance/front_meteofranceAPI';

function AppContent() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <>
      <nav>
        <Link to="/">France</Link>
        <Link to="/avions">avions</Link>
        <Link to="/trains">trains</Link>
        <Link to="/meteo">meteo</Link>
      </nav>

      {/* Toujours monté, juste caché en CSS quand on n'est pas sur "/" */}
      <div style={{ display: isHome ? 'block' : 'none' }}>
        <FranceMap />
      </div>

      <Routes>
        <Route path="/avions" element={<ShowAllPlanesData />} />
        <Route path="/trains" element={<ShowAllTrainsData />} />
        <Route path="/meteo" element={<ShowAllMeteoFranceData />} />
      </Routes>
    </>
  );
}

function App() {
  PlanesData();
  TrainsData();
  MeteoFranceData();

  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
