function extractDirectionLabel(dir: string): string {
  const parenIndex = dir.indexOf('(');
  const beforeParens = parenIndex !== -1 ? dir.slice(0, parenIndex) : dir;
  return beforeParens.trim();
}

function normalizeStationName(name: string): string {
  return name
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // enlève les accents
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}

export function findStationByDirection(dir: string, garesIndex: Map<string, any>): any | null {
  const target = normalizeStationName(extractDirectionLabel(dir));
  if (garesIndex.has(target)) return garesIndex.get(target);
  for (const [key, gare] of garesIndex)
  {
    if (target.includes(key) || key.includes(target)) return gare;
  }
  return null;
}