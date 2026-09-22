// The demo's stand-in for the Google map: a sketch of Kenya with numbered pins and a route line, all in one SVG.
// Exists so pins, order and highlighting can be shown with no Maps key. Longitude is x and latitude is y, flipped.
import { useState } from 'react'
import type { StopRow } from '../../lib/types'
import type { PickedPlace } from '../trip/usePlaceSearch'
import { spreadPins } from '../../lib/spreadPins'
import { CITY_LABELS, KENYA, LAKE_TURKANA, LAKE_VICTORIA, OCEAN } from './kenyaOutline'
import { isDemoMode } from './demoMode'

function path(points: Array<[number, number]>): string {
  return points.map(([lng, lat], i) => `${i === 0 ? 'M' : 'L'}${lng} ${-lat}`).join(' ') + ' Z'
}

interface DemoMapProps {
  stops: StopRow[]
  preview: PickedPlace | null
  highlightedId: string | null
  onPinClick: (stopId: string) => void
}

export function DemoMap({ stops, preview, highlightedId, onPinClick }: DemoMapProps) {
  const [focusedId, setFocusedId] = useState<string | null>(null)
  const labels = CITY_LABELS.filter((city) => !stops.some((s) => Math.abs(Number(s.place.lat) - city.lat) < 0.8 && Math.abs(Number(s.place.lng) - city.lng) < 1.6))
  const real = stops.map((s) => ({ x: Number(s.place.lng), y: -Number(s.place.lat) }))
  const shown = spreadPins(real, 0.84)
  const route = shown.map((p) => `${p.x},${p.y}`).join(' ')
  const drawOrder = stops.map((_, i) => i).sort((a, b) => Number(stops[a].id === highlightedId) - Number(stops[b].id === highlightedId))

  return (
    <div className="absolute inset-0" style={{ background: 'var(--map-ground)' }}>
      <svg className="absolute inset-0 w-full h-full" viewBox="32.6 -7.2 10.4 13.6" preserveAspectRatio="xMidYMid meet" role="group" aria-label="Sketch map of Kenya with your stops">
        <path d={path(OCEAN)} fill="var(--map-water)" />
        <path d={path(LAKE_VICTORIA)} fill="var(--map-water)" />
        <path d={path(KENYA)} fill="var(--map-land)" stroke="var(--map-border)" strokeWidth="0.06" strokeLinejoin="round" />
        <path d={path(LAKE_TURKANA)} fill="var(--map-water)" />

        {labels.map((city) => (
          <g key={city.name} aria-hidden="true">
            <circle cx={city.lng} cy={-city.lat} r="0.07" fill="var(--muted)" />
            <text x={city.lng + 0.16} y={-city.lat + 0.1} fontSize="0.3" fill="var(--muted)" fontWeight="600">{city.name}</text>
          </g>
        ))}

        {stops.length > 1 && <polyline points={route} fill="none" stroke="var(--accent)" strokeWidth="0.08" strokeLinejoin="round" strokeLinecap="round" strokeDasharray="0.02 0.2" />}

        {stops.map((stop, i) => Math.hypot(shown[i].x - real[i].x, shown[i].y - real[i].y) > 0.05 && (
          <g key={`anchor-${stop.id}`} aria-hidden="true">
            <line x1={real[i].x} y1={real[i].y} x2={shown[i].x} y2={shown[i].y} stroke="var(--muted)" strokeWidth="0.04" />
            <circle cx={real[i].x} cy={real[i].y} r="0.08" fill="var(--muted)" />
          </g>
        ))}

        {drawOrder.map((i) => {
          const stop = stops[i]
          const highlighted = stop.id === highlightedId
          return (
            <g
              key={stop.id}
              role="button"
              tabIndex={0}
              aria-label={`Stop ${i + 1}, ${stop.place.name}`}
              aria-pressed={highlighted}
              onClick={() => onPinClick(stop.id)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPinClick(stop.id) } }}
              onFocus={() => setFocusedId(stop.id)}
              onBlur={() => setFocusedId(null)}
              style={{ cursor: 'pointer', outline: 'none' }}
            >
              <title>{stop.place.name}</title>
              <circle cx={shown[i].x} cy={shown[i].y} r="0.68" fill="transparent" stroke={focusedId === stop.id ? 'var(--text)' : 'none'} strokeWidth="0.06" strokeDasharray="0.14 0.1" />
              <circle cx={shown[i].x} cy={shown[i].y} r={highlighted ? 0.46 : 0.38} fill={highlighted ? 'var(--primary)' : 'var(--accent)'} stroke="var(--surface)" strokeWidth="0.09" />
              <text x={shown[i].x} y={shown[i].y + 0.13} fontSize="0.38" fontWeight="800" textAnchor="middle" fill={highlighted ? 'var(--on-primary)' : 'var(--on-accent)'} style={{ pointerEvents: 'none' }}>{i + 1}</text>
              {highlighted && (
                <text x={shown[i].x} y={shown[i].y - 0.68} fontSize="0.36" fontWeight="800" textAnchor="middle" fill="var(--text)" stroke="var(--surface)" strokeWidth="0.14" paintOrder="stroke" style={{ pointerEvents: 'none' }}>{stop.place.name}</text>
              )}
            </g>
          )
        })}

        {preview && <circle cx={preview.lng} cy={-preview.lat} r="0.26" fill="var(--hero)" stroke="var(--surface)" strokeWidth="0.09" className="animate-pulse" style={{ pointerEvents: 'none' }} />}
      </svg>
      <p className="absolute bottom-3 left-4 right-4 text-xs text-muted text-center pointer-events-none">
        {isDemoMode ? 'A sketch for the demo. The full app shows Google Maps here, with live search of every place in Kenya.' : 'A sketch of Kenya. Pick places from the catalogue. With a Google Maps key, the live map and search appear here.'}
      </p>
    </div>
  )
}
