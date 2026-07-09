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
exports.AppService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let AppService = class AppService {
    configService;
    constructor(configService) {
        this.configService = configService;
    }
    async getGoogleAPI() {
        try {
            const apiKey = this.configService.get('GOOGLE_API');
            const apiResult = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&eventType=live&q=live+webcam+france&maxResults=10&key=${apiKey}`);
            const resJson = await apiResult.json();
            const videoLive = resJson.items || [];
            return videoLive.map((item) => ({
                id: item.id.videoId,
                title: item.snippet.title,
                thumbnail: item.snippet.thumbnails.medium.url,
                channel: item.snippet.channelTitle,
            }));
        }
        catch (e) {
            console.error("Error 'async getGoogleAPI()' : ", e);
            return { error: "Impossible de joindre l'API de google" };
        }
    }
    async getOpenskyAPI() {
        try {
            const apiResult = await fetch(`https://opensky-network.org/api/states/all?lamin=41.5&lamax=51.5&lomin=-5.5&lomax=10.0`);
            const data = await apiResult.json();
            const state = data.states || [];
            return state
                .filter((f) => f[5] !== null && f[6] !== null)
                .map((f) => ({
                icao24: f[0],
                callsign: f[1]?.trim(),
                country: f[2],
                longitude: f[5],
                latitude: f[6],
                altitude: f[7] || f[13] || 0,
                heading: f[10] || 0,
                velocity: f[9] || 0,
            }));
        }
        catch (e) {
            console.error("Error 'async getOpenskyAPI()' : ", e);
            return { error: "Impossible de joindre l'API de Opensky Network" };
        }
    }
    async getSncfAPI() {
        try {
            const apiKey = this.configService.get('SNCF_API');
            const authHeader = 'Basic ' + Buffer.from(apiKey + ':').toString('base64');
            const apiResult = await fetch(`https://api.sncf.com/v1/coverage/sncf/vehicle_positions`, {
                method: 'GET',
                headers: {
                    'Authorization': authHeader,
                },
            });
            const data = await apiResult.json();
            return data.vehicle_positions.flatMap((vp) => {
                const typeTransport = vp.line?.physical_modes?.[0]?.name || 'Inconnu';
                const operateur = vp.line?.commercial_mode?.name || 'Inconnu';
                return (vp.vehicle_journey_positions || []).map((vjp) => ({
                    id: vjp.vehicle_journey?.id,
                    trainNumber: vjp.vehicle_journey?.name || vjp.vehicle_journey?.headsign,
                    type: typeTransport,
                    operator: operateur,
                    latitude: vjp.coord?.lat || null,
                    longitude: vjp.coord?.lon || null,
                }));
            });
        }
        catch (e) {
            console.error("Error 'async getOpenskyAPI()' : ", e);
            return { error: "Impossible de joindre l'API de la SNCF" };
        }
    }
};
exports.AppService = AppService;
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AppService);
//# sourceMappingURL=app.service.js.map