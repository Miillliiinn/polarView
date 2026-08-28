"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeAdsbAndOpensky = mergeAdsbAndOpensky;
const aircraftClassifier_1 = require("./aircraftClassifier");
function takeInformation(data, fieldName) {
    if (data && data[fieldName] !== undefined) {
        return data[fieldName];
    }
    return null;
}
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
        const engineDB = takeInformation(data, "engines");
        const aircraftclassDB = takeInformation(data, "icaoAircraftClass");
        const manufacturerIcaoDB = takeInformation(data, "manufacturerIcao");
        const manufacturerNameDB = takeInformation(data, "manufacturerName");
        const modelDB = takeInformation(data, "model");
        const operatorDB = takeInformation(data, "operator");
        const ownerDB = takeInformation(data, "owner");
        const typecodeDB = takeInformation(data, "typecode");
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
            kind: ac.kind ?? (os ? (0, aircraftClassifier_1.classifyOpenskyCategory)(os.category).kind : null),
            isMilitary: ac.isMilitary ?? null,
            isHelicopter: ac.isHelicopter ?? (os ? (0, aircraftClassifier_1.classifyOpenskyCategory)(os.category).isHelicopter : null),
            lastSeenSeconds: ac.lastSeenSeconds ?? null,
            engines: ac.engines ?? null,
            icaoAircraftClass: aircraftclassDB ?? null,
            manufacturerIcao: manufacturerIcaoDB ?? null,
            manufacturerName: manufacturerNameDB ?? null,
            model: modelDB ?? null,
            operator: operatorDB ?? null,
            owner: ownerDB ?? null,
            typecode: typecodeDB ?? null,
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
        const data = aircraftservice.getAircraftInDbByIcao(key);
        const engineDB = takeInformation(data, "engines");
        const aircraftclassDB = takeInformation(data, "icaoAircraftClass");
        const manufacturerIcaoDB = takeInformation(data, "manufacturerIcao");
        const manufacturerNameDB = takeInformation(data, "manufacturerName");
        const modelDB = takeInformation(data, "model");
        const operatorDB = takeInformation(data, "operator");
        const ownerDB = takeInformation(data, "owner");
        const typecodeDB = takeInformation(data, "typecode");
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
            kind,
            isMilitary: null,
            isHelicopter,
            lastSeenSeconds: null,
            engines: engineDB ?? null,
            icaoAircraftClass: aircraftclassDB ?? null,
            manufacturerIcao: manufacturerIcaoDB ?? null,
            manufacturerName: manufacturerNameDB ?? null,
            model: modelDB ?? null,
            operator: operatorDB ?? null,
            owner: ownerDB ?? null,
            typecode: typecodeDB ?? null,
            source: 'opensky',
        });
    }
    return Array.from(byIcao.values());
}
//# sourceMappingURL=mergeAdsbOpensky.js.map