"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findOrFetchAndCache = findOrFetchAndCache;
const RETRY_AFTER_MS = 30 * 24 * 60 * 60 * 1000;
async function findOrFetchAndCache(delegate, id, fetchExternal, mapToRecord, hasPhoto) {
    const existing = await delegate.findUnique({ where: { id } });
    if (existing) {
        const isStale = Date.now() - new Date(existing.createdAt).getTime() > RETRY_AFTER_MS;
        if (hasPhoto(existing) || !isStale) {
            return existing;
        }
    }
    const photo = await fetchExternal(id);
    const dataFields = photo ? mapToRecord(photo) : {};
    try {
        return await delegate.upsert({
            where: { id },
            create: { id, createdAt: new Date(), ...dataFields },
            update: { createdAt: new Date(), ...dataFields },
        });
    }
    catch (e) {
        console.error(`Erreur 'findOrFetchAndCache(${id})' (sauvegarde DB) :`, e);
        return existing ?? null;
    }
}
//# sourceMappingURL=findOrFetchAndCache.js.map