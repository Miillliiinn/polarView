import planesData from "./front_openskyAPI";

export default function ShowAllPlanesData()
{

    const planes = planesData();
    return (
        <ul>
            {planes.map((plane: any) => (
                <li key={plane.icao24}>
                    id: {plane.callsign} | from: {plane.country} | long: {plane.longitude} | lat: {plane.latitude} | cap: {plane.heading} | vel: {plane.velocity}
                </li>
            ))}
        </ul>
    );
}