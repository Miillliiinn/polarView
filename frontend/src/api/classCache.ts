import { type ShipPosition } from "./aisstream/front_aisStreamAPI";

export class Cache
{
    constructor() {}

    private openskyCache: any[] = [];
    private scnfCache: any[] = [];
    private gareCache: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] };
    private railCache: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] };
    private meteofranceCache: any[] = [];

    setOpCache(newCache: any[]) { this.openskyCache = newCache; }
    setSncfCache(newCache: any[]) { this.scnfCache = newCache; }
    setGareCache(newCache: GeoJSON.FeatureCollection) { this.gareCache = newCache; }
    setRailCache(newCache: GeoJSON.FeatureCollection) { this.railCache = newCache; }
    setMfCache(newCache: any[]) { this.meteofranceCache = newCache; }

    getOpCache() { return this.openskyCache; }
    getSncfCache() { return this.scnfCache; }
    getGareCache() { return this.gareCache; }
    getRailCache() { return this.railCache; }
    getMfCache() { return this.meteofranceCache; }

    private static readonly AIS_FLUSH_INTERVAL_MS = 500; 

    private aisMap = new Map<number, ShipPosition>();
    private aisSnapshot: ShipPosition[] = [];
    private aisListeners = new Set<() => void>();
    private aisFlushTimer: ReturnType<typeof setTimeout> | null = null;

    upsertAisShip(ship: ShipPosition)
    {
        this.aisMap.set(ship.mmsi, ship); 
        this.scheduleAisFlush();
    }

    private scheduleAisFlush()
    {
        if (this.aisFlushTimer) return; 
        this.aisFlushTimer = setTimeout(() => {
        this.aisFlushTimer = null;
        this.aisSnapshot = Array.from(this.aisMap.values()); 
        this.notifyAis();
        }, Cache.AIS_FLUSH_INTERVAL_MS);
    }

    getAisCache() { return this.aisSnapshot; }

    subscribeAis(listener: () => void)
    {
        this.aisListeners.add(listener);
        return () => this.aisListeners.delete(listener);
    }

    private notifyAis()
    {
        this.aisListeners.forEach((l) => l());
    }

    pruneStaleAisShips(maxAgeMs: number)
    {
        const now = Date.now();
        let removed = 0;
        for (const [mmsi, ship] of this.aisMap)
        {
        if (now - new Date(ship.lastUpdate).getTime() > maxAgeMs)
        {
            this.aisMap.delete(mmsi);
            removed++;
        }
        }
        if (removed > 0)
        {
        this.aisSnapshot = Array.from(this.aisMap.values());
        this.notifyAis();
        }
    }
}

export const globalCache = new Cache();