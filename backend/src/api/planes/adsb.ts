import { classifyAircraft } from './aircraftClassifier';

export interface AdsbZone
{
  lat: number;
  lon: number;
  dist: number;
}

export const DEFAULT_FRANCE_ZONES: AdsbZone[] = [
  { lat: 47.2, lon: -1.6, dist: 220 }, 
  { lat: 48.85, lon: 2.35, dist: 250 }, 
  { lat: 43.6, lon: 1.44, dist: 250 },
  { lat: 45.0, lon: 6.5, dist: 220 }, 
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

export async function fetchAdsbStates(zones: AdsbZone[] = DEFAULT_FRANCE_ZONES) {
  try {
    const byHex = new Map<string, any>();

    for (const zone of zones) {
      const aircrafts = await fetchZoneWithFallback(zone);
      for (const ac of aircrafts) {
        if (!ac.hex || ac.lat == null || ac.lon == null) continue;
        byHex.set(ac.hex, ac);
      }
      await sleep(2000);
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