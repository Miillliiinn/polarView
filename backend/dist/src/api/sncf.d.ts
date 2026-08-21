export declare const GARES_MAJEURES: {
    id: string;
    name: string;
}[];
export declare function fetchSncfDepartures(apiKey: string): Promise<any[]>;
export declare function fetchSncfGares(): Promise<any>;
export declare function fetchSncfRailLines(): Promise<any>;
