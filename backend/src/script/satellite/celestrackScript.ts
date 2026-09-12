import { OnModuleInit, OnModuleDestroy, Injectable } from "@nestjs/common";
import { ApiService } from "src/ApiService";

@Injectable()
export class CallCelestrackAPI implements OnModuleInit, OnModuleDestroy
{
    private readonly POLL_INTERVAL_MS = 8_000_000; // 1h 11min

    private timeoutHandle: NodeJS.Timeout | null = null;

    constructor (private readonly apiservice: ApiService){}

    async onModuleInit() {
        if (process.env.RUN_CELESTRACK_API !== 'true')
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
            const data = await this.apiservice.getCelestrackAPI();
            this.apiservice.setCelestrackCache(data);
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