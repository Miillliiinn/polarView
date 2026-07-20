import { Injectable, OnModuleInit } from "@nestjs/common";
import { ApiService } from "../app.service";

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
        }, 150000); // 300 000 = 5 min
    }
}