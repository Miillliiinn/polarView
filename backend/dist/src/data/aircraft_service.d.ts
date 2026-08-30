import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
export declare class AircraftService implements OnModuleInit, OnModuleDestroy {
    private db;
    onModuleInit(): void;
    private ensureDbIsExtracted;
    onModuleDestroy(): void;
    getAircraftInDbByIcao(icao24: string): any;
}
