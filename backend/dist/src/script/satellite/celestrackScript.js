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
exports.CallCelestrackAPI = void 0;
const common_1 = require("@nestjs/common");
const ApiService_1 = require("../../ApiService");
let CallCelestrackAPI = class CallCelestrackAPI {
    apiservice;
    POLL_INTERVAL_MS = 8_000_000;
    timeoutHandle = null;
    constructor(apiservice) {
        this.apiservice = apiservice;
    }
    async onModuleInit() {
        if (process.env.RUN_CELESTRACK_API !== 'true')
            return;
        await this.refreshCache();
        this.scheduleNextRefresh();
    }
    scheduleNextRefresh() {
        this.timeoutHandle = setTimeout(async () => {
            await this.refreshCache();
            this.scheduleNextRefresh();
        }, this.POLL_INTERVAL_MS);
    }
    async refreshCache() {
        try {
            const data = await this.apiservice.getCelestrackAPI();
            this.apiservice.setCelestrackCache(data);
        }
        catch (e) {
            console.error("Error lors du chargement du cache Opensky, : ", e);
        }
    }
    onModuleDestroy() {
        if (this.timeoutHandle)
            clearTimeout(this.timeoutHandle);
    }
};
exports.CallCelestrackAPI = CallCelestrackAPI;
exports.CallCelestrackAPI = CallCelestrackAPI = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ApiService_1.ApiService])
], CallCelestrackAPI);
//# sourceMappingURL=celestrackScript.js.map