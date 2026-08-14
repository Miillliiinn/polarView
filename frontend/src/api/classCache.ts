export class Cache
{
    constructor() {}

    private openskyCache: any[] = [];
    private scnfCache: any[] = [];
    private gareCache: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] };
    private railCache: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] };
    private meteofranceCache: any[] = [];
    private aisstreamCache: any[] = [];

    setOpCache(newCache: any[]) { this.openskyCache = newCache; }
    setSncfCache(newCache: any[]) { this.scnfCache = newCache; }
    setGareCache(newCache: GeoJSON.FeatureCollection) { this.gareCache = newCache; }
    setRailCache(newCache: GeoJSON.FeatureCollection) { this.railCache = newCache; }
    setMfCache(newCache: any[]) { this.meteofranceCache = newCache; }
    setAisCache(newcache: any[]) { this.aisstreamCache = newcache; }

    getOpCache() { return this.openskyCache; }
    getSncfCache() { return this.scnfCache; }
    getGareCache() { return this.gareCache; }
    getRailCache() { return this.railCache; }
    getMfCache() { return this.meteofranceCache; }
    getAisCache() { return this.aisstreamCache; }
}

export const globalCache = new Cache();