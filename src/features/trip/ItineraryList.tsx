// The itinerary: trip progress, then the stops grouped by day in visiting order.
// Exists as the home screen's main content. Each row is a StopCard.
import { ProgressBar } from '../../components/ProgressBar'
import { Icon } from '../../components/icons'
import { dayNumber } from '../../lib/orderStops'
import type { StopRow, Trip } from '../../lib/types'
import { StopCard } from './StopCard'

interface ItineraryListProps {
  trip: Trip
  stops: StopRow[]
  highlightedId: string | null
  onSelect: (stopId: string) => void
  onDelete: (stopId: string) => void
  onRetry: (stopId: string) => void
  onMove: (stopId: string, visitDate: string | null) => void
}

function dayLabel(date: string | null, trip: Trip): string {
  if (!date) return 'No date yet'
  const text = new Date(date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })
  const day = dayNumber(date, trip.start_date, trip.end_date)
  return day ? `Day ${day} · ${text}` : text
}

export function ItineraryList({ trip, stops, highlightedId, onSelect, onDelete, onRetry, onMove }: ItineraryListProps) {
  if (stops.length === 0) {
    return (
      <div className="bg-surface rounded-card shadow-soft p-6 text-center">
        <p className="flex justify-center mb-3 text-muted"><Icon name="map" size={40} /></p>
        <p className="font-bold">You have no stops yet.</p>
        <p className="text-muted text-sm">Search for the first place you are going and add it.</p>
      </div>
    )
  }

  const groups: Array<{ date: string | null; stops: StopRow[] }> = []
  for (const stop of stops) {
    const last = groups[groups.length - 1]
    if (last && last.date === stop.visit_date) last.stops.push(stop)
    else groups.push({ date: stop.visit_date, stops: [stop] })
  }
  const completedCount = stops.filter((s) => s.user_lessons[0]?.status === 'completed').length

  return (
    <div className="flex flex-col gap-5">
      <div className="px-2">
        <p className="text-sm font-bold mb-2">{completedCount === stops.length ? 'Every lesson done. Safari njema.' : 'Lessons done'}</p>
        <ProgressBar value={completedCount} max={stops.length} label="Lessons done" />
      </div>
      {groups.map((group) => (
        <section key={group.date ?? 'none'}>
          <h3 className="text-sm uppercase tracking-wide text-muted font-bold mb-2 px-2">{dayLabel(group.date, trip)}</h3>
          <ul className="flex flex-col gap-3">
            {group.stops.map((stop) => (
              <StopCard
                key={stop.id}
                stop={stop}
                number={stops.indexOf(stop) + 1}
                tripStart={trip.start_date}
                tripEnd={trip.end_date}
                highlighted={stop.id === highlightedId}
                onSelect={() => onSelect(stop.id)}
                onDelete={() => onDelete(stop.id)}
                onRetry={() => onRetry(stop.id)}
                onMove={(date) => onMove(stop.id, date)}
              />
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
