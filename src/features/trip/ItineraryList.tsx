// The list of stops grouped by day, each with its lesson status and a start button.
// Exists as the home screen's main content for this cut.
import { Link } from 'react-router'
import { Button } from '../../components/Button'
import { PLACE_TYPE_INFO } from './placeTypes'
import type { StopRow } from '../../lib/types'

interface ItineraryListProps {
  stops: StopRow[]
  highlightedId: string | null
  onSelect: (stopId: string) => void
  onDelete: (stopId: string) => void
  onRetry: (stopId: string) => void
}

function dayLabel(date: string | null): string {
  if (!date) return 'No date yet'
  return new Date(date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })
}

export function ItineraryList({ stops, highlightedId, onSelect, onDelete, onRetry }: ItineraryListProps) {
  if (stops.length === 0) {
    return (
      <div className="bg-surface rounded-card shadow-soft p-6 text-center">
        <p className="text-3xl mb-2" aria-hidden="true">🗺️</p>
        <p className="font-bold">You have no stops yet.</p>
        <p className="text-muted text-sm">Search for the first place you are going and add it.</p>
      </div>
    )
  }

  // Group by visit date while keeping position order.
  const groups: Array<{ date: string | null; stops: StopRow[] }> = []
  for (const stop of stops) {
    const last = groups[groups.length - 1]
    if (last && last.date === stop.visit_date) last.stops.push(stop)
    else groups.push({ date: stop.visit_date, stops: [stop] })
  }

  return (
    <div className="flex flex-col gap-5">
      {groups.map((group) => (
        <section key={group.date ?? 'none'}>
          <h3 className="text-sm uppercase tracking-wide text-muted font-bold mb-2 px-2">{dayLabel(group.date)}</h3>
          <ul className="flex flex-col gap-3">
            {group.stops.map((stop) => {
              const info = PLACE_TYPE_INFO[stop.place.place_type]
              const number = stops.indexOf(stop) + 1
              const lessonId = stop.user_lessons[0]?.id
              const highlighted = stop.id === highlightedId
              return (
                <li key={stop.id} className={`bg-surface rounded-card shadow-soft p-4 transition-shadow ${highlighted ? 'shadow-lift' : ''}`}>
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => onSelect(stop.id)}
                      className="w-12 h-12 shrink-0 rounded-input bg-tint text-2xl flex items-center justify-center cursor-pointer relative"
                      aria-label={`Show ${stop.place.name} on the map`}
                    >
                      <span aria-hidden="true">{info.emoji}</span>
                      <span className="absolute -top-1 -left-1 w-5 h-5 rounded-pill bg-accent text-on-accent text-[11px] font-bold flex items-center justify-center">{number}</span>
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate">{stop.place.name}</p>
                      <p className="text-sm text-muted">
                        {info.label}
                        {stop.activities.length > 0 && ` · ${stop.activities.join(', ')}`}
                      </p>
                    </div>
                    <button type="button" onClick={() => onDelete(stop.id)} aria-label={`Remove ${stop.place.name}`}
                      className="w-10 h-10 rounded-pill hover:bg-tint text-muted cursor-pointer">🗑</button>
                  </div>
                  <div className="mt-3">
                    {stop.lesson_status === 'generating' && (
                      <p className="text-sm text-muted flex items-center gap-2">
                        <span className="inline-block w-4 h-4 rounded-pill border-2 border-accent border-t-transparent animate-spin" aria-hidden="true" />
                        Preparing your lesson
                      </p>
                    )}
                    {stop.lesson_status === 'ready' && lessonId && (
                      <Link to={`/lesson/${lessonId}`} className="block">
                        <Button variant="accent" full tabIndex={-1}>Start lesson</Button>
                      </Link>
                    )}
                    {(stop.lesson_status === 'failed' || (stop.lesson_status === 'ready' && !lessonId)) && (
                      <Button variant="soft" full onClick={() => onRetry(stop.id)}>Try again</Button>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}
