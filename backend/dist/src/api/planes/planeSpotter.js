"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchPlaneSpotterPhoto = fetchPlaneSpotterPhoto;
async function fetchPlaneSpotterPhoto(icao24) {
    try {
        const url = `https://api.planespotters.net/pub/photos/hex/${icao24}`;
        const result = await fetch(url, {
            headers: {
                'User-Agent': 'polarview/1.0 (+mailto:thomasmilin1@gmail.com)',
            },
        });
        const json = await result.json();
        return json.photos?.[0] ?? null;
    }
    catch (e) {
        console.error(`Erreur 'fetchPlaneSpotterPhoto(${icao24})' : `, e);
        return null;
    }
}
//# sourceMappingURL=planeSpotter.js.map