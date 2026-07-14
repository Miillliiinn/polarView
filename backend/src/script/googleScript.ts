import { Injectable, OnModuleInit } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { ApiService } from "src/app.service";
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class CallGoogleAPI implements OnModuleInit
{
    private readonly cities = [
        'Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Strasbourg', 'Bordeaux', 'Lille',
        'Saint-Malo', 'Le Havre', 'Biarritz', 'La Baule', 'Les Sables-d\'Olonne',
        'Deauville', 'Roscoff', 'Brest', 'La Rochelle', 'Arcachon',
        'Cannes', 'Saint-Tropez', 'Sète',
        'Chamonix', 'Les Arcs', 'Val d\'Isère', 'Courchevel', 'Megève',
        'Mont-Saint-Michel', 'Lourdes', 'Annecy',
        'Versailles', 'Montpellier', 'Lorient', 'Nantes', 'Rouen', 'Ajaccio',
    ];

    constructor(
        private apiService: ApiService,
        private prisma: PrismaService) {}

    private testCityIndex = 0;
    //
    //

    async onModuleInit() {
        if (process.env.RUN_TEST_ON_BOOT === 'true')
        {
            setInterval(async () => {
                const city = this.cities[this.testCityIndex];
                this.testCityIndex = (this.testCityIndex + 1) % this.cities.length;

                console.log(`⏱️ ${new Date().toLocaleTimeString()} — ville : ${city}`);
                await this.updateDatabaseCache([city]);
            }, 10000);
        }
    }

    @Cron('0 0 10 * * *', { timeZone: 'Europe/Paris' })
    async scheduledUpdate()
    {
        await this.updateDatabaseCache(this.cities);
     }

    async updateDatabaseCache(citiesToFetch: string[] = this.cities)
    {
        try
        {
            const resultsByCity = await Promise.all(
            citiesToFetch.map((city) => this.apiService.getGoogleAPI(city))
        );

        const allWebcams = resultsByCity.flat();

        if (allWebcams.length === 0) {
            console.warn("Aucune donnée reçue de l'API, mise à jour ignorée.");
            return;
        }

        const result = await this.prisma.webcam.createMany({
            data: allWebcams,
            skipDuplicates: true,
        });

        console.log(`✅ ${result.count} nouvelle(s) webcam(s) ajoutée(s) sur ${allWebcams.length} récupérée(s) (${citiesToFetch.length} villes).`);
        }
        catch (e)
        {
        console.error("Erreur lors de la mise à jour du cache DB Google : ", e);
        }
    }
}