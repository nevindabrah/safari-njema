// A very simple stand-in for the Google map: numbered pins placed by latitude and longitude, joined by a line.
// Exists so pins, order and highlighting can be tried in test mode with no Google Maps key. It is not a real map.
import type { StopRow } from '../../lib/types'
import type { PickedPlace } from '../trip/usePlaceSearch'

// A box around Kenya. Positions are percentages inside it.
const WEST = 33.5
const EAST = 42.2
const NORTH = 5.3
const SOUTH = -5.0

function toPercent(lat: number, lng: number) {
  return { x: ((lng - WEST) / (EAST - WEST)) * 100, y: ((NORTH - lat) / (NORTH - SOUTH)) * 100 }
}

interface TestMapProps {
  stops: StopRow[]
  preview: PickedPlace | null
  highlightedId: string | null
  onPinClick: (stopId: string) => void
}

export function TestMap({ stops, preview, highlightedId, onPinClick }: TestMapProps) {
  const points = stops.map((s) => toPercent(Number(s.place.lat), Number(s.place.lng)))
  const previewPoint = preview ? toPercent(preview.lat, preview.lng) : null

  return (
    <div className="absolute inset-0 bg-tint-2">
      <div className="kanga-dots absolute inset-0 opacity-20 pointer-events-none" aria-hidden="true" />
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {points.length > 1 && (
          <polyline points={points.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke="var(--accent)" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
        )}
      </svg>
      {stops.map((stop, index) => (
        <button
          key={stop.id}
          type="button"
          onClick={() => onPinClick(stop.id)}
          title={stop.place.name}
          aria-label={`Stop ${index + 1}, ${stop.place.name}`}
          className="absolute w-9 h-9 -ml-[18px] -mt-[18px] rounded-pill flex items-center justify-center font-display font-extrabold text-sm shadow-lift cursor-pointer"
          style={{
            left: `${points[index].x}%`,
            top: `${points[index].y}%`,
            zIndex: stop.id === highlightedId ? 10 : 1,
            background: stop.id === highlightedId ? 'var(--primary)' : 'var(--accent)',
            color: stop.id === highlightedId ? 'var(--on-primary)' : 'var(--on-accent)',
            border: '3px solid var(--surface)',
          }}
        >
          {index + 1}
        </button>
      ))}
      {previewPoint && (
        <div className="absolute w-5 h-5 -ml-[10px] -mt-[10px] rounded-pill animate-pulse" style={{ left: `${previewPoint.x}%`, top: `${previewPoint.y}%`, background: 'var(--hero)', border: '3px solid var(--surface)', zIndex: 20 }} />
      )}
      <p className="absolute bottom-3 left-4 right-4 text-xs text-muted text-center">
        Preview map for test mode. Pins sit roughly where they are in Kenya. The Google map appears once a Maps key is added.
      </p>
    </div>
  )
}
