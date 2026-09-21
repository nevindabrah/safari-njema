// One stop in the itinerary: its photo, its day (which can be changed here), its lesson button and its pocket card.
// Exists apart from ItineraryList so the list only groups and orders, and this file owns one row.
import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { Button } from '../../components/Button'
import { Icon } from '../../components/icons'
import type { StopRow } from '../../lib/types'
import { PlacePhoto } from '../places/PlacePhoto'
import { PLACE_TYPE_INFO } from './placeTypes'

interface StopCardProps {
  stop: StopRow
  number: number
  highlighted: boolean
  onSelect: () => void
  onDelete: () => void
  onRetry: () => void
  onMove: (visitDate: string | null) => void
}

export function StopCard({ stop, number, highlighted, onSelect, onDelete, onRetry, onMove }: StopCardProps) {
  const info = PLACE_TYPE_INFO[stop.place.place_type]
  const lessonId = stop.user_lessons[0]?.id
  const completed = stop.user_lessons[0]?.status === 'completed'
  const row = useRef<HTMLLIElement>(null)

  // When the pin is picked on the map, bring this row into view. Only on wide screens, where the list sits beside the map.
  // On a phone the list is below the map, and scrolling there would take the map away from the finger that just tapped it.
  useEffect(() => {
    if (highlighted && window.matchMedia('(min-width: 1024px)').matches) row.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [highlighted])

  return (
    <li ref={row} className="bg-surface rounded-card shadow-soft p-3 transition-shadow" style={highlighted ? { boxShadow: '0 0 0 3px var(--accent), var(--shadow-lift)' } : undefined}>
      <div className="flex items-stretch gap-3">
        <button type="button" onClick={onSelect} aria-label={`Show ${stop.place.name} on the map`} aria-pressed={highlighted} className="relative shrink-0 cursor-pointer">
          <PlacePhoto googlePlaceId={stop.place.google_place_id} placeType={stop.place.place_type} name={stop.place.name} size="small" className="w-20 h-20 rounded-input" />
          <span className="absolute -top-1.5 -left-1.5 w-6 h-6 rounded-pill text-on-accent text-xs font-bold flex items-center justify-center" style={{ background: completed ? 'var(--success)' : 'var(--accent)', border: '2px solid var(--surface)' }}>
            {completed ? <Icon name="check" size={13} /> : number}
          </span>
        </button>
        <div className="flex-1 min-w-0 py-0.5">
          <p className="font-display font-extrabold text-lg leading-tight truncate">{stop.place.name}</p>
          <p className="text-sm text-muted truncate flex items-center gap-1.5 mt-0.5"><Icon name={stop.place.place_type} size={15} />{info.label}</p>
          {stop.activities.length > 0 && <p className="text-xs text-muted truncate mt-0.5">{stop.activities.join(' · ')}</p>}
        </div>
        <button type="button" onClick={onDelete} aria-label={`Remove ${stop.place.name}`} className="w-10 h-10 shrink-0 rounded-pill hover:bg-tint text-muted cursor-pointer flex items-center justify-center"><Icon name="trash" size={18} /></button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        <label className="flex items-center gap-2">
          <span className="text-muted font-bold">Day</span>
          <input type="date" aria-label={`Day for ${stop.place.name}`} value={stop.visit_date ?? ''} onChange={(e) => onMove(e.target.value || null)} className="min-h-[36px] px-3 rounded-pill bg-tint font-bold" />
        </label>
        {stop.visit_date && <button type="button" onClick={() => onMove(null)} className="underline font-bold text-muted min-h-[36px] px-1 cursor-pointer">No date</button>}
      </div>

      <div className="mt-3">
        {stop.lesson_status === 'generating' && (
          <p className="text-sm text-muted flex items-center gap-2 min-h-[48px]">
            <span className="inline-block w-4 h-4 rounded-pill border-2 border-accent border-t-transparent animate-spin" aria-hidden="true" />
            Preparing your lesson
          </p>
        )}
        {stop.lesson_status === 'ready' && lessonId && (
          <div className="flex gap-2">
            <Link to={`/lesson/${lessonId}`} className="block flex-1">
              <Button variant={completed ? 'soft' : 'accent'} full tabIndex={-1}>{completed ? 'Review lesson' : 'Start lesson'}</Button>
            </Link>
            <Link to={`/card/${lessonId}`} aria-label={`Pocket card for ${stop.place.name}`} title="Pocket card">
              <Button variant="soft" tabIndex={-1} className="!px-4"><Icon name="card" size={20} /></Button>
            </Link>
          </div>
        )}
        {(stop.lesson_status === 'failed' || (stop.lesson_status === 'ready' && !lessonId)) && <Button variant="soft" full onClick={onRetry}>Try again</Button>}
      </div>
    </li>
  )
}
