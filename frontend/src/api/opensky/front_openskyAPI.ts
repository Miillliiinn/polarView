import { useState, useEffect } from "react";

import api from "../apiBridge.ts"

const webcamAPI = async () => {
    const res = await api.get('/planes');
    return res.data;
}

function planesData()
{
    const [planes, setPlanes] = useState([]);
    
    useEffect(() => {
        const interval = setInterval(() => {
        webcamAPI().then((data) => {
            setPlanes(data);
        })}, 100);
        return () => clearInterval(interval)
    }, []);
    return planes
}

export default planesData;