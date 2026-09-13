import * as satellite from 'satellite.js';

/**
 * Champs OMM (Orbit Mean-Elements Message) tels que renvoyés par le backend,
 * repris du payload Celestrak (voir la conversation d'origine pour le mapping
 * f.OBJECT_NAME -> name, f.NORAD_CAT_ID -> id, etc.)
 */
export interface CelestrakOmm {
  name: string;
  id: number;               // NORAD_CAT_ID
  objectId: string;         // OBJECT_ID, ex: "1998-067A"
  launchDate: string;
  epoch: string;            // ISO 8601, ex: "2024-06-01T12:34:56.789504"
  meanMotion: number;       // revs/day
  eccentricity: number;
  inclination: number;      // degrés
  raOfAscNode: number;      // degrés
  argOfPericenter: number;  // degrés
  meanAnomaly: number;      // degrés
  ephemerisType: number;
  classificationType: string; // 'U' | 'C' | 'S'
  elementSetNo: number;
  revAtEpoch: number;
  bstar: number;
  meanMotionDot: number;    // déjà en unités TLE (ndot/2), pas besoin de diviser à nouveau
  meanMotionDdot: number;
}

export interface SatellitePosition {
  id: number;
  name: string;
  longitude: number;
  latitude: number;
  altitudeKm: number;
  velocityKmS: number;
}

/* ------------------------------------------------------------------ */
/* Formatage bas niveau au format TLE (fixed-width, tel que défini par */
/* NORAD / Space-Track). Chaque helper produit exactement le nombre de */
/* caractères attendu par la colonne correspondante.                   */
/* ------------------------------------------------------------------ */

// Nombre décimal positif, largeur fixe "III.FFFF" (pas de signe : angles 0-360, mean motion, etc.)
function fixedDecimal(value: number, intDigits: number, decDigits: number): string {
  const width = intDigits + 1 + decDigits;
  return value.toFixed(decDigits).padStart(width, ' ');
}

// Eccentricité: pas de point décimal, 7 chiffres, ex 0.0007833 -> "0007833"
function eccentricityField(value: number): string {
  const digits = Math.round(value * 1e7);
  return String(digits).padStart(7, '0');
}

// Première dérivée du mean motion: signe + '.' + 8 décimales, ex 0.00001234 -> " .00001234"
function firstDerivativeField(value: number): string {
  const sign = value < 0 ? '-' : ' ';
  const abs = Math.abs(value);
  const digits = abs.toFixed(8).split('.')[1]; // 8 décimales, sans le "0."
  return `${sign}.${digits}`;
}

// Notation exponentielle TLE: signe + 5 chiffres de mantisse + signe exposant + 1 chiffre
// V = sign * 0.MMMMM * 10^E   (utilisé pour bstar et mean-motion-ddot)
function exponentialField(value: number): string {
  if (value === 0) return ' 00000-0';
  const sign = value < 0 ? '-' : ' ';
  const abs = Math.abs(value);
  let exponent = Math.floor(Math.log10(abs)) + 1;
  let mantissa = abs / Math.pow(10, exponent);
  let mantissaDigits = Math.round(mantissa * 1e5);
  if (mantissaDigits >= 100000) {
    // arrondi qui déborde (0.999995 -> 1.00000) : on décale l'exposant
    mantissaDigits = Math.round(mantissaDigits / 10);
    exponent += 1;
  }
  const mantissaStr = String(mantissaDigits).padStart(5, '0');
  const expSign = exponent < 0 ? '-' : '+';
  return `${sign}${mantissaStr}${expSign}${Math.abs(exponent)}`;
}

function epochToTleEpoch(epochIso: string): string {
  const iso = epochIso.endsWith('Z') ? epochIso : `${epochIso}Z`;
  const d = new Date(iso);
  const year = d.getUTCFullYear();
  const year2 = String(year % 100).padStart(2, '0');
  const startOfYear = Date.UTC(year, 0, 1, 0, 0, 0, 0);
  const dayOfYearFrac = (d.getTime() - startOfYear) / 86400000 + 1;
  const [intPart, fracPart] = dayOfYearFrac.toFixed(8).split('.');
  return `${year2}${intPart.padStart(3, '0')}.${fracPart}`;
}

// Somme des chiffres mod 10 ('-' compte pour 1, tout le reste pour 0)
function checksum(lineWithoutChecksum: string): string {
  let sum = 0;
  for (const c of lineWithoutChecksum) {
    if (c >= '0' && c <= '9') sum += Number(c);
    else if (c === '-') sum += 1;
  }
  return String(sum % 10);
}

/**
 * Reconstruit une paire de lignes TLE valides (avec checksum) à partir des
 * champs OMM. Les champs OMM de Celestrak sont numériquement équivalents aux
 * champs TLE (conversion sans perte), donc on ne fait que du formatage.
 *
 * Limite connue: le schéma "Alpha-5" pour NORAD_CAT_ID >= 100000 n'est pas
 * géré ici (rare en pratique pour l'instant) — on retombe sur un padding
 * numérique classique dans ce cas, ce qui produira un satnum tronqué.
 */
export function ommToTleLines(sat: CelestrakOmm): [string, string] {
  const satNum = String(sat.id).padStart(5, '0').slice(-5);

  const [yearPart, designatorRest] = (sat.objectId || '').split('-');
  const intlYear = (yearPart || '').slice(-2).padStart(2, '0');
  const launchNum = (designatorRest || '').slice(0, 3).padStart(3, '0');
  const piece = (designatorRest || '').slice(3, 6).padEnd(3, ' ');

  const classification = (sat.classificationType || 'U').charAt(0) || 'U';

  const line1Body = [
    '1 ',
    satNum,
    classification,
    ' ',
    intlYear,
    launchNum,
    piece,
    ' ',
    epochToTleEpoch(sat.epoch),
    ' ',
    firstDerivativeField(sat.meanMotionDot ?? 0),
    ' ',
    exponentialField(sat.meanMotionDdot ?? 0),
    ' ',
    exponentialField(sat.bstar ?? 0),
    ' ',
    String(sat.ephemerisType ?? 0),
    ' ',
    String(sat.elementSetNo ?? 0).padStart(4, ' '),
  ].join('');
  const line1 = line1Body + checksum(line1Body);

  const line2Body = [
    '2 ',
    satNum,
    ' ',
    fixedDecimal(((sat.inclination % 360) + 360) % 360, 3, 4),
    ' ',
    fixedDecimal(((sat.raOfAscNode % 360) + 360) % 360, 3, 4),
    ' ',
    eccentricityField(sat.eccentricity),
    ' ',
    fixedDecimal(((sat.argOfPericenter % 360) + 360) % 360, 3, 4),
    ' ',
    fixedDecimal(((sat.meanAnomaly % 360) + 360) % 360, 3, 4),
    ' ',
    fixedDecimal(sat.meanMotion, 2, 8),
    String(sat.revAtEpoch ?? 0).padStart(5, '0'),
  ].join('');
  const line2 = line2Body + checksum(line2Body);

  return [line1, line2];
}

export interface SatRecEntry {
  satrec: satellite.SatRec;
  name: string;
  id: number;
  epoch: string; // pour détecter un changement d'éléments orbitaux
}

/**
 * Construit (ou réutilise) un satrec par satellite. Ne recalcule les lignes
 * TLE que si l'epoch a changé depuis le dernier passage, pour éviter de
 * reparser inutilement à chaque tick d'animation.
 */
export function buildSatrecCache(
  omms: CelestrakOmm[],
  previous: Map<number, SatRecEntry>
): Map<number, SatRecEntry> {
  const next = new Map<number, SatRecEntry>();
  for (const sat of omms) {
    const existing = previous.get(sat.id);
    if (existing && existing.epoch === sat.epoch) {
      next.set(sat.id, existing);
      continue;
    }
    try {
      const [l1, l2] = ommToTleLines(sat);
      if (l1.includes('NaN') || l2.includes('NaN')) {
        console.warn(`[satelliteEphemeris] Champs OMM manquants/invalides pour ${sat.name} (${sat.id}), satellite ignoré`);
        continue;
      }
      const satrec = satellite.twoline2satrec(l1, l2);
      if (satrec.error) {
        console.warn(`[satelliteEphemeris] SGP4 init error ${satrec.error} pour ${sat.name} (${sat.id}), satellite ignoré`);
        continue;
      }
      next.set(sat.id, { satrec, name: sat.name, id: sat.id, epoch: sat.epoch });
    } catch (err) {
      console.warn(`[satelliteEphemeris] Impossible de construire le satrec pour ${sat.name} (${sat.id})`, err);
    }
  }
  return next;
}

/** Propage un satrec à une date donnée et renvoie sa position géodésique. */
export function propagateOne(entry: SatRecEntry, date: Date): SatellitePosition | null {
  let pv;
  try {
    pv = satellite.propagate(entry.satrec, date);
  } catch (err) {
    console.warn(`[satelliteEphemeris] SGP4 a levé une exception pour ${entry.name} (${entry.id})`, err);
    return null;
  }

  // satellite.js peut renvoyer null/undefined directement (satrec invalide),
  // ou un objet { position: false, velocity: false } (satellite décayé / erreur SGP4).
  if (!pv) return null;
  const positionEci = pv.position;
  const velocityEci = pv.velocity;
  if (!positionEci || typeof positionEci === 'boolean') return null;

  const gmst = satellite.gstime(date);
  const geo = satellite.eciToGeodetic(positionEci, gmst);

  let velocityKmS = 0;
  if (velocityEci && typeof velocityEci !== 'boolean') {
    velocityKmS = Math.sqrt(velocityEci.x ** 2 + velocityEci.y ** 2 + velocityEci.z ** 2);
  }

  return {
    id: entry.id,
    name: entry.name,
    longitude: satellite.degreesLong(geo.longitude),
    latitude: satellite.degreesLat(geo.latitude),
    altitudeKm: geo.height,
    velocityKmS,
  };
}

/**
 * Calcule la trace au sol (ground track) d'un satellite sur une fenêtre
 * temporelle, découpée en plusieurs segments à chaque franchissement de
 * l'antiméridien (±180°) pour éviter une ligne qui traverse toute la carte.
 */
export function computeGroundTrack(
  entry: SatRecEntry,
  centerDate: Date,
  pastMinutes: number,
  futureMinutes: number,
  stepSeconds: number
): number[][][] {
  const points: [number, number][] = [];
  const startMs = centerDate.getTime() - pastMinutes * 60_000;
  const endMs = centerDate.getTime() + futureMinutes * 60_000;
  for (let t = startMs; t <= endMs; t += stepSeconds * 1000) {
    const pos = propagateOne(entry, new Date(t));
    if (pos) points.push([pos.longitude, pos.latitude]);
  }

  const segments: number[][][] = [];
  let current: number[][] = [];
  for (let i = 0; i < points.length; i++) {
    if (i > 0 && Math.abs(points[i][0] - points[i - 1][0]) > 180) {
      if (current.length > 1) segments.push(current);
      current = [];
    }
    current.push(points[i]);
  }
  if (current.length > 1) segments.push(current);
  return segments;
}