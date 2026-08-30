"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AircraftService = void 0;
const common_1 = require("@nestjs/common");
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const fs = __importStar(require("fs"));
const adm_zip_1 = __importDefault(require("adm-zip"));
const DB_PATH = path.join(os.tmpdir(), 'aircraft_metadata.db');
const ZIP_PATH = path.join(__dirname, 'aircraft_metadata.zip');
const MIN_VALID_SIZE_BYTES = 80 * 1024 * 1024;
let AircraftService = class AircraftService {
    db;
    onModuleInit() {
        this.ensureDbIsExtracted();
        this.db = new better_sqlite3_1.default(DB_PATH, { readonly: true, fileMustExist: true });
        const tables = this.db
            .prepare("SELECT name FROM sqlite_master WHERE type='table'")
            .all();
        console.log('[SQLite] Connexion à aircraft_metadata.db établie.');
        console.log('[SQLite] Tables trouvées:', tables.map(t => t.name));
        if (!tables.some(t => t.name === 'aircraft')) {
            throw new Error(`[SQLite] La table "aircraft" est absente de ${DB_PATH}. ` +
                `L'extraction automatique a peut-être échoué.`);
        }
    }
    ensureDbIsExtracted() {
        const needsExtraction = !fs.existsSync(DB_PATH) ||
            fs.statSync(DB_PATH).size < MIN_VALID_SIZE_BYTES;
        if (!needsExtraction) {
            console.log('[SQLite] Base déjà présente et valide dans /tmp, extraction ignorée.');
            return;
        }
        if (!fs.existsSync(ZIP_PATH)) {
            throw new Error(`[SQLite] Zip source introuvable: ${ZIP_PATH}`);
        }
        console.log(`[SQLite] Extraction de ${ZIP_PATH} vers ${os.tmpdir()}...`);
        const zip = new adm_zip_1.default(ZIP_PATH);
        zip.extractAllTo(os.tmpdir(), true);
        if (!fs.existsSync(DB_PATH) || fs.statSync(DB_PATH).size === 0) {
            throw new Error(`[SQLite] Extraction échouée ou fichier vide après extraction: ${DB_PATH}`);
        }
        console.log(`[SQLite] Extraction réussie (${(fs.statSync(DB_PATH).size / 1024 / 1024).toFixed(1)} Mo).`);
    }
    onModuleDestroy() {
        if (this.db) {
            this.db.close();
            console.log('[SQLite] Connexion fermée.');
        }
        try {
            if (fs.existsSync(DB_PATH)) {
                fs.unlinkSync(DB_PATH);
                console.log('[SQLite] Fichier /tmp/aircraft_metadata.db supprimé.');
            }
        }
        catch (err) {
            console.error('[SQLite] Erreur lors de la suppression du fichier temporaire:', err);
        }
    }
    getAircraftInDbByIcao(icao24) {
        const stmt = this.db.prepare('SELECT * FROM aircraft WHERE icao24 = ?');
        return stmt.get(icao24);
    }
};
exports.AircraftService = AircraftService;
exports.AircraftService = AircraftService = __decorate([
    (0, common_1.Injectable)()
], AircraftService);
//# sourceMappingURL=aircraft_service.js.map