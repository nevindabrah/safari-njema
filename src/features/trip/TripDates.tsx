// The trip's start and end dates, editable at any time and both optional.
// Exists so day chips and "Day 3" labels follow the real trip, and so a trip with no dates still works.
import type { Trip } from '../../lib/types'

interface TripDatesProps {
  trip: Trip
  onChange: (startDate: string | null, endDate: string | null) => void
}

export function TripDates({ trip, onChange }: TripDatesProps) {
  const inputClass = 'min-h-[44px] px-3 rounded-pill bg-tint text-base font-bold'
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <label className="flex items-center gap-2">
        <span className="text-muted font-bold">From</span>
        <input type="date" className={inputClass} value={trip.start_date ?? ''} onChange={(e) => onChange(e.target.value || null, trip.end_date)} />
      </label>
      <label className="flex items-center gap-2">
        <span className="text-muted font-bold">to</span>
        <input type="date" className={inputClass} value={trip.end_date ?? ''} min={trip.start_date ?? undefined} onChange={(e) => onChange(trip.start_date, e.target.value || null)} />
      </label>
      {(trip.start_date || trip.end_date) && (
        <button type="button" onClick={() => onChange(null, null)} className="underline font-bold text-muted min-h-[40px] px-1 cursor-pointer">No dates yet</button>
      )}
    </div>
  )
}
