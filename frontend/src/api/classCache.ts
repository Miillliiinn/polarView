export class Cache
{
    constructor(){}
    private openskyCache : [] = [];
    private scnfCache : [] = [];
    private meteofranceCache : [] = []

    setOpCache(newCache : []) { this.openskyCache = newCache };
    setSncfCache(newCache : []) { this.scnfCache = newCache };
    setMfCache(newCache: []) { this.meteofranceCache = newCache };

    getOpcach() { return this.openskyCache };
    getSncfCache() { return this.scnfCache };
    getMfCache() { return this.meteofranceCache };
}

export const globalCache = new Cache();