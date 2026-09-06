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
exports.CallOpenskyAPI = void 0;
const common_1 = require("@nestjs/common");
const ApiService_1 = require("../../ApiService");
let CallOpenskyAPI = class CallOpenskyAPI {
    ApiService;
    POLL_INTERVAL_MS = 70_000;
    timeoutHandle = null;
    constructor(ApiService) {
        this.ApiService = ApiService;
    }
    async onModuleInit() {
        if (process.env.RUN_PLANES_API !== 'true')
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
            const data = await this.ApiService.getOpenskyAPI();
            this.ApiService.setOpenskyCache(data);
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
exports.CallOpenskyAPI = CallOpenskyAPI;
exports.CallOpenskyAPI = CallOpenskyAPI = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ApiService_1.ApiService])
], CallOpenskyAPI);
//# sourceMappingURL=openskyScript.js.map