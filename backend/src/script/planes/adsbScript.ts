import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { ApiService } from "../../ApiService";

@Injectable()
export class CallAdsbAPI implements OnModuleInit, OnModuleDestroy
{
    private readonly POLL_INTERVAL_MS = 5_000;

    private timeoutHandle: NodeJS.Timeout | null = null;

    constructor(private readonly ApiService: ApiService) {}

    async onModuleInit()
    {
        if (process.env.RUN_PLANES_API !== 'true')
            return;
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
            const data = await this.ApiService.getAdsbAPI();
            this.ApiService.setAdsbCache(data);
        }
        catch (e)
        {
            console.error("Error lors du chargement du cache ADSB, : ", e);
        }
    }

    onModuleDestroy()
    {
        if (this.timeoutHandle) clearTimeout(this.timeoutHandle);
    }
}