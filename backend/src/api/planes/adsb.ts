import { classifyAircraft } from './aircraftClassifier';

export interface AdsbZone
{
  lat: number;
  lon: number;
  /** rayon en miles nautiques, 250 NM max côté adsb.fi/adsb.lol */
  dist: number;
}

/**
 * Zones par défaut couvrant la France métropolitaine et ses abords, dans l'esprit de la bbox
 * utilisée précédemment pour OpenSky (lamin 37.5/lamax 55.5/lomin -9.0/lomax 13.0).
 * adsb.fi et adsb.lol limitent le rayon à 250 NM (~463 km) par requête, d'où le découpage en
 * plusieurs points qui se chevauchent légèrement. À ajuster librement selon la zone qui vous
 * intéresse (moins de zones = moins de requêtes = cache rafraîchi plus vite).
 */
export const DEFAULT_FRANCE_ZONES: AdsbZone[] = [
  { lat: 47.2, lon: -1.6, dist: 220 }, // Nantes / façade atlantique
  { lat: 48.85, lon: 2.35, dist: 250 }, // Paris / nord / Benelux
  { lat: 43.6, lon: 1.44, dist: 250 }, // Toulouse / sud-ouest / nord Espagne
  { lat: 45.0, lon: 6.5, dist: 220 }, // Lyon / est / Suisse / nord Italie
];

function adsbfiUrl(zone: AdsbZone) {
  return `https://opendata.adsb.fi/api/v3/lat/${zone.lat}/lon/${zone.lon}/dist/${zone.dist}`;
}

function adsblolUrl(zone: AdsbZone) {
  return `https://api.adsb.lol/v2/point/${zone.lat}/${zone.lon}/${zone.dist}`;
}

const USER_AGENT = 'PolarView-Backend/1.0 (+https://github.com/thomas/polarView)';

async function fetchZoneFrom(url: string): Promise<any[]> {
  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': USER_AGENT,
    },
  });
  if (!res.ok) {
    throw new Error(`Statut HTTP ${res.status} pour ${url}`);
  }
  const data = await res.json();
  return data.ac || [];
}

/**
 * Récupère une zone en tentant adsb.fi en premier, puis adsb.lol en repli si adsb.fi échoue
 * (indisponibilité, 429, maintenance, etc).
 */
async function fetchZoneWithFallback(zone: AdsbZone): Promise<any[]> {
  try {
    return await fetchZoneFrom(adsbfiUrl(zone));
  } catch (e) {
    console.warn(`adsb.fi indisponible pour la zone (${zone.lat}, ${zone.lon}), repli sur adsb.lol :`, e);
    try {
      return await fetchZoneFrom(adsblolUrl(zone));
    } catch (e2) {
      console.error(`adsb.lol indisponible également pour la zone (${zone.lat}, ${zone.lon}) : `, e2);
      return [];
    }
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Récupère et fusionne les aéronefs sur toutes les zones fournies, en dédoublonnant par `hex`
 * (une même cible peut apparaître dans deux zones qui se chevauchent).
 * Les requêtes sont espacées de 350ms pour respecter la limite publique d'environ 1 req/s
 * d'adsb.fi. Retourne [] en cas d'erreur globale (jamais d'exception qui remonte).
 */
export async function fetchAdsbStates(zones: AdsbZone[] = DEFAULT_FRANCE_ZONES) {
  try {
    const byHex = new Map<string, any>();

    for (const zone of zones) {
      const aircrafts = await fetchZoneWithFallback(zone);
      for (const ac of aircrafts) {
        if (!ac.hex || ac.lat == null || ac.lon == null) continue;
        byHex.set(ac.hex, ac);
      }
      await sleep(2000); // adsb.fi limite à 1 req/s : on garde une marge pour éviter les 429
    }

    console.log(`✈️  ADSB (adsb.fi / adsb.lol) request — ${byHex.size} appareils ✈️`);
    
    return Array.from(byHex.values()).map((ac) => {
      const classification = classifyAircraft(ac);
      return {
        icao24: ac.hex,
        callsign: ac.flight?.trim() || null,
        registration: ac.r ?? null,
        longitude: ac.lon,
        latitude: ac.lat,
        altitude: typeof ac.alt_baro === 'number' ? Math.round(ac.alt_baro * 0.3048 * 100) / 100 : typeof ac.alt_geom === 'number' ? Math.round(ac.alt_geom * 0.3048 * 100) / 100 : 0,
        onGround: ac.alt_baro === 'ground' || ac.gs === 0,
        heading: ac.track ?? ac.true_heading ?? 0,
        velocity: typeof ac.gs === 'number' ? ac.gs / 1.94384 : 0,
        verticalRate: typeof ac.baro_rate === 'number' ? Math.round(ac.baro_rate * 0.00508 * 100) / 100 : 0,
        squawk: ac.squawk ?? null,
        typeCode: ac.t ?? null,
        typeLabel: classification.typeLabel,
        engines: classification.engines,
        // 'commercial' | 'privateJet' | 'generalAviation' | 'helicopter' | 'militaryHelicopter'
        // | 'military' | 'glider' | 'balloon' | 'uav' | 'groundVehicle' | 'unknown'
        kind: classification.kind,
        isMilitary: classification.isMilitary,
        isHelicopter: classification.isHelicopter,
        lastSeenSeconds: ac.seen ?? null,
      };
    });
  } catch (e) {
    console.error("Error 'fetchAdsbStates()' : ", e);
    return [];
  }
}