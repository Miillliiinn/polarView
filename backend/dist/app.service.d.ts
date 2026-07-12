import { ConfigService } from '@nestjs/config';
export declare class ApiService {
    private configService;
    constructor(configService: ConfigService);
    getGoogleAPI(): Promise<any>;
    private OpenskyCache;
    setOpenskyCache(newData: any): void;
    getOpenskyCache(): any;
    getOpenskyAPI(): Promise<any>;
    private SncfCache;
    setSncfCache(newData: any): void;
    getSncfCache(): any;
    getSncfAPI(): Promise<any[]>;
    private MeteofranceCache;
    setMeteofranceCache(newdata: any): void;
    getMeteofranceCache(): any;
    getMeteofranceAPI(): Promise<any>;
}
