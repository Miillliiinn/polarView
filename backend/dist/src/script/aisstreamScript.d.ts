import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export interface ShipPosition {
    mmsi: number;
    name: string;
    latitude: number;
    longitude: number;
    speed: number;
    heading: number;
    lastUpdate: Date;
}
export declare class AisStreamAPI implements OnModuleInit, OnModuleDestroy {
    private readonly configService;
    private readonly logger;
    private ws;
    private readonly ships;
    private reconnectTimeout;
    private cleanupInterval;
    private destroyed;
    constructor(configService: ConfigService);
    onModuleInit(): void;
    private connect;
    private scheduleReconnect;
    private updateShipData;
    private pruneStaleShips;
    getAllShips(): ShipPosition[];
    onModuleDestroy(): void;
}
