import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { ApiService } from "../../ApiService";

@Injectable()
export class CallMeteofranceAPI implements OnModuleInit, OnModuleDestroy
{
  private readonly POLL_INTERVAL_MS = 1_800_000; // 30 min
  private timeoutHandle: NodeJS.Timeout | null = null;

  constructor(private readonly ApiService: ApiService) {}

  async onModuleInit()
  {
        if (process.env.RUN_VIGILANCE_API !== 'true')
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
            const data = await this.ApiService.getMeteofranceAPI();
            this.ApiService.setMeteofranceCache(data);
        }
        catch (e)
        {
            console.error("Error lors du chargement du cache Meteo-France, : ", e);
        }
    }

    onModuleDestroy()
    {
        if (this.timeoutHandle) clearTimeout(this.timeoutHandle);
    }
}
