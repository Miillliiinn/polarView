import { useEffect } from "react"
import api from "../apiBridge"
import { globalCache } from "../classCache";


const trainsAPI = async () => {
    const res = await api.get("/trains");
    return res.data;
}

export function TrainsData()
{
    useEffect(() => {
        const interval = setInterval(() => {
        trainsAPI().then((data) => { globalCache.setSncfCache(data); }); }, 100);
        return () => clearInterval(interval); }, []);
    return null;
}