// The numbered stop pins drawn with Google's older marker, used only when no Map ID is set, because the newer marker refuses to draw without one.
// Exists so a missing Map ID costs the custom pin design rather than the whole map, which Google otherwise covers with an error panel.
import { useEffect, useRef } from 'react'
import { useMap } from '@vis.gl/react-google-maps'
import type { TripStop } from '../../lib/types'
import type { PickedPlace } from './usePlaceSearch'

interface ClassicPinsProps {
  stops: TripStop[]
  preview: PickedPlace | null
  highlightedId: string | null
  onPinClick: (stopId: string) => void
}

function token(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

export function ClassicPins({ stops, preview, highlightedId, onPinClick }: ClassicPinsProps) {
  const map = useMap()
  const click = useRef(onPinClick)
  click.current = onPinClick

  useEffect(() => {
    if (!map) return
    const surface = token('--surface')
    const markers = stops.map((stop, index) => {
      const chosen = stop.id === highlightedId
      const marker = new google.maps.Marker({
        map,
        position: { lat: Number(stop.place.lat), lng: Number(stop.place.lng) },
        title: stop.place.name,
        label: { text: String(index + 1), color: token(chosen ? '--on-primary' : '--on-accent'), fontWeight: '800', fontSize: '13px' },
        icon: { path: google.maps.SymbolPath.CIRCLE, scale: 15, fillColor: token(chosen ? '--primary' : '--accent'), fillOpacity: 1, strokeColor: surface, strokeWeight: 3 },
        zIndex: chosen ? 10 : 1,
      })
      marker.addListener('click', () => click.current(stop.id))
      return marker
    })
    if (preview) {
      markers.push(new google.maps.Marker({
        map,
        position: { lat: preview.lat, lng: preview.lng },
        title: preview.name,
        icon: { path: google.maps.SymbolPath.CIRCLE, scale: 10, fillColor: token('--hero'), fillOpacity: 1, strokeColor: surface, strokeWeight: 3 },
        zIndex: 20,
      }))
    }
    return () => markers.forEach((marker) => marker.setMap(null))
  }, [map, stops, preview, highlightedId])

  return null
}
