import { useSyncExternalStore } from 'react';
import { globalCache } from "../classCache";
import { type ShipPosition } from './front_aisStreamAPI';

export default function ShowAllShipsData()
{
  const ships = useSyncExternalStore(
    (listener) => globalCache.subscribeAis(listener),
    () => globalCache.getAisCache()
  );

  return (
    <ul>
      {ships.map((ship: ShipPosition) => (
        <li key={ship.mmsi}>
          mmsi: {ship.mmsi} | name: {ship.name} | lat: {ship.latitude.toFixed(2)} | long: {ship.longitude.toFixed(2)} | vel: {ship.speed} | cap: {ship.heading} | type: { ship.shipTypeLabel || ""} | lastUpdate: {new Date(ship.lastUpdate).toLocaleTimeString()} 
        </li>
      ))}
    </ul>
  );
}