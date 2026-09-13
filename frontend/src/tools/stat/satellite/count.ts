import { globalCache } from "../../../api/classCache";

export function countSatellite()
{
    return globalCache.getCelestrackCache().length;
}