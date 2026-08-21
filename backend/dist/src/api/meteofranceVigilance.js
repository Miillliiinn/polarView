"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchMeteofranceVigilance = fetchMeteofranceVigilance;
async function fetchMeteofranceVigilance(apiKey) {
    try {
        const apiResult = await fetch('https://public-api.meteofrance.fr/public/DPVigilance/v1/cartevigilance/encours', {
            method: 'GET',
            headers: {
                'apikey': apiKey,
                'Accept': 'application/json',
            },
        });
        if (!apiResult.ok) {
            throw new Error(`Météo-France repond avec un statut : ${apiResult.status}`);
        }
        const data = await apiResult.json();
        const domainIds = data.product?.periods?.[0]?.timelaps?.domain_ids || [];
        if (domainIds.length === 0) {
            console.warn("Météo-France a renvoyé un tableau domain_ids vide. Structure reçue :", JSON.stringify(data));
            return [];
        }
        return domainIds.map((dep) => ({
            department: dep.domain_id,
            maxColorId: dep.max_color_id,
            phenomenons: dep.phenomenon_items?.map((p) => ({
                id: p.phenomenon_id,
                colorId: p.phenomenon_max_color_id,
                schedule: p.timelaps_items?.map((t) => ({
                    begin: t.begin_time,
                    end: t.end_time,
                    color: t.color_id,
                })) || []
            })) || []
        }));
    }
    catch (e) {
        console.error("Error 'fetchMeteofranceVigilance()' : ", e);
        return [];
    }
}
//# sourceMappingURL=meteofranceVigilance.js.map