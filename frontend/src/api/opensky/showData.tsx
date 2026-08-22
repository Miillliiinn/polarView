import { globalCache } from "../classCache";

export default function ShowAllPlanesData()
{
    const planes = globalCache.getOpCache();
    // console.log('cache avion brut: ', planes[0]);
    return (
        <ul>
            {planes.map((plane: any) => (
                <li key={plane.icao24}>
                    id: {plane.icao24} | cs: {plane.callsign} | from: {plane.country} | long: {plane.longitude} | lat: {plane.latitude} | alt: {plane.altitude} | cap: {plane.heading} | vel: {plane.velocity} |
                </li>
            ))}
        </ul>
    );
}