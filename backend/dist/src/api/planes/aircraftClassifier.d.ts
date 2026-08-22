export type AircraftKind = 'commercial' | 'privateJet' | 'generalAviation' | 'helicopter' | 'militaryHelicopter' | 'military' | 'glider' | 'balloon' | 'uav' | 'groundVehicle' | 'unknown';
export declare function classifyOpenskyCategory(category: number | null | undefined): {
    kind: AircraftKind;
    isHelicopter: boolean;
};
export interface ClassificationResult {
    kind: AircraftKind;
    isMilitary: boolean;
    isHelicopter: boolean;
    engines: number | null;
    typeLabel: string | null;
}
export declare function classifyAircraft(raw: any): ClassificationResult;
