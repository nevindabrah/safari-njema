// The card shown after picking a place: name, type, county, day, activities, who the stop is for on a shared trip, and the add button.
// Exists so adding a stop is one tap with a few optional choices.
import { useState } from 'react'
import { Button } from '../../components/Button'
import { DatePicker } from '../../components/DatePicker'
import { ACTIVITIES, type Trip } from '../../lib/types'
import { Icon } from '../../components/icons'
import { PlacePhoto, PhotoCredit } from '../places/PlacePhoto'
import { PLACE_TYPE_INFO } from './placeTypes'
import { REGION_LABEL } from './regions'
import type { PickedPlace } from './usePlaceSearch'
import { usePlaceFacts } from '../places/usePlaceFacts'
import { WikipediaNote } from '../places/WikipediaNote'

interface PlacePreviewCardProps {
  place: PickedPlace
  trip: Trip
  shared: boolean
  onAdd: (visitDate: string | null, activities: string[], justMe: boolean) => Promise<void>
  onClose: () => void
}

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

export function PlacePreviewCard({ place, trip, shared, onAdd, onClose }: PlacePreviewCardProps) {
  const [visitDate, setVisitDate] = useState<string | null>(null)
  const [activities, setActivities] = useState<string[]>([])
  const [justMe, setJustMe] = useState(false)
  const facts = usePlaceFacts(place.googlePlaceId, place.name, place.county)
  const [busy, setBusy] = useState(false)
  const info = PLACE_TYPE_INFO[place.placeType]
  const days = tripDays(trip)

  function toggleActivity(name: string) {
    setActivities((list) => (list.includes(name) ? list.filter((a) => a !== name) : [...list, name]))
  }

  async function add() {
    setBusy(true)
    await onAdd(visitDate, activities, shared && justMe)
    setBusy(false)
  }

  const chip = (active: boolean) =>
    `px-3.5 min-h-[44px] rounded-pill text-sm font-bold cursor-pointer ${active ? 'bg-primary text-on-primary' : 'bg-soft text-on-soft'}`

  return (
    <div className="bg-surface rounded-card shadow-lift overflow-clip">
      <div className="relative">
        <PlacePhoto googlePlaceId={place.googlePlaceId} placeType={place.placeType} name={place.name} size="large" className="w-full h-36" photo={facts?.photo} />
        <button onClick={onClose} aria-label="Close this place" className="absolute top-3 right-3 w-11 h-11 rounded-pill bg-surface text-text shadow-soft cursor-pointer flex items-center justify-center"><Icon name="close" size={18} /></button>
      </div>
      <div className="p-5">
      <h2 className="text-2xl">{place.name}</h2>
      <p className="text-sm text-muted flex items-center gap-1.5 mt-1"><Icon name={place.placeType} size={15} />{info.label}{place.county ? ` · ${place.county}` : ''} · {REGION_LABEL[place.region]}</p>
      <PhotoCredit googlePlaceId={place.googlePlaceId} className="text-muted mt-1" photo={facts?.photo} />
      <WikipediaNote summary={facts?.summary} fallback={info.about} className="text-sm mt-3" />

      <p className="text-sm font-bold mt-4 mb-2">Which day?</p>
      <div className="flex gap-2 flex-wrap items-center">
        <button type="button" className={chip(visitDate === null)} onClick={() => setVisitDate(null)}>No date yet</button>
        {days.slice(0, 14).map((d, i) => (
          <button key={d} type="button" className={chip(visitDate === d)} onClick={() => setVisitDate(d)}>Day {i + 1}</button>
        ))}
        {days.length > 0 && <span className="text-sm font-bold text-muted">or</span>}
        <DatePicker label="Pick any date" placeholder="Any date" value={visitDate && !days.slice(0, 14).includes(visitDate) ? visitDate : null} active={Boolean(visitDate && !days.slice(0, 14).includes(visitDate))}
          tripStart={trip.start_date} tripEnd={trip.end_date} onChange={setVisitDate} />
      </div>

      <p className="text-sm font-bold mt-4 mb-2">What will you do there? Optional</p>
      <div className="flex gap-2 flex-wrap">
        {ACTIVITIES.map((a) => (
          <button key={a} type="button" className={chip(activities.includes(a))} onClick={() => toggleActivity(a)} aria-pressed={activities.includes(a)}>{a}</button>
        ))}
      </div>

      {shared && (
        <>
          <p className="text-sm font-bold mt-4 mb-2">Who is this stop for?</p>
          <div className="flex gap-2 flex-wrap">
            <button type="button" className={chip(!justMe)} onClick={() => setJustMe(false)} aria-pressed={!justMe}>Everyone on the trip</button>
            <button type="button" className={chip(justMe)} onClick={() => setJustMe(true)} aria-pressed={justMe}>Just me</button>
          </div>
          <p className="text-xs text-muted mt-2">{justMe ? 'Only you see this stop and its lesson. Your friends on the trip will not.' : 'Everyone on the trip sees this stop and gets their own lesson for it.'}</p>
        </>
      )}

      <div className="sticky bottom-0 bg-surface pt-3 pb-4 -mb-5 mt-2">
        <Button variant="accent" full silent onClick={add} disabled={busy}>
          {busy ? 'Adding' : 'Add to itinerary'}
        </Button>
      </div>
      </div>
    </div>
  )
}
