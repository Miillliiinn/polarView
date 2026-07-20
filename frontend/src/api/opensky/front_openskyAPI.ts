import { useEffect } from "react";
import api from "../apiBridge.ts"
import { globalCache } from "../classCache.ts";

const planesAPI = async () => {
    const res = await api.get('/planes');
    return res.data;
}

export function PlanesData()
{  
    useEffect(() => 
    {
        const interval = setInterval(() => {
        planesAPI().then((data) => { globalCache.setOpCache(data); })}, 100);
        return () => clearInterval(interval);
    }, []);
    return;
}

export function swapJsonToGeoJson()
{
    // changer les coord long et lat (json) en geojson
}