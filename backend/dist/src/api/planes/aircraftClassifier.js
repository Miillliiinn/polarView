"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classifyOpenskyCategory = classifyOpenskyCategory;
exports.classifyAircraft = classifyAircraft;
const TYPE_TABLE = {
    A19N: { engines: 2, kindHint: 'commercial', label: 'Airbus A319neo' },
    A20N: { engines: 2, kindHint: 'commercial', label: 'Airbus A320neo' },
    A21N: { engines: 2, kindHint: 'commercial', label: 'Airbus A321neo' },
    A319: { engines: 2, kindHint: 'commercial', label: 'Airbus A319' },
    A320: { engines: 2, kindHint: 'commercial', label: 'Airbus A320' },
    A321: { engines: 2, kindHint: 'commercial', label: 'Airbus A321' },
    A332: { engines: 2, kindHint: 'commercial', label: 'Airbus A330-200' },
    A333: { engines: 2, kindHint: 'commercial', label: 'Airbus A330-300' },
    A339: { engines: 2, kindHint: 'commercial', label: 'Airbus A330-900neo' },
    A343: { engines: 4, kindHint: 'commercial', label: 'Airbus A340-300' },
    A359: { engines: 2, kindHint: 'commercial', label: 'Airbus A350-900' },
    A35K: { engines: 2, kindHint: 'commercial', label: 'Airbus A350-1000' },
    A388: { engines: 4, kindHint: 'commercial', label: 'Airbus A380' },
    B737: { engines: 2, kindHint: 'commercial', label: 'Boeing 737' },
    B738: { engines: 2, kindHint: 'commercial', label: 'Boeing 737-800' },
    B739: { engines: 2, kindHint: 'commercial', label: 'Boeing 737-900' },
    B38M: { engines: 2, kindHint: 'commercial', label: 'Boeing 737 MAX 8' },
    B39M: { engines: 2, kindHint: 'commercial', label: 'Boeing 737 MAX 9' },
    B752: { engines: 2, kindHint: 'commercial', label: 'Boeing 757-200' },
    B763: { engines: 2, kindHint: 'commercial', label: 'Boeing 767-300' },
    B772: { engines: 2, kindHint: 'commercial', label: 'Boeing 777-200' },
    B77W: { engines: 2, kindHint: 'commercial', label: 'Boeing 777-300ER' },
    B77L: { engines: 2, kindHint: 'commercial', label: 'Boeing 777F (cargo)' },
    B744: { engines: 4, kindHint: 'commercial', label: 'Boeing 747-400' },
    B788: { engines: 2, kindHint: 'commercial', label: 'Boeing 787-8' },
    B789: { engines: 2, kindHint: 'commercial', label: 'Boeing 787-9' },
    E190: { engines: 2, kindHint: 'commercial', label: 'Embraer E190' },
    E195: { engines: 2, kindHint: 'commercial', label: 'Embraer E195' },
    CRJ9: { engines: 2, kindHint: 'commercial', label: 'Bombardier CRJ900' },
    AT72: { engines: 2, kindHint: 'commercial', label: 'ATR 72' },
    AT76: { engines: 2, kindHint: 'commercial', label: 'ATR 72-600' },
    AT45: { engines: 2, kindHint: 'commercial', label: 'ATR 42' },
    DH8D: { engines: 2, kindHint: 'commercial', label: 'Bombardier Dash 8-400' },
    C25A: { engines: 2, kindHint: 'privateJet', label: 'Cessna Citation CJ2' },
    C25B: { engines: 2, kindHint: 'privateJet', label: 'Cessna Citation CJ3' },
    C25C: { engines: 2, kindHint: 'privateJet', label: 'Cessna Citation CJ4' },
    C550: { engines: 2, kindHint: 'privateJet', label: 'Cessna Citation II' },
    C56X: { engines: 2, kindHint: 'privateJet', label: 'Cessna Citation Excel/XLS' },
    C680: { engines: 2, kindHint: 'privateJet', label: 'Cessna Citation Sovereign' },
    C750: { engines: 2, kindHint: 'privateJet', label: 'Cessna Citation X' },
    CL30: { engines: 2, kindHint: 'privateJet', label: 'Bombardier Challenger 300' },
    CL35: { engines: 2, kindHint: 'privateJet', label: 'Bombardier Challenger 350' },
    CL60: { engines: 2, kindHint: 'privateJet', label: 'Bombardier Challenger 600' },
    GLEX: { engines: 2, kindHint: 'privateJet', label: 'Bombardier Global Express' },
    GL5T: { engines: 2, kindHint: 'privateJet', label: 'Bombardier Global 5000' },
    GLF4: { engines: 2, kindHint: 'privateJet', label: 'Gulfstream IV' },
    GLF5: { engines: 2, kindHint: 'privateJet', label: 'Gulfstream V' },
    GLF6: { engines: 2, kindHint: 'privateJet', label: 'Gulfstream G650' },
    FA7X: { engines: 3, kindHint: 'privateJet', label: 'Dassault Falcon 7X' },
    FA8X: { engines: 3, kindHint: 'privateJet', label: 'Dassault Falcon 8X' },
    F2TH: { engines: 2, kindHint: 'privateJet', label: 'Dassault Falcon 2000' },
    F900: { engines: 3, kindHint: 'privateJet', label: 'Dassault Falcon 900' },
    LJ45: { engines: 2, kindHint: 'privateJet', label: 'Learjet 45' },
    LJ60: { engines: 2, kindHint: 'privateJet', label: 'Learjet 60' },
    PC12: { engines: 1, kindHint: 'generalAviation', label: 'Pilatus PC-12 (turbopropulseur)' },
    TBM9: { engines: 1, kindHint: 'generalAviation', label: 'Daher TBM 900 (turbopropulseur)' },
    C172: { engines: 1, kindHint: 'generalAviation', label: 'Cessna 172' },
    C182: { engines: 1, kindHint: 'generalAviation', label: 'Cessna 182' },
    PA28: { engines: 1, kindHint: 'generalAviation', label: 'Piper PA-28' },
    PA34: { engines: 2, kindHint: 'generalAviation', label: 'Piper Seneca' },
    SR22: { engines: 1, kindHint: 'generalAviation', label: 'Cirrus SR22' },
    DA40: { engines: 1, kindHint: 'generalAviation', label: 'Diamond DA40' },
    DA42: { engines: 2, kindHint: 'generalAviation', label: 'Diamond DA42' },
    EC20: { engines: 1, kindHint: 'helicopter', label: 'Eurocopter EC120' },
    EC35: { engines: 2, kindHint: 'helicopter', label: 'Airbus H135 (EC135)' },
    EC45: { engines: 2, kindHint: 'helicopter', label: 'Airbus H145 (EC145)' },
    EC55: { engines: 2, kindHint: 'helicopter', label: 'Airbus H155 (EC155)' },
    AS50: { engines: 1, kindHint: 'helicopter', label: 'Airbus H125 (AS350 Écureuil)' },
    A139: { engines: 2, kindHint: 'helicopter', label: 'Leonardo AW139' },
    A169: { engines: 2, kindHint: 'helicopter', label: 'Leonardo AW169' },
    B06: { engines: 1, kindHint: 'helicopter', label: 'Bell 206' },
    B407: { engines: 1, kindHint: 'helicopter', label: 'Bell 407' },
    B429: { engines: 2, kindHint: 'helicopter', label: 'Bell 429' },
    R44: { engines: 1, kindHint: 'helicopter', label: 'Robinson R44' },
    R66: { engines: 1, kindHint: 'helicopter', label: 'Robinson R66' },
    S76: { engines: 2, kindHint: 'helicopter', label: 'Sikorsky S-76' },
    S92: { engines: 2, kindHint: 'helicopter', label: 'Sikorsky S-92' },
    H160: { engines: 2, kindHint: 'helicopter', label: 'Airbus H160' },
    H225: { engines: 2, kindHint: 'helicopter', label: 'Airbus H225 Super Puma' },
    H60: { engines: 2, kindHint: 'militaryHelicopter', label: 'Sikorsky UH-60 Black Hawk' },
    AH64: { engines: 2, kindHint: 'militaryHelicopter', label: 'Boeing AH-64 Apache' },
    TIGR: { engines: 2, kindHint: 'militaryHelicopter', label: 'Airbus Tigre (EC665)' },
    EC65: { engines: 2, kindHint: 'militaryHelicopter', label: 'Airbus Tigre (EC665)' },
    NH90: { engines: 2, kindHint: 'militaryHelicopter', label: 'NHIndustries NH90' },
    PUMA: { engines: 2, kindHint: 'militaryHelicopter', label: 'Aérospatiale Puma' },
    CGR2: { engines: 2, kindHint: 'militaryHelicopter', label: 'Airbus H225M Caracal' },
    CH47: { engines: 2, kindHint: 'militaryHelicopter', label: 'Boeing CH-47 Chinook' },
    RFAL: { engines: 2, kindHint: 'military', label: 'Dassault Rafale' },
    MIR2: { engines: 1, kindHint: 'military', label: 'Dassault Mirage 2000' },
    A400: { engines: 4, kindHint: 'military', label: 'Airbus A400M Atlas' },
    C130: { engines: 4, kindHint: 'military', label: 'Lockheed C-130 Hercules' },
    C160: { engines: 2, kindHint: 'military', label: 'Transall C-160' },
    E3TF: { engines: 4, kindHint: 'military', label: 'Boeing E-3 Sentry (AWACS)' },
    F16: { engines: 1, kindHint: 'military', label: 'General Dynamics F-16' },
    F15: { engines: 2, kindHint: 'military', label: 'McDonnell Douglas F-15' },
    F35: { engines: 1, kindHint: 'military', label: 'Lockheed Martin F-35' },
    TORN: { engines: 2, kindHint: 'military', label: 'Panavia Tornado' },
    EUFI: { engines: 2, kindHint: 'military', label: 'Eurofighter Typhoon' },
    K35R: { engines: 4, kindHint: 'military', label: 'Boeing KC-135 (ravitailleur)' },
};
function classifyOpenskyCategory(category) {
    const isHelicopter = category === 8;
    let kind = 'unknown';
    switch (category) {
        case 8:
            kind = 'helicopter';
            break;
        case 9:
            kind = 'glider';
            break;
        case 10:
            kind = 'balloon';
            break;
        case 14:
            kind = 'uav';
            break;
        case 16:
        case 17:
            kind = 'groundVehicle';
            break;
        case 4:
        case 5:
        case 6:
            kind = 'commercial';
            break;
        case 2:
        case 3:
            kind = 'generalAviation';
            break;
        default: kind = 'unknown';
    }
    return { kind, isHelicopter };
}
function classifyAircraft(raw) {
    const dbFlags = raw?.dbFlags ?? 0;
    const category = (raw?.category ?? '').toString().toUpperCase();
    const type = (raw?.t ?? '').toString().toUpperCase();
    const info = TYPE_TABLE[type];
    const isMilitaryFlag = !!(dbFlags & 1);
    const isGroundVehicle = category.startsWith('C');
    const isUav = category === 'B6';
    const isBalloon = category === 'B2';
    const isGlider = category === 'B1';
    const isHelicopterCategory = category === 'A7';
    const isHelicopter = isHelicopterCategory || info?.kindHint === 'helicopter' || info?.kindHint === 'militaryHelicopter';
    const isMilitary = isMilitaryFlag || info?.kindHint === 'military' || info?.kindHint === 'militaryHelicopter';
    let kind = 'unknown';
    if (isGroundVehicle)
        kind = 'groundVehicle';
    else if (isUav)
        kind = 'uav';
    else if (isBalloon)
        kind = 'balloon';
    else if (isGlider)
        kind = 'glider';
    else if (isHelicopter && isMilitary)
        kind = 'militaryHelicopter';
    else if (isHelicopter)
        kind = 'helicopter';
    else if (isMilitary)
        kind = 'military';
    else if (info?.kindHint === 'privateJet')
        kind = 'privateJet';
    else if (info?.kindHint === 'commercial')
        kind = 'commercial';
    else if (category === 'A3' || category === 'A4' || category === 'A5')
        kind = 'commercial';
    else if (category === 'A1' || category === 'A2')
        kind = 'generalAviation';
    return {
        kind,
        isMilitary,
        isHelicopter,
        engines: info?.engines ?? null,
        typeLabel: raw?.desc ?? info?.label ?? null,
    };
}
//# sourceMappingURL=aircraftClassifier.js.map