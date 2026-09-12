import { promises as fs } from 'fs';
import path from 'path';

const CACHE_DIR = path.join(process.cwd(), '.cache', 'satellite');
const CACHE_FILE = path.join(CACHE_DIR, 'celestrack-cache.json');
const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

interface CacheShape
{
  fetchedAt: string;
  data: any[];
}

async function readCelestrackCache(): Promise<CacheShape | null>
{
  try
  {
    const raw = await fs.readFile(CACHE_FILE, 'utf-8');
    return JSON.parse(raw) as CacheShape;
  }
  catch (e)
  {
    return null;
  }
}

async function writeCelestrackCache(data: any[]): Promise<void> {
  await fs.mkdir(CACHE_DIR, { recursive: true });
  const payload: CacheShape = {
    fetchedAt: new Date().toISOString(),
    data,
  };
  await fs.writeFile(CACHE_FILE, JSON.stringify(payload), 'utf-8');
}

function isCacheFresh(cache: CacheShape): boolean
{
    const age = Date.now() - new Date(cache.fetchedAt).getTime();
    return age < TWO_HOURS_MS;
}

export async function fetchCestrack()
{
    const cached = await readCelestrackCache();
    if (cached && isCacheFresh(cached))
    {
        console.log(`🛰️  Celestrak: cache encore valide (récupéré le ${cached.fetchedAt}), pas de fetch.`);
        return cached.data;
    }

    try {
        const url = "https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=JSON";
        const USER_AGENT = 'TrackerView (+https://github.com/miillliiinn)';
        const response = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT },
        });

        if (!response.ok) {
        const body = await response.text().catch(() => '');
        console.error(`Celestrak API status: ${response.status} ${response.statusText} - ${body}`);
        if (cached) {
            console.log("↩️  Fallback sur le cache existant.");
            return cached.data;
        }
        return [];
        }

        const raw = await response.json();
        const mapped = raw.map((f: any) => ({
        name: f.OBJECT_NAME,
        id: f.NORAD_CAT_ID,
        objectId: f.OBJECT_ID,
        owner: f.OWNER,
        launchDate: f.LAUNCH_DATE,
        epoch: f.EPOCH,
        meanMotion: f.MEAN_MOTION,
        eccentricity: f.ECCENTRICITY,
        inclination: f.INCLINATION,
        raOfAscNode: f.RA_OF_ASC_NODE,
        argOfPericenter: f.ARG_OF_PERICENTER,
        meanAnomaly: f.MEAN_ANOMALY,
        ephemerisType: f.EPHEMERIS_TYPE,
        classificationType: f.CLASSIFICATION_TYPE,
        elementSetNo: f.ELEMENT_SET_NO,
        revAtEpoch: f.REV_AT_EPOCH,
        bstar: f.BSTAR,
        meanMotionDot: f.MEAN_MOTION_DOT,
        meanMotionDdot: f.MEAN_MOTION_DDOT,
        raw: f,
        }));

        await writeCelestrackCache(mapped);
        console.log("🛰️  Celestrak API request 🛰️");
        return mapped;
    }
    catch (e)
    {
        console.error(`Error 'callCelestrackAPI' : `, e);
        if (cached) return cached.data;
        return [];
    }
}