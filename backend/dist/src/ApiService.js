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
const youtubeWebcam_1 = require("./api/webcam/youtubeWebcam");
const opensky_1 = require("./api/planes/opensky");
const adsb_1 = require("./api/planes/adsb");
const mergeAdsbOpensky_1 = require("./api/planes/mergeAdsbOpensky");
const sncf_1 = require("./api/trains/sncf");
const meteofranceVigilance_1 = require("./api/weather/meteofranceVigilance");
const planeSpotter_1 = require("./api/planes/planeSpotter");
const aircraft_service_1 = require("./data/aircraft_service");
const wikimediaCommonsAPI_1 = require("./api/boats/wikimediaCommonsAPI");
const findOrFetchAndCache_1 = require("./data/boats/findOrFetchAndCache");
let ApiService = class ApiService {
    configService;
    prisma;
    aircraftservice;
    openskyTokenManager;
    OpenskyCache = [];
    AdsbCache = [];
    SncfCache = [];
    gareCache;
    railCache;
    MeteofranceCache = [];
    constructor(configService, prisma, aircraftservice) {
        this.configService = configService;
        this.prisma = prisma;
        this.aircraftservice = aircraftservice;
        this.openskyTokenManager = new opensky_1.OpenskyTokenManager(this.configService.getOrThrow('OPENSKY_CLIENTID'), this.configService.getOrThrow('OPENSKY_CLIENTSECRET'));
    }
    async getGoogleAPIFromDatabase() {
        const count = await this.prisma.webcam.count();
        console.log(count);
        try {
            return await this.prisma.webcam.findMany();
        }
        catch (e) {
            console.error("Error, 'async getGoogleAPIFromDatabase' : ", e);
            return [];
        }
    }
    async getGoogleAPI(city) {
        const apiKey = this.configService.get('GOOGLE_API');
        return (0, youtubeWebcam_1.fetchYoutubeWebcams)(apiKey, city);
    }
    setOpenskyCache(newData) { this.OpenskyCache = newData; }
    getOpenskyCache() { return this.OpenskyCache; }
    async getOpenskyAPI() {
        return (0, opensky_1.fetchOpenskyStates)(this.openskyTokenManager);
    }
    setAdsbCache(newData) { this.AdsbCache = newData; }
    getAdsbCache() { return this.AdsbCache; }
    async getAdsbAPI() {
        return (0, adsb_1.fetchAdsbStates)(adsb_1.DEFAULT_FRANCE_ZONES);
    }
    getCombinedAircraftCache() {
        return (0, mergeAdsbOpensky_1.mergeAdsbAndOpensky)(this.AdsbCache, this.OpenskyCache, this.aircraftservice);
    }
    setSncfCache(newData) { this.SncfCache = newData; }
    getSncfCache() { return this.SncfCache; }
    async getSncfAPI() {
        const apiKey = this.configService.get('SNCF_API');
        return (0, sncf_1.fetchSncfDepartures)(apiKey);
    }
    setGareCache(newCache) { this.gareCache = newCache; }
    getGareCache() { return this.gareCache; }
    async getGareAPI() {
        return (0, sncf_1.fetchSncfGares)();
    }
    setRailCache(newCache) { this.railCache = newCache; }
    getRailCache() { return this.railCache; }
    async getRailAPI() {
        return (0, sncf_1.fetchSncfRailLines)();
    }
    setMeteofranceCache(newdata) { this.MeteofranceCache = newdata; }
    getMeteofranceCache() { return this.MeteofranceCache; }
    async getMeteofranceAPI() {
        const apiKey = this.configService.get('METEOFRANCE_API');
        return (0, meteofranceVigilance_1.fetchMeteofranceVigilance)(apiKey);
    }
    async getPlaneSpotterApi(icao24) {
        return (0, findOrFetchAndCache_1.findOrFetchAndCache)(this.prisma.planes, icao24, planeSpotter_1.fetchPlaneSpotterPhoto, (photo) => ({
            link: photo.link ?? null,
            photographer: photo.photographer ?? null,
            thumbnailSrc: photo.thumbnail_large?.src ?? photo.thumbnail?.src ?? null,
            thumbnailWidth: photo.thumbnail_large?.size?.width ?? photo.thumbnail?.size?.width ?? null,
            thumbnailHeight: photo.thumbnail_large?.size?.height ?? photo.thumbnail?.size?.height ?? null,
        }), (record) => !!record.thumbnailSrc);
    }
    async getWikimediaCommonsAPI(imo) {
        return (0, findOrFetchAndCache_1.findOrFetchAndCache)(this.prisma.ships, imo, wikimediaCommonsAPI_1.fetchWikimediaCommonsAPI, (photo) => ({
            url: photo.url ?? null,
            thumbUrl: photo.thumbUrl ?? null,
            title: photo.title ?? null,
            sourceUrl: photo.sourceUrl ?? null,
            width: photo.width ?? null,
            height: photo.height ?? null,
        }), (record) => !!record.url);
    }
};
exports.ApiService = ApiService;
exports.ApiService = ApiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService, prisma_service_1.PrismaService, aircraft_service_1.AircraftService])
], ApiService);
//# sourceMappingURL=ApiService.js.map