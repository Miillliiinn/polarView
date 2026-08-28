"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeAdsbAndOpensky = mergeAdsbAndOpensky;
const aircraftClassifier_1 = require("./aircraftClassifier");
function mergeAdsbAndOpensky(adsbCache, openskyCache, aircraftservice) {
    const byIcao = new Map();
    const openskyByIcao = new Map();
    for (const os of openskyCache || []) {
        if (!os.icao24)
            continue;
        openskyByIcao.set(os.icao24.toLowerCase(), os);
    }
    for (const ac of adsbCache || []) {
        if (!ac.icao24)
            continue;
        const key = ac.icao24.toLowerCase();
        const os = openskyByIcao.get(key);
        const data = aircraftservice.getAircraftInDbByIcao(key);
        console.log(data);
        byIcao.set(key, {
            icao24: ac.icao24,
            callsign: ac.callsign ?? os?.callsign ?? null,
            originCountry: os?.country ?? null,
            registration: ac.registration ?? null,
            longitude: ac.longitude ?? os?.longitude ?? null,
            latitude: ac.latitude ?? os?.latitude ?? null,
            altitude: ac.altitude ?? os?.altitude ?? null,
            onGround: ac.onGround ?? os?.onGround ?? null,
            heading: ac.heading ?? os?.heading ?? null,
            velocity: ac.velocity ?? os?.velocity ?? null,
            verticalRate: ac.verticalRate ?? os?.verticalRate ?? null,
            squawk: ac.squawk ?? os?.squawk ?? null,
            typeCode: ac.typeCode ?? null,
            typeLabel: ac.typeLabel ?? null,
            engines: ac.engines ?? null,
            kind: ac.kind ?? (os ? (0, aircraftClassifier_1.classifyOpenskyCategory)(os.category).kind : null),
            isMilitary: ac.isMilitary ?? null,
            isHelicopter: ac.isHelicopter ?? (os ? (0, aircraftClassifier_1.classifyOpenskyCategory)(os.category).isHelicopter : null),
            lastSeenSeconds: ac.lastSeenSeconds ?? null,
            source: os ? 'both' : 'adsb',
        });
    }
    for (const os of openskyCache || []) {
        if (!os.icao24)
            continue;
        const key = os.icao24.toLowerCase();
        if (byIcao.has(key))
            continue;
        const { kind, isHelicopter } = (0, aircraftClassifier_1.classifyOpenskyCategory)(os.category);
        byIcao.set(key, {
            icao24: os.icao24,
            callsign: os.callsign ?? null,
            originCountry: os.country ?? null,
            registration: null,
            longitude: os.longitude ?? null,
            latitude: os.latitude ?? null,
            altitude: os.altitude ?? null,
            onGround: os.onGround ?? null,
            heading: os.heading ?? null,
            velocity: os.velocity ?? null,
            verticalRate: os.verticalRate ?? null,
            squawk: os.squawk ?? null,
            typeCode: null,
            typeLabel: null,
            engines: null,
            kind,
            isMilitary: null,
            isHelicopter,
            lastSeenSeconds: null,
            source: 'opensky',
        });
    }
    return Array.from(byIcao.values());
}
//# sourceMappingURL=mergeAdsbOpensky.js.map