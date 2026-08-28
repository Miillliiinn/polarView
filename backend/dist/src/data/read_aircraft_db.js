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
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractDatabase = extractDatabase;
exports.cleanupDatabase = cleanupDatabase;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const unzipper = __importStar(require("unzipper"));
const DB_PATH = path.join(os.tmpdir(), 'aircraft_metadata.db');
const ZIP_PATH = path.join(__dirname, 'aircraft_metadata.zip');
async function extractDatabase() {
    if (fs.existsSync(DB_PATH)) {
        return DB_PATH;
    }
    console.log('[Zip] Décompression en cours (Stream)...');
    return new Promise((resolve, reject) => {
        fs.createReadStream(ZIP_PATH)
            .pipe(unzipper.Parse())
            .on('entry', (entry) => {
            if (entry.type === 'File' && entry.path.endsWith('.db')) {
                entry
                    .pipe(fs.createWriteStream(DB_PATH))
                    .on('finish', () => {
                    console.log('[Zip] Base de données décompressée dans /tmp');
                    resolve(DB_PATH);
                })
                    .on('error', reject);
            }
            else {
                entry.autodrain();
            }
        })
            .on('error', reject);
    });
}
function cleanupDatabase() {
    if (fs.existsSync(DB_PATH)) {
        try {
            fs.unlinkSync(DB_PATH);
            console.log('[Cleanup] Fichier .db supprimé avec succès.');
        }
        catch (err) {
            console.error('[Cleanup] Erreur lors de la suppression du fichier :', err);
        }
    }
}
//# sourceMappingURL=read_aircraft_db.js.map