import { useState, useEffect } from 'react'
import './App.css'
import ShowAllPlanesData from './api/opensky/showData';
import { BrowserRouter, Link, Route, Routes} from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">France</Link>
        <Link to="/avions">Voir les avions</Link>
      </nav>

      <Routes>
        <Route path="/" element={<h4>Page d'accueil</h4>} />
        <Route path="/avions" element={<ShowAllPlanesData />} /> 
      </Routes>
    </BrowserRouter>
  )
}

export default App
