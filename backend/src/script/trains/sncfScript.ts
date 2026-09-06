import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { ApiService } from "../../ApiService";

@Injectable()
export class CallSncfAPI implements OnModuleInit, OnModuleDestroy
{
    constructor(private readonly ApiService: ApiService) {};
    private timeoutHandle: NodeJS.Timeout | null = null;

    async onModuleInit()
    {
        if (process.env.RUN_TRAINS_API !== 'true')
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
        }, 1800000); // 1800000 = 30 min // 86220000 = 23,95 heures
    }

    onModuleDestroy()
    {
        if (this.timeoutHandle) clearTimeout(this.timeoutHandle);
    }
}
// import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from "@nestjs/common";
// import { ConfigService } from "@nestjs/config";

// @Injectable()
// export class CallSncfAPI implements OnModuleInit, OnModuleDestroy
// {
//     private readonly logger = new Logger(CallSncfAPI.name);
//     private stopped = false;

//     constructor(private readonly configService: ConfigService) {};

//     async onModuleInit()
//     {
//         if (process.env.RUN_TRAINS_API !== 'true')
//             return;

//         // ⚠️ MODE TEST : consomme volontairement le quota pour trouver le vrai plafond.
//         // Remettre le comportement normal (cron 30min) une fois le test terminé.
//         await this.testSncfQuota();
//     }

//     private async testSncfQuota()
//     {
//         const apiKey = this.configService.get<string>('SNCF_API');
//         if (!apiKey) {
//             this.logger.error("La clé SNCF_API est introuvable.");
//             return;
//         }

//         const authHeader = 'Basic ' + Buffer.from(apiKey.trim() + ':').toString('base64');
//         const url = 'https://api.sncf.com/v1/coverage/sncf/stop_areas/stop_area:SNCF:87391003/departures?count=1';

//         let count = 0;
//         const startTime = Date.now();

//         this.logger.log("=== Début du test de quota SNCF ===");

//         while (!this.stopped)
//         {
//             count++;

//             try
//             {
//                 const res = await fetch(url, { headers: { Authorization: authHeader } });

//                 if (!res.ok)
//                 {
//                     const body = await res.text().catch(() => '');
//                     const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
//                     this.logger.error(`❌ Échec après ${count} requêtes (statut ${res.status}) — ${body}`);
//                     this.logger.error(`Temps écoulé : ${elapsed}s`);
//                     break;
//                 }

//                 if (count % 50 === 0)
//                 {
//                     const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
//                     this.logger.log(`✅ ${count} requêtes envoyées avec succès (${elapsed}s écoulées)`);
//                 }
//             }
//             catch (e)
//             {
//                 this.logger.error(`Erreur réseau à la requête ${count} : `, e);
//                 break;
//             }

//             await new Promise((r) => setTimeout(r, 300)); // 300ms entre chaque requête
//         }

//         this.logger.log(`=== Test terminé après ${count} requêtes ===`);
//     }

//     onModuleDestroy()
//     {
//         this.stopped = true; // permet d'interrompre proprement la boucle si le module s'arrête pendant le test
//     }
// }