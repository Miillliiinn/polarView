import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getWebcams(): Promise<any>;
    getPlanes(): Promise<any>;
    getTrains(): Promise<any>;
}
