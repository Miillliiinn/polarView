"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const ApiService_1 = require("./ApiService");
const aisstreamScript_1 = require("./script/aisstreamScript");
const config_1 = require("@nestjs/config");
const openskyScript_1 = require("./script/openskyScript");
const sncfScript_1 = require("./script/sncfScript");
const meteofranceScript_1 = require("./script/meteofranceScript");
const prisma_service_1 = require("../prisma/prisma.service");
const googleScript_1 = require("./script/googleScript");
const schedule_1 = require("@nestjs/schedule");
const gareScript_1 = require("./script/gareScript");
const railScript_1 = require("./script/railScript");
const adsbScript_1 = require("./script/adsbScript");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            schedule_1.ScheduleModule.forRoot(),
        ],
        controllers: [app_controller_1.AppController, app_controller_1.AisStreamController,],
        providers: [
            ApiService_1.ApiService,
            openskyScript_1.CallOpenskyAPI,
            adsbScript_1.CallAdsbAPI,
            meteofranceScript_1.CallMeteofranceAPI,
            sncfScript_1.CallSncfAPI,
            gareScript_1.CallGareAPI,
            railScript_1.CallRailAPI,
            googleScript_1.CallGoogleAPI,
            prisma_service_1.PrismaService,
            aisstreamScript_1.AisStreamAPI,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map