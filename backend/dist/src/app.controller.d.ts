import { MessageEvent } from '@nestjs/common';
import { ApiService } from './ApiService';
import { AisStreamAPI, ShipPosition } from './script/boats/aisstreamScript';
import { Observable } from 'rxjs';
export declare class AppController {
    private readonly appService;
    constructor(appService: ApiService);
    getWebcams(): Promise<{
        title: string;
        id: string;
        youtubeVideoId: string;
        thumbnail: string | null;
        city: string | null;
        updatedAt: Date;
    }[]>;
    getPlanes(): Promise<any>;
    getPlanesPicture(icao24: string): Promise<any>;
    getAdsb(): any;
    getAllPlanes(): import("./api/planes/mergeAdsbOpensky").CombinedAircraft[];
    getTrains(): Promise<any>;
    getGare(): Promise<any>;
    getRail(): Promise<any>;
    getWeather(): Promise<any>;
    getShipsPicture(imo: string): Promise<any>;
}
export declare class AisStreamController {
    private readonly aisService;
    constructor(aisService: AisStreamAPI);
    getShips(): ShipPosition[];
    streamShips(): Observable<MessageEvent>;
}
