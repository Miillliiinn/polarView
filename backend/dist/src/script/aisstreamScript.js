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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var AisStreamAPI_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AisStreamAPI = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ws_1 = __importDefault(require("ws"));
const RECONNECT_DELAY_MS = 5000;
const STALE_SHIP_MAX_AGE_MS = 30 * 60 * 1000;
const STALE_CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let AisStreamAPI = AisStreamAPI_1 = class AisStreamAPI {
    configService;
    logger = new common_1.Logger(AisStreamAPI_1.name);
    ws = null;
    ships = new Map();
    reconnectTimeout = null;
    cleanupInterval = null;
    destroyed = false;
    constructor(configService) {
        this.configService = configService;
    }
    onModuleInit() {
        if (process.env.RUN_BOATS_API === 'false')
            return;
        this.connect();
        this.cleanupInterval = setInterval(() => this.pruneStaleShips(), STALE_CLEANUP_INTERVAL_MS);
    }
    connect() {
        if (this.destroyed)
            return;
        const apiKey = this.configService.get('AISSTREAM_API_KEY');
        if (!apiKey) {
            this.logger.error('AISSTREAM_API_KEY manquante, connexion annulée.');
            return;
        }
        this.ws = new ws_1.default('wss://stream.aisstream.io/v0/stream');
        this.ws.on('open', () => {
            this.logger.log('AisStream connexion success');
            const subscription = {
                APIKey: apiKey,
                BoundingBoxes: [[[37.5, -9.0], [55.5, 13.0]]],
                FilterMessageTypes: ['PositionReport'],
            };
            this.ws?.send(JSON.stringify(subscription));
        });
        this.ws.on('message', (rawData) => {
            let data;
            try {
                data = JSON.parse(rawData.toString());
            }
            catch (e) {
                this.logger.warn(`Message AISStream illisible : ${e.message}`);
                return;
            }
            if (data?.error) {
                this.logger.error(`AISStream a renvoyé une erreur : ${JSON.stringify(data)}`);
                return;
            }
            this.updateShipData(data);
        });
        this.ws.on('error', (error) => {
            this.logger.warn(`Erreur WebSocket AISStream : ${error.message}`);
        });
        this.ws.on('close', (code, reason) => {
            this.logger.warn(`Connexion AISStream fermée (code ${code}${reason?.length ? `, raison : ${reason.toString()}` : ''}). Tentative de reconnexion...`);
            this.ws = null;
            this.scheduleReconnect();
        });
    }
    scheduleReconnect() {
        if (this.destroyed || this.reconnectTimeout)
            return;
        this.reconnectTimeout = setTimeout(() => {
            this.reconnectTimeout = null;
            this.connect();
        }, RECONNECT_DELAY_MS);
    }
    updateShipData(data) {
        const mmsi = data.MetaData?.MMSI;
        if (!mmsi)
            return;
        const pos = data.Message?.PositionReport;
        const latitude = pos?.Latitude ?? data.MetaData?.latitude;
        const longitude = pos?.Longitude ?? data.MetaData?.longitude;
        if (latitude === undefined || longitude === undefined)
            return;
        this.ships.set(mmsi, {
            mmsi,
            name: data.MetaData?.ShipName?.trim() || 'Inconnu',
            latitude,
            longitude,
            speed: pos?.Sog ?? 0,
            heading: pos?.TrueHeading ?? 0,
            lastUpdate: new Date(),
        });
        this.logger.log(`Navire mis à jour : ${data.MetaData?.ShipName?.trim() || mmsi}`);
    }
    pruneStaleShips() {
        const now = Date.now();
        let removed = 0;
        for (const [mmsi, ship] of this.ships) {
            if (now - ship.lastUpdate.getTime() > STALE_SHIP_MAX_AGE_MS) {
                this.ships.delete(mmsi);
                removed++;
            }
        }
        if (removed > 0) {
            this.logger.log(`${removed} navires retirés du cache (${this.ships.size} restants).`);
        }
    }
    getAllShips() {
        return Array.from(this.ships.values());
    }
    onModuleDestroy() {
        this.destroyed = true;
        if (this.reconnectTimeout)
            clearTimeout(this.reconnectTimeout);
        if (this.cleanupInterval)
            clearInterval(this.cleanupInterval);
        this.ws?.close();
    }
};
exports.AisStreamAPI = AisStreamAPI;
exports.AisStreamAPI = AisStreamAPI = AisStreamAPI_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AisStreamAPI);
//# sourceMappingURL=aisstreamScript.js.map