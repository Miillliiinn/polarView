import { Injectable, OnModuleInit } from "@nestjs/common";
import { ApiService } from "../ApiService";

@Injectable()
export class CallSncfAPI implements OnModuleInit {

    constructor(private readonly ApiService: ApiService) {};

    async onModuleInit() {
        try
        {
            const firstCache = await this.ApiService.getSncfAPI();
            this.ApiService.setSncfCache(firstCache);
        }
        catch (e)
        {
             console.error("Error lors du chargement du premier cache SNCF, : ", e);
        }
        const interval: NodeJS.Timeout = setInterval( async () => {
            const data = await this.ApiService.getSncfAPI();
            this.ApiService.setSncfCache(data);
            console.log("scnf request");
        }, 1800000); // 1800000 = 30 min
    }
}