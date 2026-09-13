import { globalCache } from "../../../api/classCache";

export function countPlanes()
{
    return globalCache.getOpCache().length;
}