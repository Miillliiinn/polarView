import { OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { ApiService } from "../ApiService";
export declare class CallMeteofranceAPI implements OnModuleInit, OnModuleDestroy {
    private readonly ApiService;
    private readonly POLL_INTERVAL_MS;
    private timeoutHandle;
    constructor(ApiService: ApiService);
    onModuleInit(): Promise<void>;
    private scheduleNextRefresh;
    private refreshCache;
    onModuleDestroy(): void;
}
