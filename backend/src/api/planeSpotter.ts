/**
 * Interroge l'API PlaneSpotters pour une photo d'avion par icao24.
 * Retourne le "photo" brut de l'API, ou null si absent / erreur.
 * Ne touche pas à la base de données : ça reste la responsabilité de l'appelant.
 */
export async function fetchPlaneSpotterPhoto(icao24: string) {
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