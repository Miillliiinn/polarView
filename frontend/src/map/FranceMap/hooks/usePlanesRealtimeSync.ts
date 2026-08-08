import { useEffect, useRef, type RefObject } from 'react';
import maplibregl from 'maplibre-gl';
import { globalCache } from '../../../api/classCache';
import { toGeoJsonFeature } from '../../../api/geoJsonConvertion';

const ALTITUDE_MIN = 1000;
const KM_PER_DEGREE_LAT = 111.32;

interface PlaneAnchor
{
  icao24: string;
  callsign?: string;
  lat: number;
  long: number;
  heading: number;
  velocity: number; 
  altitude: number; 
  capturedAt: number;
}

export function usePlanesRealtimeSync(mapRef: RefObject<maplibregl.Map | null>, renderIntervalMs = 200)
{
  const anchorsRef = useRef(new Map<string, PlaneAnchor>());
  useEffect(() => {
    const interval = setInterval(() => {
      const planes = globalCache.getOpCache();
      if (!planes) return;

      const anchors = anchorsRef.current;
      const seenIds = new Set<string>();

      for (const p of planes) {
        if (!p?.icao24 || p.latitude == null || p.longitude == null) continue;
        seenIds.add(p.icao24);

        const existing = anchors.get(p.icao24);
        const positionChanged =
          !existing || existing.lat !== p.latitude || existing.long !== p.longitude;

        if (positionChanged) {
          anchors.set(p.icao24, {
            icao24: p.icao24,
            callsign: p.callsign,
            lat: p.latitude,
            long: p.longitude,
            heading: p.heading ?? 0,
            velocity: p.velocity ?? 0,
            altitude: p.altitude ?? 0,
            capturedAt: Date.now()
          });
        }
      }

      for (const id of anchors.keys())
      {
        if (!seenIds.has(id)) anchors.delete(id);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const map = mapRef.current;
      if (!map || !map.isStyleLoaded()) return;

      const source = map.getSource('planes') as maplibregl.GeoJSONSource | undefined;
      if (!source) return;

      const now = Date.now();

      const features = Array.from(anchorsRef.current.values()).map((p) => {
        let lat = p.lat;
        let long = p.long;

        if (p.altitude > ALTITUDE_MIN && p.velocity > 0)
        {
          const elapsedSeconds = (now - p.capturedAt) / 1000;
          const distanceKm = (p.velocity * elapsedSeconds) / 1000;
          const bearingRad = (p.heading * Math.PI) / 180;

          const dLat = (distanceKm * Math.cos(bearingRad)) / KM_PER_DEGREE_LAT;
          const dLong =
            (distanceKm * Math.sin(bearingRad)) /
            (KM_PER_DEGREE_LAT * Math.cos((p.lat * Math.PI) / 180));

          lat = p.lat + dLat;
          long = p.long + dLong;
        }

        return toGeoJsonFeature(long, lat, {
          icao24: p.icao24,
          callsign: p.callsign,
          heading: p.heading,
          altitude: p.altitude
        });
      });

      source.setData({ type: 'FeatureCollection', features });
    }, renderIntervalMs);

    return () => clearInterval(interval);
  }, [mapRef, renderIntervalMs]);
}