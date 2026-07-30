"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallGoogleAPI = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const ApiService_1 = require("../ApiService");
const prisma_service_1 = require("../../prisma/prisma.service");
let CallGoogleAPI = class CallGoogleAPI {
    apiService;
    prisma;
    cities = [
        'Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Strasbourg', 'Bordeaux', 'Lille',
        'Saint-Malo', 'Le Havre', 'Biarritz', 'La Baule', 'Les Sables-d\'Olonne',
        'Deauville', 'Roscoff', 'Brest', 'La Rochelle', 'Arcachon',
        'Cannes', 'Saint-Tropez', 'Sète',
        'Chamonix', 'Les Arcs', 'Val d\'Isère', 'Courchevel', 'Megève',
        'Mont-Saint-Michel', 'Lourdes', 'Annecy',
        'Versailles', 'Montpellier', 'Lorient', 'Nantes', 'Rouen', 'Ajaccio',
        'Rennes', 'Vannes',
    ];
    constructor(apiService, prisma) {
        this.apiService = apiService;
        this.prisma = prisma;
    }
    testCityIndex = 0;
    async onModuleInit() {
        if (process.env.RUN_TEST_ON_BOOT === 'true') {
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
    async scheduledUpdate() {
        await this.rebuildDatabaseCache();
    }
    async updateDatabaseCache(citiesToFetch = this.cities) {
        try {
            const resultsByCity = await Promise.all(citiesToFetch.map((city) => this.apiService.getGoogleAPI(city)));
            const allWebcams = resultsByCity.flat();
            if (allWebcams.length === 0) {
                console.warn("Aucune donnée reçue de l'API, mise à jour ignorée.");
                return;
            }
            const now = new Date();
            await this.prisma.$transaction(allWebcams.map((webcam) => this.prisma.webcam.upsert({
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
            })));
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
        catch (e) {
            console.error("Erreur lors de la mise à jour du cache DB Google : ", e);
        }
    }
    async rebuildDatabaseCache(citiesToFetch = this.cities) {
        try {
            const resultsByCity = await Promise.all(citiesToFetch.map((city) => this.apiService.getGoogleAPI(city)));
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
        catch (e) {
            console.error("Erreur lors de la reconstruction du cache DB Google : ", e);
        }
    }
};
exports.CallGoogleAPI = CallGoogleAPI;
__decorate([
    (0, schedule_1.Cron)('0 0 10 * * *', { timeZone: 'Europe/Paris' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CallGoogleAPI.prototype, "scheduledUpdate", null);
exports.CallGoogleAPI = CallGoogleAPI = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ApiService_1.ApiService,
        prisma_service_1.PrismaService])
], CallGoogleAPI);
//# sourceMappingURL=googleScript.js.map