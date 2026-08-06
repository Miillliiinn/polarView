export class Cache
{
    constructor(){}
    private openskyCache : any[] = [];
    private scnfCache : any[] = [];
    private gareCache: any[] = [];
    private meteofranceCache : any[] = [];

    setOpCache(newCache : any[]) { this.openskyCache = newCache };
    setSncfCache(newCache : any[]) { this.scnfCache = newCache };
    setGareCache(newCache : any[]) { this.gareCache = newCache };
    setMfCache(newCache: any[]) { this.meteofranceCache = newCache };

    getOpCache() { return this.openskyCache };
    getSncfCache() { return this.scnfCache };
    getGareCache() { return this.gareCache };
    getMfCache() { return this.meteofranceCache };
}

export const globalCache = new Cache();