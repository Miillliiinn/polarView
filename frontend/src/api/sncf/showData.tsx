import { globalCache } from "../classCache";

export default function ShowAllTrainsData()
{
    const trains = globalCache.getSncfCache();
    return (
        <ul>
            {trains.map((trains : any) => (
                <li key={trains.id}>
                    id: {trains.id} | nb: {trains.trainNumber} | type: {trains.type} | operator: {trains.operator} | departTime: {trains.departureTime} | stationName: {trains.stationName} | long: {trains.longitude} | lat: {trains.latitude}
                </li>
            ))}
        </ul>
    )
}