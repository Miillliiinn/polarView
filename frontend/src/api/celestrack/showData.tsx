import { useEffect, useState } from "react";
import { globalCache } from "../classCache";

export default function ShowAllCelestData()
{
    const [satellite, setSatellite] = useState<any[]>(globalCache.getCelestrackCache());

    useEffect(() => {
        const interval = setInterval(() => {
            setSatellite(globalCache.getCelestrackCache());
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <ul>
            {satellite.map((st: any) => (
                <li key={st.id}>
                    id: {st.id}| name: {st.name}| objectId: {st.objectId}| owner: {st.owner}| launchDate: {st.launchDate}| epoch: {st.epoch}| meanMotion: {st.meanMotion}| eccentricity: {st.eccentricity}| inclination: {st.inclination}| raOfAscNode: {st.raOfAscNode}| argOfPericenter: {st.argOfPericenter}| meanAnomaly: {st.meanAnomaly}| ephemerisType: {st.ephemerisType}| classificationType: {st.classificationType}| elementSetNo: {st.elementSetNo}| revAtEpoch: {st.revAtEpoch}| bstar: {st.bstar}| meanMotionDot: {st.meanMotionDot}| meanMotionDdot: {st.meanMotionDdot}
                </li>
            ))}
        </ul>
    )
}
