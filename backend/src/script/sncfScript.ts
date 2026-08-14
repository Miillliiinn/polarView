import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { ApiService } from "../ApiService";

@Injectable()
export class CallSncfAPI implements OnModuleInit, OnModuleDestroy
{
    constructor(private readonly ApiService: ApiService) {};
    private timeoutHandle: NodeJS.Timeout | null = null;

    async onModuleInit()
    {
        if (process.env.RUN_TRAINS_API === 'false')
            return;
        try
        {
            const firstCache = await this.ApiService.getSncfAPI();
            this.ApiService.setSncfCache(firstCache);
        }
        catch (e)
        {
             console.error("Error lors du chargement du premier cache SNCF, : ", e);
        }
        this.timeoutHandle = setInterval( async () => {
            const data = await this.ApiService.getSncfAPI();
            this.ApiService.setSncfCache(data);
            console.log("scnf request");
        }, 1800000); // 1800000 = 30 min
    }

    onModuleDestroy()
    {
        if (this.timeoutHandle) clearTimeout(this.timeoutHandle);
    }
}