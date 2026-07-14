import { ConfigService } from '@nestjs/config';
import { PrismaService } from "../prisma/prisma.service";
export declare class ApiService {
    private configService;
    private prisma;
    constructor(configService: ConfigService, prisma: PrismaService);
    getGoogleAPIFromDatabase(): Promise<{
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
    getGoogleAPI(city: string): Promise<any>;
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
