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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const ApiService_1 = require("./ApiService");
let AppController = class AppController {
    appService;
    constructor(appService) {
        this.appService = appService;
    }
    async getWebcams() {
        return await this.appService.getGoogleAPIFromDatabase();
    }
    async getPlanes() {
        return await this.appService.getOpenskyCache();
    }
    async getPlanesPicture(icao24) {
        return await this.appService.getPlaneSpotterApi(icao24);
    }
    async getTrains() {
        return await this.appService.getSncfCache();
    }
    async getGare() {
        return this.appService.getGareCache();
    }
    async getRail() {
        return this.appService.getRailCache();
    }
    async getWeather() {
        return await this.appService.getMeteofranceCache();
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)('webcams'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getWebcams", null);
__decorate([
    (0, common_1.Get)('planes'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getPlanes", null);
__decorate([
    (0, common_1.Get)('planes/:icao24/picture'),
    __param(0, (0, common_1.Param)('icao24')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getPlanesPicture", null);
__decorate([
    (0, common_1.Get)('trains'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getTrains", null);
__decorate([
    (0, common_1.Get)('trains/gare'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getGare", null);
__decorate([
    (0, common_1.Get)('trains/rail'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getRail", null);
__decorate([
    (0, common_1.Get)('weather'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getWeather", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [ApiService_1.ApiService])
], AppController);
//# sourceMappingURL=app.controller.js.map