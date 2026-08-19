import { useEffect } from "react";
import { globalCache } from "../classCache";

export interface ShipPosition
{
  mmsi: number;
  name: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  lastUpdate: string;
  shipType: number | null;
  shipTypeLabel: string;
}

const STALE_SHIP_MAX_AGE_MS = 30 * 60 * 1000; 
const PRUNE_INTERVAL_MS = 60 * 1000; 

export function AisStreamData()
{
  useEffect(() => {
    const source = new EventSource("http://localhost:3000/ships/stream");

    source.onmessage = (event) => {
      const ship: ShipPosition = JSON.parse(event.data);
      globalCache.upsertAisShip(ship);
    };

    source.onerror = (err) => {
      console.error("AIS SSE error", err);
    };

    const pruneInterval = setInterval(() => {
      globalCache.pruneStaleAisShips(STALE_SHIP_MAX_AGE_MS);
    }, PRUNE_INTERVAL_MS);

    return () => {
      source.close();
      clearInterval(pruneInterval);
    };
  }, []);

  return null;
}