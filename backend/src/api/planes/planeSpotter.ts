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
  catch (e)
  {
    console.error(`Erreur 'fetchPlaneSpotterPhoto(${icao24})' : `, e);
    return null;
  }
}