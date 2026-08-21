import { ConfigService } from '@nestjs/config';
import { PrismaService } from "../prisma/prisma.service";
export declare class ApiService {
    private configService;
    private prisma;
    private openskyTokenManager;
    private OpenskyCache;
    private SncfCache;
    private gareCache;
    private railCache;
    private MeteofranceCache;
    constructor(configService: ConfigService, prisma: PrismaService);
    getGoogleAPIFromDatabase(): Promise<{
        id: string;
        youtubeVideoId: string;
        title: string;
        thumbnail: string | null;
        city: string | null;
        updatedAt: Date;
    }[]>;
    getGoogleAPI(city: string): Promise<{
        youtubeVideoId: any;
        title: any;
        thumbnail: any;
        channel: any;
        city: string;
    }[]>;
    setOpenskyCache(newData: any): void;
    getOpenskyCache(): any;
    getOpenskyAPI(): Promise<any>;
    setSncfCache(newData: any): void;
    getSncfCache(): any;
    getSncfAPI(): Promise<any[]>;
    setGareCache(newCache: any): void;
    getGareCache(): any;
    getGareAPI(): Promise<any>;
    setRailCache(newCache: any): void;
    getRailCache(): any;
    getRailAPI(): Promise<any>;
    setMeteofranceCache(newdata: any): void;
    getMeteofranceCache(): any;
    getMeteofranceAPI(): Promise<any>;
    getPlaneSpotterApi(icao24: string): Promise<{
        id: string;
        link: string | null;
        photographer: string | null;
        thumbnailSrc: string | null;
        thumbnailWidth: number | null;
        thumbnailHeight: number | null;
        createdAt: Date;
    } | null>;
}
