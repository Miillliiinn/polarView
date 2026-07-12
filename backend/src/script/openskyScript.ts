import { Injectable, OnModuleInit } from "@nestjs/common";
import { ApiService } from "../app.service";

@Injectable()
export class CallOpenskyAPI implements OnModuleInit {

    constructor(private readonly ApiService: ApiService) {};

    async onModuleInit() {
        try
        {
            const firstCache = await this.ApiService.getOpenskyAPI();
            this.ApiService.setOpenskyCache(firstCache);
        }
        catch (e)
        {
             console.error("Error lors du chargement du premier cache Opensky, : ", e);
        }
        const interval: NodeJS.Timeout = setInterval( async () => {
            const data = await this.ApiService.getOpenskyAPI()
            this.ApiService.setOpenskyCache(data);
        }, 87000);
    }
}

