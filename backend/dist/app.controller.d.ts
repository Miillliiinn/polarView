import { ApiService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: ApiService);
    getWebcams(): Promise<any>;
    getPlanes(): Promise<any>;
    getTrains(): Promise<any>;
    getWeather(): Promise<any>;
}
