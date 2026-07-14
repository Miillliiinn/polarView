import { OnModuleInit } from "@nestjs/common";
import { ApiService } from "../app.service";
import { PrismaService } from "../../prisma/prisma.service";
export declare class CallGoogleAPI implements OnModuleInit {
    private apiService;
    private prisma;
    private readonly cities;
    constructor(apiService: ApiService, prisma: PrismaService);
    private testCityIndex;
    onModuleInit(): Promise<void>;
    scheduledUpdate(): Promise<void>;
    updateDatabaseCache(citiesToFetch?: string[]): Promise<void>;
}
