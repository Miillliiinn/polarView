import { OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { ApiService } from "../../ApiService";
export declare class CallCelestrackAPI implements OnModuleInit, OnModuleDestroy {
    private readonly apiservice;
    private readonly POLL_INTERVAL_MS;
    private timeoutHandle;
    constructor(apiservice: ApiService);
    onModuleInit(): Promise<void>;
    private scheduleNextRefresh;
    private refreshCache;
    onModuleDestroy(): void;
}
