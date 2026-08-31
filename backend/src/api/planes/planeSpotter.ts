/**
 * Interroge l'API PlaneSpotters pour une photo d'avion par icao24.
 * Retourne le "photo" brut de l'API, ou null si absent / erreur.
 * Ne touche pas à la base de données : ça reste la responsabilité de l'appelant.
 */
export async function fetchPlaneSpotterPhoto(icao24: string) {
  try {
    const url = `https://api.planespotters.net/pub/photos/hex/${icao24}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'polarview/1.0 (+mailto:thomasmilin1@gmail.com)',
        'Accept': 'application/json'
      },
    });

    if (!response.ok) {
      console.warn(`Planespotters HTTP Error ${response.status} pour le hex: ${icao24}`);
      return null;
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.warn(`Planespotters a renvoyé du non-JSON (${contentType}) pour le hex: ${icao24}`);
      return null;
    }

    const json = await response.json();
    return json.photos?.[0] ?? null;
  }
  catch (e) {
    console.error(`Erreur 'fetchPlaneSpotterPhoto(${icao24})' : `, e);
    return null;
  }
}