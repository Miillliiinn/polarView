import { globalCache } from "../classCache";

export default function ShowAllShipsData()
{
    const ships = globalCache.getAisCache();
    // console.log('cache ais brut: ', ships[0]);
    return (
        <ul>
            {ships.map((ships: any) => (
                <li key={ships.mmsi}>
                    mmsi: {ships.mmsi} | name: {ships.name} | lat: {ships.latitude} | long: {ships.longitude} | vel: {ships.speed} | cap: {ships.heading} | lastUpdate: {ships.lastUpdate}
                </li>
            ))}
        </ul>
    );
}