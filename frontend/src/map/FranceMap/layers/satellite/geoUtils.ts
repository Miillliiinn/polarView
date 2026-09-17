export interface ViewportBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export function normalizeLon(lon: number): number {
  return ((lon + 180) % 360 + 360) % 360 - 180;
}

export function isInViewport(lon: number, lat: number, bounds: ViewportBounds): boolean {
  if (lat < bounds.south || lat > bounds.north) return false;

  const west = normalizeLon(bounds.west);
  const east = normalizeLon(bounds.east);
  const lonN = normalizeLon(lon);

  if (west <= east) return lonN >= west && lonN <= east;
  return lonN >= west || lonN <= east;
}