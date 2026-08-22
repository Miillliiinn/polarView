export interface AdsbZone {
    lat: number;
    lon: number;
    dist: number;
}
export declare const DEFAULT_FRANCE_ZONES: AdsbZone[];
export declare function fetchAdsbStates(zones?: AdsbZone[]): Promise<{
    icao24: any;
    callsign: any;
    registration: any;
    longitude: any;
    latitude: any;
    altitude: number;
    onGround: boolean;
    heading: any;
    velocity: number;
    verticalRate: number;
    squawk: any;
    typeCode: any;
    typeLabel: string | null;
    engines: number | null;
    kind: import("./aircraftClassifier").AircraftKind;
    isMilitary: boolean;
    isHelicopter: boolean;
    lastSeenSeconds: any;
}[]>;
