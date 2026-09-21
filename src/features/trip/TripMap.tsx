// The Google map with numbered pins for each stop and a route line joining them.
// Exists as the one component that touches the map provider, so it can be swapped later.
import { useEffect } from 'react'
import { AdvancedMarker, Map, useMap } from '@vis.gl/react-google-maps'
import type { TripStop } from '../../lib/types'
import type { PickedPlace } from './usePlaceSearch'

const KENYA_CENTER = { lat: 0.2, lng: 37.9 }

interface TripMapProps {
  stops: TripStop[]
  preview: PickedPlace | null
  highlightedId: string | null
  onPinClick: (stopId: string) => void
}

// Pans the camera whenever the target changes. Kept separate because useMap needs to be inside <Map>.
function CameraFollow({ target }: { target: { lat: number; lng: number } | null }) {
  const map = useMap()
  useEffect(() => {
    if (!map || !target) return
    map.panTo(target)
    if ((map.getZoom() ?? 0) < 11) map.setZoom(12)
  }, [map, target])
  return null
}

// Draws one polyline through the stops in order.
function RouteLine({ stops }: { stops: TripStop[] }) {
  const map = useMap()
  useEffect(() => {
    if (!map || stops.length < 2) return
    const line = new google.maps.Polyline({
      path: stops.map((s) => ({ lat: Number(s.place.lat), lng: Number(s.place.lng) })),
      strokeColor: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(),
      strokeOpacity: 0.8,
      strokeWeight: 3,
      map,
    })
    return () => line.setMap(null)
  }, [map, stops])
  return null
}

export function TripMap({ stops, preview, highlightedId, onPinClick }: TripMapProps) {
  const mapId = import.meta.env.VITE_GOOGLE_MAP_ID as string | undefined
  const target = preview
    ? { lat: preview.lat, lng: preview.lng }
    : highlightedId
      ? (() => {
          const s = stops.find((x) => x.id === highlightedId)
          return s ? { lat: Number(s.place.lat), lng: Number(s.place.lng) } : null
        })()
      : null

  return (
    <Map
      mapId={mapId}
      defaultCenter={KENYA_CENTER}
      defaultZoom={6}
      gestureHandling="greedy"
      disableDefaultUI
      colorScheme="FOLLOW_SYSTEM"
      style={{ width: '100%', height: '100%' }}
    >
      <CameraFollow target={target} />
      <RouteLine stops={stops} />
      {stops.map((stop, index) => (
        <AdvancedMarker
          key={stop.id}
          position={{ lat: Number(stop.place.lat), lng: Number(stop.place.lng) }}
          title={stop.place.name}
          onClick={() => onPinClick(stop.id)}
          zIndex={stop.id === highlightedId ? 10 : 1}
        >
          <div
            className="w-9 h-9 rounded-pill flex items-center justify-center font-display font-extrabold text-sm shadow-lift"
            style={{
              background: stop.id === highlightedId ? 'var(--primary)' : 'var(--accent)',
              color: stop.id === highlightedId ? 'var(--on-primary)' : 'var(--on-accent)',
              border: '3px solid var(--surface)',
            }}
          >
            {index + 1}
          </div>
        </AdvancedMarker>
      ))}
      {preview && (
        <AdvancedMarker position={{ lat: preview.lat, lng: preview.lng }} title={preview.name} zIndex={20}>
          <div className="w-5 h-5 rounded-pill animate-pulse" style={{ background: 'var(--hero)', border: '3px solid var(--surface)' }} />
        </AdvancedMarker>
      )}
    </Map>
  )
}
