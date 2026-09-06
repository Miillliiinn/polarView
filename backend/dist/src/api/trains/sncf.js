"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GARES_MAJEURES = void 0;
exports.fetchSncfDepartures = fetchSncfDepartures;
exports.fetchSncfGares = fetchSncfGares;
exports.fetchSncfRailLines = fetchSncfRailLines;
exports.GARES_MAJEURES = [
    { id: 'stop_area:SNCF:87686006', name: 'Paris Gare de Lyon' },
    { id: 'stop_area:SNCF:87271007', name: 'Paris Gare du Nord' },
    { id: 'stop_area:SNCF:87547000', name: 'Paris Gare d\'Austerlitz' },
    { id: 'stop_area:SNCF:87723163', name: 'Lyon Part-Dieu' },
    { id: 'stop_area:SNCF:87751008', name: 'Marseille Saint-Charles' },
    { id: 'stop_area:SNCF:87581009', name: 'Bordeaux Saint-Jean' },
    { id: 'stop_area:SNCF:87286005', name: 'Lille Flandres' },
    { id: 'stop_area:SNCF:87481002', name: 'Nantes' },
    { id: 'stop_area:SNCF:87212027', name: 'Strasbourg Ville' },
    { id: 'stop_area:SNCF:87611004', name: 'Toulouse Matabiau' },
    { id: 'stop_area:SNCF:87391003', name: 'Paris Montparnasse' },
    { id: 'stop_area:SNCF:87113001', name: 'Paris Est' },
    { id: 'stop_area:SNCF:87384008', name: 'Paris Saint-Lazare' },
    { id: 'stop_area:SNCF:87471003', name: 'Rennes' },
    { id: 'stop_area:SNCF:87756056', name: 'Nice Ville' },
    { id: 'stop_area:SNCF:87773002', name: 'Montpellier Saint-Roch' },
    { id: 'stop_area:SNCF:87755009', name: 'Toulon' },
    { id: 'stop_area:SNCF:87141002', name: 'Nancy Ville' },
    { id: 'stop_area:SNCF:87111849', name: 'Marne-la-Vallée Chessy' },
    { id: 'stop_area:SNCF:87393702', name: 'Massy TGV' },
    { id: 'stop_area:SNCF:87271494', name: 'Aéroport CDG2 TGV' },
];
function formatSncfDatetime(now) {
    const pad = (num) => String(num).padStart(2, '0');
    return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}T${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}
async function fetchDeparturesForGare(gare, authHeader, datetimeSncf) {
    try {
        const url = `https://api.sncf.com/v1/coverage/sncf/stop_areas/${gare.id}/departures?from_datetime=${datetimeSncf}&count=100`;
        const res = await fetch(url, { headers: { 'Authorization': authHeader } });
        if (!res.ok) {
            const body = await res.text().catch(() => '');
            if (res.status === 429 || body.toLowerCase().includes('quota')) {
                console.error(`Quota SNCF probablement dépassé : ${res.status} — ${body}`);
            }
            return [];
        }
        const data = await res.json();
        return (data.departures || []).map((dep) => {
            const display = dep.display_informations;
            const stopPoint = dep.stop_point;
            return {
                id: `${display?.headsign}-${dep.stop_date_time?.departure_date_time}`,
                trainNumber: display?.headsign,
                type: display?.commercial_mode,
                operator: display?.network,
                departureTime: dep.stop_date_time?.departure_date_time,
                stationName: stopPoint?.name,
                direction: display?.direction ?? null,
                latitude: stopPoint?.coord?.lat ? parseFloat(stopPoint.coord.lat) : null,
                longitude: stopPoint?.coord?.lon ? parseFloat(stopPoint.coord.lon) : null,
            };
        });
    }
    catch (err) {
        console.warn(`Impossible de récupérer les trains pour ${gare.name}`);
        return [];
    }
}
async function fetchSncfDepartures(apiKey) {
    try {
        if (!apiKey)
            throw new Error("La clé SNCF_API est introuvable.");
        const authHeader = 'Basic ' + Buffer.from(apiKey.trim() + ':').toString('base64');
        const datetimeSncf = formatSncfDatetime(new Date());
        const promessesGares = exports.GARES_MAJEURES.map((gare) => fetchDeparturesForGare(gare, authHeader, datetimeSncf));
        const résultatsParGare = await Promise.all(promessesGares);
        const tousLesTrains = résultatsParGare.flat();
        return tousLesTrains.filter((train, index, self) => index === self.findIndex((t) => t.id === train.id));
    }
    catch (e) {
        console.error("Error 'fetchSncfDepartures()' : ", e);
        return [];
    }
}
async function fetchSncfGares() {
    try {
        const apiResult = await fetch('https://ressources.data.sncf.com/api/explore/v2.1/catalog/datasets/gares-de-voyageurs/exports/geojson');
        if (!apiResult.ok) {
            throw new Error(`SNCF (gare) repond avec un statut : ${apiResult.status}`);
        }
        return await apiResult.json();
    }
    catch (e) {
        console.error("Error 'fetchSncfGares()' : ", e);
        return { type: 'FeatureCollection', features: [] };
    }
}
async function fetchSncfRailLines() {
    try {
        const apiResult = await fetch('https://ressources.data.sncf.com/api/explore/v2.1/catalog/datasets/formes-des-lignes-du-rfn/exports/geojson');
        if (!apiResult.ok) {
            throw new Error(`SNCF (rail) repond avec un statut : ${apiResult.status}`);
        }
        return await apiResult.json();
    }
    catch (e) {
        console.error("Error 'fetchSncfRailLines()' : ", e);
        return [];
    }
}
//# sourceMappingURL=sncf.js.map