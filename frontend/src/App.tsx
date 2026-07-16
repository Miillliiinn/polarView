import { useState, useEffect } from 'react'
import './App.css'
import ShowAllPlanesData from './api/opensky/showData';

function App()
{
  const planes = ShowAllPlanesData();

  return (
    <>
      {planes}
    </>
  )
}

export default App
