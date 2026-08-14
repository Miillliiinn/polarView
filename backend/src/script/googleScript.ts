import { Injectable, OnModuleInit } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { ApiService } from "src/ApiService";
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
        'Rennes', 'Vannes',
    ];

    constructor(
        private apiService: ApiService,
        private prisma: PrismaService) {}

    private testCityIndex = 0;

    async onModuleInit() {
        if (process.env.RUN_WEBCAM_API === 'true')
        {
            const maxExecutions = 37;
            let executionCount = 0;

            const intervalId = setInterval(async () => {
                if (executionCount >= maxExecutions) {
                    console.log("🛑 Limite de 37 tests atteinte. Arret de l'intervalle.");
                    clearInterval(intervalId);
                    return;
                }
                const city = this.cities[this.testCityIndex];
                this.testCityIndex = (this.testCityIndex + 1) % this.cities.length;
                console.log(`⏱️ ${new Date().toLocaleTimeString()} — [${executionCount + 1}/${maxExecutions}] ville : ${city}`);
                executionCount++;
                await this.updateDatabaseCache([city]);
            }, 10000);
        }
    }

    @Cron('0 0 10 * * *', { timeZone: 'Europe/Paris' })
    async scheduledUpdate()
    {
        await this.rebuildDatabaseCache();
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

            const now = new Date();

            await this.prisma.$transaction(
                allWebcams.map((webcam) =>
                    this.prisma.webcam.upsert({
                        where: { youtubeVideoId: webcam.youtubeVideoId },
                        update: {
                            title: webcam.title,
                            thumbnail: webcam.thumbnail,
                            updatedAt: now,
                        },
                        create: {
                            youtubeVideoId: webcam.youtubeVideoId,
                            title: webcam.title,
                            thumbnail: webcam.thumbnail,
                            city: webcam.city,
                            updatedAt: now,
                        },
                    })
                )
            );

            const deleted = await this.prisma.webcam.deleteMany({
                where: {
                    city: { in: citiesToFetch },
                    updatedAt: { lt: now },
                },
            });

            console.log(`✅ Cache synchronisé (${allWebcams.length} webcams actives).`);
            if (deleted.count > 0) {
                console.log(`🧹 Nettoyage : ${deleted.count} webcam(s) hors-ligne supprimée(s) de Neon.`);
            }
        }
        catch (e)
        {
            console.error("Erreur lors de la mise à jour du cache DB Google : ", e);
        }
    }

    async rebuildDatabaseCache(citiesToFetch: string[] = this.cities)
    {
        try
        {
            const resultsByCity = await Promise.all(
                citiesToFetch.map((city) => this.apiService.getGoogleAPI(city))
            );

            const allWebcams = resultsByCity.flat();

            if (allWebcams.length === 0) {
                console.warn("⚠️ Aucune donnée reçue de l'API, la table n'a PAS été vidée pour éviter de tout perdre.");
                return;
            }

            const now = new Date();

            await this.prisma.$transaction([
                this.prisma.webcam.deleteMany({}),
                this.prisma.webcam.createMany({
                    data: allWebcams.map((webcam) => ({
                        youtubeVideoId: webcam.youtubeVideoId,
                        title: webcam.title,
                        thumbnail: webcam.thumbnail,
                        city: webcam.city,
                        updatedAt: now,
                    })),
                    skipDuplicates: true,
                }),
            ]);

            console.log(`✅ Cache reconstruit de zéro (${allWebcams.length} webcams actives).`);
        }
        catch (e)
        {
            console.error("Erreur lors de la reconstruction du cache DB Google : ", e);
        }
    }
}