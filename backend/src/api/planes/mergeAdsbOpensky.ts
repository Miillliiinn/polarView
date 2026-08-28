import { classifyOpenskyCategory } from './aircraftClassifier';
import { AircraftService } from 'src/data/aircraft_service';

export interface CombinedAircraft
{
  icao24: string;
  callsign: string | null;
  originCountry: string | null;
  registration: string | null;
  longitude: number | null;
  latitude: number | null;
  altitude: number | null;
  onGround: boolean | null;
  heading: number | null;
  velocity: number | null;
  verticalRate: number | null;
  squawk: string | null;
  typeCode: string | null;
  typeLabel: string | null;
  kind: string | null;
  isMilitary: boolean | null;
  isHelicopter: boolean | null;
  lastSeenSeconds: number | null;
  engines: number | null;
  icaoAircraftClass: string | null;
  manufacturerIcao: string | null;
  manufacturerName: string | null;
  model: string | null;
  operator: string | null;
  owner: string | null;
  typecode: number | null;
  source: 'adsb' | 'opensky' | 'both';
}

function takeInformation(data: any, fieldName: string)
{
  if (data && data[fieldName] !== undefined)
  {
    return data[fieldName];
  }
  return null;
}

export function mergeAdsbAndOpensky(adsbCache: any[], openskyCache: any[], aircraftservice: AircraftService): CombinedAircraft[]
{

  const byIcao = new Map<string, CombinedAircraft>();

  const openskyByIcao = new Map<string, any>();
  for (const os of openskyCache || []) {
    if (!os.icao24) continue;
    openskyByIcao.set(os.icao24.toLowerCase(), os);
  }

  for (const ac of adsbCache || [])
  {
    if (!ac.icao24) continue;
    const key = ac.icao24.toLowerCase();
    const os = openskyByIcao.get(key);

    const data = aircraftservice.getAircraftInDbByIcao(key);

    const aircraftclassDB = takeInformation(data, "icaoAircraftClass");
    const manufacturerIcaoDB = takeInformation(data, "manufacturerIcao");
    const manufacturerNameDB = takeInformation(data, "manufacturerName");
    const modelDB = takeInformation(data, "model");
    const operatorDB = takeInformation(data, "operator");
    const ownerDB = takeInformation(data, "owner");
    const typecodeDB = takeInformation(data, "typecode");

    byIcao.set(key, {
      icao24: ac.icao24,
      callsign: ac.callsign ?? os?.callsign ?? null,
      originCountry: os?.country ?? null,
      registration: ac.registration ?? null, 
      longitude: ac.longitude ?? os?.longitude ?? null,
      latitude: ac.latitude ?? os?.latitude ?? null,
      altitude: ac.altitude ?? os?.altitude ?? null,
      onGround: ac.onGround ?? os?.onGround ?? null,
      heading: ac.heading ?? os?.heading ?? null,
      velocity: ac.velocity ?? os?.velocity ?? null,
      verticalRate: ac.verticalRate ?? os?.verticalRate ?? null,
      squawk: ac.squawk ?? os?.squawk ?? null,
      typeCode: ac.typeCode ?? null, 
      typeLabel: ac.typeLabel ?? null,
      kind: ac.kind ?? (os ? classifyOpenskyCategory(os.category).kind : null),
      isMilitary: ac.isMilitary ?? null, 
      isHelicopter: ac.isHelicopter ?? (os ? classifyOpenskyCategory(os.category).isHelicopter : null),
      lastSeenSeconds: ac.lastSeenSeconds ?? null,
      engines: ac.engines ?? null,
      icaoAircraftClass: aircraftclassDB ?? null,
      manufacturerIcao: manufacturerIcaoDB ?? null,
      manufacturerName: manufacturerNameDB ?? null,
      model: modelDB ?? null,
      operator: operatorDB ?? null,
      owner: ownerDB ?? null,
      typecode: typecodeDB ?? null,
      source: os ? 'both' : 'adsb',
    });
  }

  for (const os of openskyCache || [])
  {
    if (!os.icao24) continue;
    const key = os.icao24.toLowerCase();
    if (byIcao.has(key)) continue; 

    const { kind, isHelicopter } = classifyOpenskyCategory(os.category);

    const data = aircraftservice.getAircraftInDbByIcao(key);

    const engineDB = takeInformation(data, "engines");
    const aircraftclassDB = takeInformation(data, "icaoAircraftClass");
    const manufacturerIcaoDB = takeInformation(data, "manufacturerIcao");
    const manufacturerNameDB = takeInformation(data, "manufacturerName");
    const modelDB = takeInformation(data, "model");
    const operatorDB = takeInformation(data, "operator");
    const ownerDB = takeInformation(data, "owner");
    const typecodeDB = takeInformation(data, "typecode");

    byIcao.set(key, {
      icao24: os.icao24,
      callsign: os.callsign ?? null,
      originCountry: os.country ?? null,
      registration: null, 
      longitude: os.longitude ?? null,
      latitude: os.latitude ?? null,
      altitude: os.altitude ?? null,
      onGround: os.onGround ?? null,
      heading: os.heading ?? null,
      velocity: os.velocity ?? null,
      verticalRate: os.verticalRate ?? null,
      squawk: os.squawk ?? null,
      typeCode: null,
      typeLabel: null,
      kind,
      isMilitary: null,
      isHelicopter,
      lastSeenSeconds: null,
      engines: engineDB ?? null,
      icaoAircraftClass: aircraftclassDB ?? null,
      manufacturerIcao: manufacturerIcaoDB ?? null,
      manufacturerName: manufacturerNameDB ?? null,
      model: modelDB ?? null,
      operator: operatorDB ?? null,
      owner: ownerDB ?? null,
      typecode: typecodeDB ?? null,
      source: 'opensky',
    });
  }

  return Array.from(byIcao.values());
}