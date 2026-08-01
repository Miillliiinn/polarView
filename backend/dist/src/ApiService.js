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
exports.ApiService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
let ApiService = class ApiService {
    configService;
    prisma;
    constructor(configService, prisma) {
        this.configService = configService;
        this.prisma = prisma;
    }
    async getGoogleAPIFromDatabase() {
        const count = await this.prisma.webcam.count();
        console.log(count);
        try {
            const webcams = await this.prisma.webcam.findMany();
            return webcams;
        }
        catch (e) {
            console.error("Error, 'async getGoogleAPIFromDatabase' : ", e);
            return [];
        }
    }
    async getGoogleAPI(city) {
        try {
            const apiKey = this.configService.get('GOOGLE_API');
            const query = encodeURIComponent(`webcam ${city}`);
            const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&eventType=live&q=${query}&relevanceLanguage=fr&regionCode=FR&maxResults=50&key=${apiKey}`;
            const apiResult = await fetch(url);
            const resJson = await apiResult.json();
            if (resJson.error) {
                console.error(`❌ Erreur API YouTube pour "${city}" :`, resJson.error.message);
                return [];
            }
            const videoLive = resJson.items || [];
            const sanitize = (text) => {
                if (!text)
                    return '';
                return text
                    .replace(/&#39;/g, "'")
                    .replace(/&amp;/g, "&")
                    .replace(/&quot;/g, '"')
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .toLowerCase();
            };
            const cleanCity = sanitize(city);
            const blacklist = [
                'illinois', 'usa', 'los angeles', 'thailand', 'indonesia', 'italia'
            ];
            const strictVideos = videoLive.filter((item) => {
                const title = sanitize(item.snippet.title);
                const description = sanitize(item.snippet.description);
                const channel = sanitize(item.snippet.channelTitle);
                const isBlacklisted = blacklist.some((term) => title.includes(term));
                if (isBlacklisted) {
                    return false;
                }
                const hasCity = title.includes(cleanCity) || description.includes(cleanCity) || channel.includes(cleanCity);
                const isCam = title.includes('webcam') || title.includes('live') || title.includes('cam') || title.includes('direct');
                return hasCity && isCam;
            });
            return strictVideos.map((item) => ({
                youtubeVideoId: item.id.videoId,
                title: item.snippet.title,
                thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
                channel: item.snippet.channelTitle,
                city: city,
            }));
        }
        catch (e) {
            console.error(`Error 'async getGoogleAPI(${city})' : `, e);
            return [];
        }
    }
    OpenskyCache = [];
    setOpenskyCache(newData) { this.OpenskyCache = newData; }
    ;
    getOpenskyCache() { return this.OpenskyCache; }
    ;
    accessToken = null;
    tokenExpiry = 0;
    async getAccessToken() {
        const now = Date.now();
        if (this.accessToken && now < this.tokenExpiry) {
            return this.accessToken;
        }
        const clientId = this.configService.get('OPENSKY_CLIENTID');
        const clientSecret = this.configService.get('OPENSKY_CLIENTSECRET');
        const tokenUrl = 'https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token';
        const res = await fetch(tokenUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'client_credentials',
                client_id: clientId,
                client_secret: clientSecret,
            }),
        });
        if (!res.ok) {
            throw new Error(`Erreur récupération token OAuth2 : ${res.status}`);
        }
        const data = await res.json();
        const newToken = data.access_token;
        this.accessToken = newToken;
        this.tokenExpiry = now + (data.expires_in - 30) * 1000;
        return newToken;
    }
    async getOpenskyAPI() {
        try {
            const token = await this.getAccessToken();
            const url = `https://opensky-network.org/api/states/all?lamin=37.5&lamax=55.5&lomin=-9.0&lomax=13.0`;
            const apiResult = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                }
            });
            if (!apiResult.ok) {
                throw new Error(`Opensky Network repond avec un statut : ${apiResult.status}`);
            }
            const data = await apiResult.json();
            const state = data.states || [];
            console.log("✈️ OpenSky Api request ✈️");
            console.log('Headers:', Object.fromEntries(apiResult.headers.entries()));
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
            return [];
        }
    }
    SncfCache = [];
    setSncfCache(newData) { this.SncfCache = newData; }
    ;
    getSncfCache() { return this.SncfCache; }
    ;
    async getSncfAPI() {
        try {
            const apiKey = this.configService.get('SNCF_API');
            if (!apiKey)
                throw new Error("La clé SNCF_API est introuvable.");
            const authHeader = 'Basic ' + Buffer.from(apiKey.trim() + ':').toString('base64');
            const now = new Date();
            const pad = (num) => String(num).padStart(2, '0');
            const datetimeSncf = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}T${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
            const garesMajeures = [
                { id: 'stop_area:SNCF:87686006', name: 'Paris Gare de Lyon' },
                { id: 'stop_area:SNCF:87384008', name: 'Paris Gare du Nord' },
                { id: 'stop_area:SNCF:87682005', name: 'Paris Gare d\'Austerlitz' },
                { id: 'stop_area:SNCF:87723163', name: 'Lyon Part-Dieu' },
                { id: 'stop_area:SNCF:87751008', name: 'Marseille Saint-Charles' },
                { id: 'stop_area:SNCF:87581009', name: 'Bordeaux Saint-Jean' },
                { id: 'stop_area:SNCF:87286005', name: 'Lille Flandres' },
                { id: 'stop_area:SNCF:87481002', name: 'Nantes' },
                { id: 'stop_area:SNCF:87212027', name: 'Strasbourg Ville' },
                { id: 'stop_area:SNCF:87611004', name: 'Toulouse Matabiau' }
            ];
            const promessesGares = garesMajeures.map(async (gare) => {
                try {
                    const url = `https://api.sncf.com/v1/coverage/sncf/stop_areas/${gare.id}/departures?from_datetime=${datetimeSncf}&count=100`;
                    const res = await fetch(url, { headers: { 'Authorization': authHeader } });
                    if (!res.ok)
                        return [];
                    const data = await res.json();
                    return (data.departures || []).map((dep) => {
                        const display = dep.display_informations;
                        const stopPoint = dep.stop_point;
                        return {
                            id: `${display?.headsign}-${dep.stop_date_time?.departure_date_time}`,
                            trainNumber: display?.headsign,
                            type: display?.commercial_mode,
                            operator: display?.network,
                            departureTime: dep.stop_date_time?.departure_date_time,
                            stationName: stopPoint?.name,
                            latitude: stopPoint?.coord?.lat ? parseFloat(stopPoint.coord.lat) : null,
                            longitude: stopPoint?.coord?.lon ? parseFloat(stopPoint.coord.lon) : null,
                        };
                    });
                }
                catch (err) {
                    console.warn(`Impossible de récupérer les trains pour ${gare.name}`);
                    return [];
                }
            });
            const résultatsParGare = await Promise.all(promessesGares);
            const tousLesTrains = résultatsParGare.flat();
            const trainsUniques = tousLesTrains.filter((train, index, self) => index === self.findIndex((t) => t.id === train.id));
            return trainsUniques;
        }
        catch (e) {
            console.error("Error 'async getSncfAPI()' : ", e);
            return [];
        }
    }
    MeteofranceCache = [];
    setMeteofranceCache(newdata) { this.MeteofranceCache = newdata; }
    ;
    getMeteofranceCache() { return this.MeteofranceCache; }
    ;
    async getMeteofranceAPI() {
        try {
            const apiKey = this.configService.get('METEOFRANCE_API');
            const apiResult = await fetch(`https://public-api.meteofrance.fr/public/DPVigilance/v1/cartevigilance/encours`, {
                method: 'GET',
                headers: {
                    'apikey': apiKey,
                    'Accept': 'application/json',
                },
            });
            if (!apiResult.ok) {
                throw new Error(`Météo-France repond avec un statut : ${apiResult.status}`);
            }
            const data = await apiResult.json();
            const domainIds = data.product?.periods?.[0]?.timelaps?.domain_ids || [];
            if (domainIds.length === 0) {
                console.warn("Météo-France a renvoyé un tableau domain_ids vide. Structure reçue :", JSON.stringify(data));
                return [];
            }
            return domainIds.map((dep) => ({
                department: dep.domain_id,
                maxColorId: dep.max_color_id,
                phenomenons: dep.phenomenon_items?.map((p) => ({
                    id: p.phenomenon_id,
                    colorId: p.phenomenon_max_color_id,
                    schedule: p.timelaps_items?.map((t) => ({
                        begin: t.begin_time,
                        end: t.end_time,
                        color: t.color_id,
                    })) || []
                })) || []
            }));
        }
        catch (e) {
            console.error("Error 'async getMeteofranceAPI' : ", e);
            return [];
        }
    }
    ;
    async getPlaneSpotterApi(icao24) {
        const existInDatabase = await this.prisma.planes.findUnique({
            where: { id: icao24 },
        });
        if (existInDatabase) {
            return existInDatabase;
        }
        try {
            const url = `https://api.planespotters.net/pub/photos/hex/${icao24}`;
            const result = await fetch(url, {
                headers: {
                    'User-Agent': 'polarview/1.0 (+mailto:thomasmilin1@gmail.com)',
                },
            });
            const json = await result.json();
            const photo = json.photos?.[0];
            if (!photo) {
                return null;
            }
            const saved = await this.prisma.planes.create({
                data: {
                    id: icao24,
                    link: photo.link ?? null,
                    photographer: photo.photographer ?? null,
                    thumbnailSrc: photo.thumbnail_large?.src ?? photo.thumbnail?.src ?? null,
                    thumbnailWidth: photo.thumbnail_large?.size?.width ?? photo.thumbnail?.size?.width ?? null,
                    thumbnailHeight: photo.thumbnail_large?.size?.height ?? photo.thumbnail?.size?.height ?? null,
                },
            });
            return saved;
        }
        catch (e) {
            console.error(`Erreur 'getPlaneSpotterApi(${icao24})' : `, e);
            return null;
        }
    }
};
exports.ApiService = ApiService;
exports.ApiService = ApiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService])
], ApiService);
//# sourceMappingURL=ApiService.js.map