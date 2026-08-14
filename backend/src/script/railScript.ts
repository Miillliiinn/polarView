import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { ApiService } from "src/ApiService";

@Injectable()
export class CallRailAPI implements OnModuleInit, OnModuleDestroy
{
    private readonly POLL_INTERVAL_MS = 600_000_000; // 7 jours
    private timeoutHandle: NodeJS.Timeout | null = null;

    constructor(private readonly ApiService: ApiService) {}

    async onModuleInit()
    {
        if (process.env.RUN_TRAINS_API === 'false')
            return ;
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
            const apiResult = await this.ApiService.getRailAPI();
            this.ApiService.setRailCache(apiResult);
            console.log('🛤️  SNCF (rail) Api request 🛤️');
        }
        catch
        (e)
        {
            console.error("Error lors du chargement du cache SNCF (rail), : ", e);
        }
    }

    onModuleDestroy()
    {
        if (this.timeoutHandle) clearTimeout(this.timeoutHandle);
    }
}