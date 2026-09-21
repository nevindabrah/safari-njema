// The card shown after picking a place: name, type, county, day and activities, and the add button.
// Exists so adding a stop is one tap with two optional choices.
import { useState } from 'react'
import { Button } from '../../components/Button'
import { ACTIVITIES, type Trip } from '../../lib/types'
import { PLACE_TYPE_INFO } from './placeTypes'
import { REGION_LABEL } from './regions'
import type { PickedPlace } from './usePlaceSearch'

interface PlacePreviewCardProps {
  place: PickedPlace
  trip: Trip
  onAdd: (visitDate: string | null, activities: string[]) => Promise<void>
  onClose: () => void
}

// Builds the list of days between the trip dates, if both are set.
function tripDays(trip: Trip): string[] {
  if (!trip.start_date || !trip.end_date) return []
  const days: string[] = []
  const cursor = new Date(trip.start_date + 'T00:00:00')
  const end = new Date(trip.end_date + 'T00:00:00')
  while (cursor <= end && days.length < 60) {
    days.push(cursor.toISOString().slice(0, 10))
    cursor.setDate(cursor.getDate() + 1)
  }
  return days
}

export function PlacePreviewCard({ place, trip, onAdd, onClose }: PlacePreviewCardProps) {
  const [visitDate, setVisitDate] = useState<string | null>(null)
  const [activities, setActivities] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const info = PLACE_TYPE_INFO[place.placeType]
  const days = tripDays(trip)

  function toggleActivity(name: string) {
    setActivities((list) => (list.includes(name) ? list.filter((a) => a !== name) : [...list, name]))
  }

  async function add() {
    setBusy(true)
    await onAdd(visitDate, activities)
    setBusy(false)
  }

  const chip = (active: boolean) =>
    `px-3 min-h-[40px] rounded-pill text-sm font-bold cursor-pointer ${active ? 'bg-primary text-on-primary' : 'bg-tint text-text'}`

  return (
    <div className="bg-surface rounded-card shadow-lift p-5">
      <div className="flex items-start gap-3">
        <span className="text-2xl w-12 h-12 rounded-input bg-tint flex items-center justify-center" aria-hidden="true">{info.emoji}</span>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl truncate">{place.name}</h2>
          <p className="text-sm text-muted">{info.label}{place.county ? ` · ${place.county}` : ''} · {REGION_LABEL[place.region]}</p>
        </div>
        <button onClick={onClose} aria-label="Close" className="w-10 h-10 rounded-pill hover:bg-tint cursor-pointer">×</button>
      </div>

      <p className="text-sm font-bold mt-4 mb-2">Which day?</p>
      <div className="flex gap-2 flex-wrap items-center">
        <button type="button" className={chip(visitDate === null)} onClick={() => setVisitDate(null)}>No date yet</button>
        {days.slice(0, 14).map((d, i) => (
          <button key={d} type="button" className={chip(visitDate === d)} onClick={() => setVisitDate(d)}>Day {i + 1}</button>
        ))}
        {/* Any date at all, inside the trip or not. Trip dates are a guide, never a limit. */}
        <label className="flex items-center gap-2 text-sm font-bold text-muted">
          {days.length > 0 ? 'or' : ''}
          <input type="date" aria-label="Pick any date" value={visitDate ?? ''} onChange={(e) => setVisitDate(e.target.value || null)}
            className={`px-3 min-h-[40px] rounded-pill text-sm font-bold ${visitDate && !days.slice(0, 14).includes(visitDate) ? 'bg-primary text-on-primary' : 'bg-tint text-text'}`} />
        </label>
      </div>

      <p className="text-sm font-bold mt-4 mb-2">What will you do there? Optional</p>
      <div className="flex gap-2 flex-wrap">
        {ACTIVITIES.map((a) => (
          <button key={a} type="button" className={chip(activities.includes(a))} onClick={() => toggleActivity(a)} aria-pressed={activities.includes(a)}>{a}</button>
        ))}
      </div>

      <Button variant="accent" full silent className="mt-5" onClick={add} disabled={busy}>
        {busy ? 'Adding' : 'Add to itinerary'}
      </Button>
    </div>
  )
}
