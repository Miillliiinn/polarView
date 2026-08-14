import { globalCache } from "../classCache";
import api from "../apiBridge";
import { useEffect } from "react";

const aisStreamAPI = async () => {
    const res = await api.get("/ships");
    console.log(res.data);
    return res.data;
}

export function AisStreamData()
{  
    let time : number = 10000;
    useEffect(() => 
    {
        const interval = setInterval(() => {
            aisStreamAPI().then((data) => { globalCache.setAisCache(data); })}, time);
        return () => clearInterval(interval); 
    }, []);
    return;
}