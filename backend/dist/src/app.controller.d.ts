import { ApiService } from './app.service';
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
    getTrains(): Promise<any>;
    getWeather(): Promise<any>;
}
