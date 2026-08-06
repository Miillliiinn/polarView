import { Injectable, OnModuleInit } from "@nestjs/common";
import { ApiService } from "../ApiService";

@Injectable()
export class CallGareAPI implements OnModuleInit
{
    constructor(private readonly ApiService: ApiService) {};
    async onModuleInit()
    {
        try{
            const data = await this.ApiService.getGareAPI()
            this.ApiService.setGareCache(data);
            console.log(data.features[0].properties);
            console.log ('🚉 SNCF (gare) Api request 🚉');
        }
        catch (e)
        {
            console.error("Error lors du chargement du premier cache SNCF (gare), : ", e);
        }
    }
};