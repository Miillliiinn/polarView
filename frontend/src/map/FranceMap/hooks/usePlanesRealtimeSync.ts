import { useEffect, type RefObject } from 'react';
import maplibregl from 'maplibre-gl';
import { globalCache } from '../../../api/classCache';
import { toGeoJsonFeatureCollection } from '../../../api/geoJsonConvertion';

export function usePlanesRealtimeSync(
  mapRef: RefObject<maplibregl.Map | null>, intervalMs = 100) {
  useEffect(() => {
    const interval = setInterval(() => {
      const map = mapRef.current;
      if (!map || !map.isStyleLoaded()) return;

      const planesSource = map.getSource('planes') as maplibregl.GeoJSONSource | undefined;
      if (!planesSource) return;

      const planes = globalCache.getOpCache();
      const planesGeojson = toGeoJsonFeatureCollection(
        planes.map((p: any) => ({
          long: p.longitude,
          lat: p.latitude,
          properties: {
            icao24: p.icao24,
            callsign: p.callsign,
            heading: p.heading ?? 0,
            altitude: p.altitude ?? 0
          }
        }))
      );
      planesSource.setData(planesGeojson);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [mapRef, intervalMs]);
}
