import { useEffect } from "react";
import api from "../apiBridge";
import { globalCache } from "../classCache";

const satelliteAPI = async () => {
    const request = await api.get('satellite');
    return request.data;
}

export function SatelliteData()
{
    useEffect(() => {

        satelliteAPI().then((data) => {globalCache.setCelestCache(data)});

        const interval = setInterval(() => {
        satelliteAPI().then((data) => {globalCache.setCelestCache(data); })}, 1800000);
        return () => clearInterval(interval);
    }, []);
    return;
}
