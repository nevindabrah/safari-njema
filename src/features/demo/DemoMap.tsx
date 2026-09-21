// The demo's stand-in for the Google map: a sketch of Kenya with numbered pins and a route line, all in one SVG.
// Exists so pins, order and highlighting can be shown with no Maps key. Longitude is x and latitude is y, flipped.
import type { StopRow } from '../../lib/types'
import type { PickedPlace } from '../trip/usePlaceSearch'
import { CITY_LABELS, KENYA, LAKE_TURKANA, LAKE_VICTORIA, OCEAN } from './kenyaOutline'

// SVG y grows downwards, so latitude is negated. This close to the equator one degree is about the same both ways.
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
  // A city label is hidden when a pin sits on top of it.
  const labels = CITY_LABELS.filter((city) => !stops.some((s) => Math.abs(Number(s.place.lat) - city.lat) < 0.8 && Math.abs(Number(s.place.lng) - city.lng) < 1.6))
  const route = stops.map((s) => `${Number(s.place.lng)},${-Number(s.place.lat)}`).join(' ')

  return (
    <div className="absolute inset-0" style={{ background: 'var(--map-ground)' }}>
      {/* The view box leaves room at the top for the search box and at the bottom for the note. */}
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

        {stops.map((stop, index) => {
          const highlighted = stop.id === highlightedId
          return (
            <g
              key={stop.id}
              role="button"
              tabIndex={0}
              aria-label={`Stop ${index + 1}, ${stop.place.name}`}
              onClick={() => onPinClick(stop.id)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onPinClick(stop.id) }}
              style={{ cursor: 'pointer' }}
            >
              <title>{stop.place.name}</title>
              <circle cx={Number(stop.place.lng)} cy={-Number(stop.place.lat)} r={highlighted ? 0.46 : 0.38} fill={highlighted ? 'var(--primary)' : 'var(--accent)'} stroke="var(--surface)" strokeWidth="0.09" />
              <text x={Number(stop.place.lng)} y={-Number(stop.place.lat) + 0.13} fontSize="0.38" fontWeight="800" textAnchor="middle" fill={highlighted ? 'var(--on-primary)' : 'var(--on-accent)'}>{index + 1}</text>
            </g>
          )
        })}

        {preview && <circle cx={preview.lng} cy={-preview.lat} r="0.26" fill="var(--hero)" stroke="var(--surface)" strokeWidth="0.09" className="animate-pulse" />}
      </svg>
      <p className="absolute bottom-3 left-4 right-4 text-xs text-muted text-center">
        Sketch map for the demo. With a Google Maps key this panel is the real map with live place search.
      </p>
    </div>
  )
}
