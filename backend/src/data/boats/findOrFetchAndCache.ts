const RETRY_AFTER_MS = 30 * 24 * 60 * 60 * 1000; // 30 jours

/**
 *
 * @param delegate      Le modèle Prisma concerné (this.prisma.ships, this.prisma.planes, ...)
 * @param id            L'identifiant (imo, icao24, ...)
 * @param fetchExternal La fonction qui va chercher la donnée à l'extérieur (API tierce)
 * @param mapToRecord   Transforme le résultat externe en champs Prisma (hors id/createdAt)
 * @param hasPhoto      Détermine si un enregistrement DB contient une vraie photo ou non
 */

export async function findOrFetchAndCache<TExternal>(
  delegate: any,
  id: string,
  fetchExternal: (id: string) => Promise<TExternal | null>,
  mapToRecord: (photo: TExternal) => Record<string, any>,
  hasPhoto: (record: any) => boolean
): Promise<any> {
  const existing = await delegate.findUnique({ where: { id } });

  if (existing) {
    const isStale =
      Date.now() - new Date(existing.createdAt).getTime() > RETRY_AFTER_MS;

    if (hasPhoto(existing) || !isStale) {
      return existing;
    }
  }

  const photo = await fetchExternal(id);
  const dataFields = photo ? mapToRecord(photo) : {};

  try
  {
    return await delegate.upsert({
      where: { id },
      create: { id, createdAt: new Date(), ...dataFields },
      update: { createdAt: new Date(), ...dataFields },
    });
  }
  catch (e)
  {
    console.error(`Erreur 'findOrFetchAndCache(${id})' (sauvegarde DB) :`, e);
    return existing ?? null;
  }
}