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
const rxjs_1 = require("rxjs");
const RECONNECT_DELAY_MS = 5000;
const STALE_SHIP_MAX_AGE_MS = 30 * 60 * 1000;
const STALE_CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
function getShipTypeLabel(type) {
    if (type === null)
        return 'Inconnu';
    if (type === 30)
        return 'Pêche';
    if (type === 31 || type === 32)
        return 'Remorqueur';
    if (type === 33)
        return 'Dragage';
    if (type === 34)
        return 'Plongée';
    if (type === 35)
        return 'Militaire';
    if (type === 36)
        return 'Voilier';
    if (type === 37)
        return 'Plaisance';
    if (type >= 40 && type <= 49)
        return 'Vitesse';
    if (type === 50)
        return 'Pilotage';
    if (type === 51)
        return 'Secours (SAR)';
    if (type === 52)
        return 'Remorqueur portuaire';
    if (type === 53)
        return 'Bateau-port';
    if (type === 54)
        return 'Équipement anti-pollution';
    if (type === 55)
        return 'Autorité / Police';
    if (type === 56 || type === 57)
        return 'Navire local';
    if (type === 58)
        return 'Transport médical';
    if (type === 59)
        return 'Navire non combattant';
    if (type >= 60 && type <= 69)
        return 'Passagers';
    if (type >= 70 && type <= 79)
        return 'Cargo';
    if (type >= 80 && type <= 89)
        return 'Pétrolier';
    if (type >= 90 && type <= 99)
        return 'Autre';
    return 'Non spécifié';
}
let AisStreamAPI = AisStreamAPI_1 = class AisStreamAPI {
    configService;
    logger = new common_1.Logger(AisStreamAPI_1.name);
    ws = null;
    ships = new Map();
    shipTypes = new Map();
    shipUpdates$ = new rxjs_1.Subject();
    reconnectTimeout = null;
    cleanupInterval = null;
    destroyed = false;
    constructor(configService) {
        this.configService = configService;
    }
    onModuleInit() {
        if (process.env.RUN_BOATS_API !== 'true')
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
                FilterMessageTypes: ['PositionReport', 'ShipStaticData'],
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
            if (data.MessageType === 'ShipStaticData') {
                this.updateShipType(data);
            }
            else {
                this.updateShipData(data);
            }
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
    updateShipType(data) {
        const mmsi = data.MetaData?.MMSI;
        const type = data.Message?.ShipStaticData?.Type;
        if (!mmsi || type === undefined)
            return;
        this.shipTypes.set(mmsi, type);
        const existing = this.ships.get(mmsi);
        if (existing) {
            const updated = {
                ...existing,
                shipType: type,
                shipTypeLabel: getShipTypeLabel(type),
            };
            this.ships.set(mmsi, updated);
            this.shipUpdates$.next(updated);
        }
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
        const shipType = this.shipTypes.get(mmsi) ?? null;
        const updatedShip = {
            mmsi,
            name: data.MetaData?.ShipName?.trim() || 'Inconnu',
            latitude,
            longitude,
            speed: pos?.Sog ?? 0,
            heading: pos?.TrueHeading ?? 0,
            lastUpdate: new Date(),
            shipType,
            shipTypeLabel: getShipTypeLabel(shipType),
        };
        this.ships.set(mmsi, updatedShip);
        this.shipUpdates$.next(updatedShip);
        this.logger.log(`Navire mis à jour : ${updatedShip.name || mmsi}`);
    }
    pruneStaleShips() {
        const now = Date.now();
        let removed = 0;
        for (const [mmsi, ship] of this.ships) {
            if (now - ship.lastUpdate.getTime() > STALE_SHIP_MAX_AGE_MS) {
                this.ships.delete(mmsi);
                this.shipTypes.delete(mmsi);
                removed++;
            }
        }
        if (removed > 0) {
            this.logger.log(`${removed} navires retirés du cache (${this.ships.size} restants).`);
        }
    }
    getShipUpdates() {
        return this.shipUpdates$.asObservable();
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
        this.shipUpdates$.complete();
    }
};
exports.AisStreamAPI = AisStreamAPI;
exports.AisStreamAPI = AisStreamAPI = AisStreamAPI_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AisStreamAPI);
//# sourceMappingURL=aisstreamScript.js.map