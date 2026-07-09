import { ConfigService } from '@nestjs/config';
export declare class AppService {
    private configService;
    constructor(configService: ConfigService);
    getGoogleAPI(): Promise<any>;
    getOpenskyAPI(): Promise<any>;
    getSncfAPI(): Promise<any>;
}
