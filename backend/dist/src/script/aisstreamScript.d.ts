import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
export interface ShipPosition {
    mmsi: number;
    name: string;
    latitude: number;
    longitude: number;
    speed: number;
    heading: number;
    lastUpdate: Date;
    shipType: number | null;
    shipTypeLabel: string;
}
export declare class AisStreamAPI implements OnModuleInit, OnModuleDestroy {
    private readonly configService;
    private readonly logger;
    private ws;
    private readonly ships;
    private readonly shipTypes;
    private readonly shipUpdates$;
    private reconnectTimeout;
    private cleanupInterval;
    private watchdogInterval;
    private lastMessageAt;
    private destroyed;
    constructor(configService: ConfigService);
    onModuleInit(): void;
    private connect;
    private scheduleReconnect;
    private checkWatchdog;
    private updateShipType;
    private updateShipData;
    private pruneStaleShips;
    getShipUpdates(): Observable<ShipPosition>;
    getAllShips(): ShipPosition[];
    getStreamHealth(): {
        connected: boolean;
        lastMessageAt: Date;
        silentForMs: number;
        shipCount: number;
    };
    onModuleDestroy(): void;
}
