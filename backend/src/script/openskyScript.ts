import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { ApiService } from "../ApiService";

@Injectable()
export class CallOpenskyAPI implements OnModuleInit, OnModuleDestroy
{
    private readonly POLL_INTERVAL_MS = 70_000; // 1 min 10s

    private timeoutHandle: NodeJS.Timeout | null = null;

    constructor(private readonly ApiService: ApiService) {}

    async onModuleInit()
    {
        await this.refreshCache();
        this.scheduleNextRefresh();
    }

    private scheduleNextRefresh()
    {
        this.timeoutHandle = setTimeout(async () => {
        await this.refreshCache();
        this.scheduleNextRefresh();
        }, this.POLL_INTERVAL_MS);
    }

    private async refreshCache()
    {
        try
        {
            const data = await this.ApiService.getOpenskyAPI();
            this.ApiService.setOpenskyCache(data);
        }
        catch (e)
        {
            console.error("Error lors du chargement du cache Opensky, : ", e);
        }
    }

    onModuleDestroy()
    {
        if (this.timeoutHandle) clearTimeout(this.timeoutHandle);
    }
}

