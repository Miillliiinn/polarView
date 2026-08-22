export interface CombinedAircraft {
    icao24: string;
    callsign: string | null;
    originCountry: string | null;
    registration: string | null;
    longitude: number | null;
    latitude: number | null;
    altitude: number | null;
    onGround: boolean | null;
    heading: number | null;
    velocity: number | null;
    verticalRate: number | null;
    squawk: string | null;
    typeCode: string | null;
    typeLabel: string | null;
    engines: number | null;
    kind: string | null;
    isMilitary: boolean | null;
    isHelicopter: boolean | null;
    lastSeenSeconds: number | null;
    source: 'adsb' | 'opensky' | 'both';
}
export declare function mergeAdsbAndOpensky(adsbCache: any[], openskyCache: any[]): CombinedAircraft[];
