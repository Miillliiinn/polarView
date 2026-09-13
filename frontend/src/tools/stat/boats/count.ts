import { globalCache } from "../../../api/classCache";

export function countBoats()
{
    return globalCache.getAisCache().length;
}