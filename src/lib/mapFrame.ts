// Works out where the map should sit to show every stop: one point becomes a centre and a zoom, several become a box to fit.
// Exists so the recentre button's maths is a pure function with tests, and the map component only calls the map.
export interface MapPoint {
  lat: number
  lng: number
}

export interface MapBox {
  north: number
  south: number
  east: number
  west: number
}

export type MapFrame = { kind: 'point'; center: MapPoint; zoom: number } | { kind: 'box'; box: MapBox }

export function frameFor(points: MapPoint[], home: MapPoint, homeZoom = 6, pointZoom = 13): MapFrame {
  const real = points.filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng))
  if (real.length === 0) return { kind: 'point', center: home, zoom: homeZoom }
  if (real.length === 1) return { kind: 'point', center: real[0], zoom: pointZoom }
  const lats = real.map((p) => p.lat)
  const lngs = real.map((p) => p.lng)
  const box = { north: Math.max(...lats), south: Math.min(...lats), east: Math.max(...lngs), west: Math.min(...lngs) }
  if (box.north - box.south < 0.01 && box.east - box.west < 0.01) {
    return { kind: 'point', center: { lat: (box.north + box.south) / 2, lng: (box.east + box.west) / 2 }, zoom: pointZoom }
  }
  return { kind: 'box', box }
}

export function nextZoom(current: number | undefined, step: number, min = 4, max = 19): number {
  return Math.min(max, Math.max(min, (current ?? 6) + step))
}
