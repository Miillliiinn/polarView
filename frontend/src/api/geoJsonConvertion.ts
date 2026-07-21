export function toGeoJsonFeature(
  long: number,
  lat: number,
  properties: Record<string, any> = {}
): GeoJSON.Feature {
  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [long, lat],
    },
    properties,
  };
}

export function toGeoJsonFeatureCollection(
  items: Array<{ long: number; lat: number; properties?: Record<string, any> }>
): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: items
      .filter(item => item.long != null && item.lat != null)
      .map(item => toGeoJsonFeature(item.long, item.lat, item.properties)),
  };
}