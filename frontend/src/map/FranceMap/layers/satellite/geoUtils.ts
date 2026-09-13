// Utilitaires géographiques purs : aucune dépendance à maplibre-gl ni au DOM,
// pour pouvoir être importés à la fois depuis le thread principal et depuis
// un Web Worker.

export interface ViewportBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export function normalizeLon(lon: number): number {
  return ((lon + 180) % 360 + 360) % 360 - 180;
}

/**
 * Teste si (lon, lat) tombe dans les limites d'un viewport, en gérant le cas
 * où celui-ci traverse l'antiméridien (west > east après normalisation).
 * La marge visuelle (VIEWPORT_MARGIN_DEG) est déjà appliquée en amont, lors
 * de la construction du ViewportBounds à partir de map.getBounds().
 */
export function isInViewport(lon: number, lat: number, bounds: ViewportBounds): boolean {
  if (lat < bounds.south || lat > bounds.north) return false;

  const west = normalizeLon(bounds.west);
  const east = normalizeLon(bounds.east);
  const lonN = normalizeLon(lon);

  if (west <= east) return lonN >= west && lonN <= east;
  return lonN >= west || lonN <= east;
}