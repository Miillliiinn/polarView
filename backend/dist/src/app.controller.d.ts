import { ApiService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: ApiService);
    getWebcams(): Promise<{
        id: string;
        youtubeVideoId: string;
        title: string;
        thumbnail: string | null;
        channel: string | null;
        city: string | null;
        isLive: boolean;
        createdAt: Date;
        lastCheckedAt: Date;
    }[]>;
    getPlanes(): Promise<any>;
    getTrains(): Promise<any>;
    getWeather(): Promise<any>;
}
