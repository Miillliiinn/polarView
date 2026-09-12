"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchCestrack = fetchCestrack;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const CACHE_DIR = path_1.default.join(process.cwd(), '.cache', 'satellite');
const CACHE_FILE = path_1.default.join(CACHE_DIR, 'celestrack-cache.json');
const TWO_HOURS_MS = 2 * 60 * 60 * 1000;
async function readCelestrackCache() {
    try {
        const raw = await fs_1.promises.readFile(CACHE_FILE, 'utf-8');
        return JSON.parse(raw);
    }
    catch (e) {
        return null;
    }
}
async function writeCelestrackCache(data) {
    await fs_1.promises.mkdir(CACHE_DIR, { recursive: true });
    const payload = {
        fetchedAt: new Date().toISOString(),
        data,
    };
    await fs_1.promises.writeFile(CACHE_FILE, JSON.stringify(payload), 'utf-8');
}
function isCacheFresh(cache) {
    const age = Date.now() - new Date(cache.fetchedAt).getTime();
    return age < TWO_HOURS_MS;
}
async function fetchCestrack() {
    const cached = await readCelestrackCache();
    if (cached && isCacheFresh(cached)) {
        console.log(`🛰️  Celestrak: cache encore valide (récupéré le ${cached.fetchedAt}), pas de fetch.`);
        return cached.data;
    }
    try {
        const url = "https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=JSON";
        const USER_AGENT = 'TrackerView (+https://github.com/miillliiinn)';
        const response = await fetch(url, {
            headers: { 'User-Agent': USER_AGENT },
        });
        if (!response.ok) {
            const body = await response.text().catch(() => '');
            console.error(`Celestrak API status: ${response.status} ${response.statusText} - ${body}`);
            if (cached) {
                console.log("↩️  Fallback sur le cache existant.");
                return cached.data;
            }
            return [];
        }
        const raw = await response.json();
        const mapped = raw.map((f) => ({
            name: f.OBJECT_NAME,
            id: f.NORAD_CAT_ID,
            objectId: f.OBJECT_ID,
            owner: f.OWNER,
            launchDate: f.LAUNCH_DATE,
            epoch: f.EPOCH,
            meanMotion: f.MEAN_MOTION,
            eccentricity: f.ECCENTRICITY,
            inclination: f.INCLINATION,
            raOfAscNode: f.RA_OF_ASC_NODE,
            argOfPericenter: f.ARG_OF_PERICENTER,
            meanAnomaly: f.MEAN_ANOMALY,
            ephemerisType: f.EPHEMERIS_TYPE,
            classificationType: f.CLASSIFICATION_TYPE,
            elementSetNo: f.ELEMENT_SET_NO,
            revAtEpoch: f.REV_AT_EPOCH,
            bstar: f.BSTAR,
            meanMotionDot: f.MEAN_MOTION_DOT,
            meanMotionDdot: f.MEAN_MOTION_DDOT,
            raw: f,
        }));
        await writeCelestrackCache(mapped);
        console.log("🛰️  Celestrak API request 🛰️");
        return mapped;
    }
    catch (e) {
        console.error(`Error 'callCelestrackAPI' : `, e);
        if (cached)
            return cached.data;
        return [];
    }
}
//# sourceMappingURL=celestrack.js.map