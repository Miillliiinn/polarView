import { OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { ApiService } from "../ApiService";
export declare class CallSncfAPI implements OnModuleInit, OnModuleDestroy {
    private readonly ApiService;
    constructor(ApiService: ApiService);
    private timeoutHandle;
    onModuleInit(): Promise<void>;
    onModuleDestroy(): void;
}
