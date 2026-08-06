import { ApiService } from './ApiService';
export declare class AppController {
    private readonly appService;
    constructor(appService: ApiService);
    getWebcams(): Promise<{
        id: string;
        youtubeVideoId: string;
        title: string;
        thumbnail: string | null;
        city: string | null;
        updatedAt: Date;
    }[]>;
    getPlanes(): Promise<any>;
    getPlanesPicture(icao24: string): Promise<{
        id: string;
        link: string | null;
        photographer: string | null;
        thumbnailSrc: string | null;
        thumbnailWidth: number | null;
        thumbnailHeight: number | null;
        createdAt: Date;
    } | null>;
    getTrains(): Promise<any>;
    getGare(): Promise<any>;
    getWeather(): Promise<any>;
}
