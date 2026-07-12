import { Injectable, OnModuleInit } from "@nestjs/common";
import { ApiService } from "../app.service";

@Injectable()
export class CallMeteofranceAPI implements OnModuleInit {

    constructor(private readonly ApiService: ApiService) {};

    async onModuleInit() {
        try
        {
            const firstCache = await this.ApiService.getMeteofranceAPI();
            this.ApiService.setMeteofranceCache(firstCache);
        }
        catch (e)
        {
            console.error("Error lors du chargement du premier cache Meteo-France, : ", e);
        }
        const interval: NodeJS.Timeout = setInterval(async () => {
            const data = this.ApiService.getMeteofranceAPI();
            this.ApiService.setMeteofranceCache(data);
        }, 1800000);
    }
}