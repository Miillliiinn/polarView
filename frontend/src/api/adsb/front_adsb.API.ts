import { useEffect } from "react";
import api from "../apiBridge.ts"
import { globalCache } from "../classCache.ts";

const planesAPI = async () => {
    const res = await api.get('/planes/adsb');
    return res.data;
}

export function AdsbData()
{  
    useEffect(() => 
    {
        const interval = setInterval(() => {
        planesAPI().then((data) => { globalCache.setAdsbCache(data); })}, 1000);
        return () => clearInterval(interval);
    }, []);
    return;
}