import { useEffect } from "react";
import api from "../apiBridge";
import { globalCache } from "../classCache";

const meteoFranceAPI = async () => {
    const res = await api.get("/weather");
    return res.data;
}

export function MeteoFranceData()
{  
    let time : number = 10000;
    useEffect(() => 
    {
        const interval = setInterval(() => {
            meteoFranceAPI().then((data) => { globalCache.setMfCache(data); })}, time);
        return () => clearInterval(interval); 
    }, []);
    return;
}