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
        city: string | null;
        updatedAt: Date;
    }[]>;
    getGoogleAPI(city: string): Promise<any>;
    private OpenskyCache;
    setOpenskyCache(newData: any): void;
    getOpenskyCache(): any;
    private accessToken;
    private tokenExpiry;
    private getAccessToken;
    getOpenskyAPI(): Promise<any>;
    private SncfCache;
    setSncfCache(newData: any): void;
    getSncfCache(): any;
    getSncfAPI(): Promise<any[]>;
    private gareCache;
    setGareCache(newCache: any): void;
    getGareCache(): any;
    getGareAPI(): Promise<any>;
    private railCache;
    setRailCache(newCache: any): void;
    getRailCache(): any;
    getRailAPI(): Promise<any>;
    private MeteofranceCache;
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
