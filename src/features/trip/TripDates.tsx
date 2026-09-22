// The trip's start and end dates, editable at any time and both optional.
// Exists so day chips and "Day 3" labels follow the real trip, and so a trip with no dates still works.
import { DatePicker } from '../../components/DatePicker'
import type { Trip } from '../../lib/types'

interface TripDatesProps {
  trip: Trip
  onChange: (startDate: string | null, endDate: string | null) => void
}

export function TripDates({ trip, onChange }: TripDatesProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="text-muted font-bold">From</span>
      <DatePicker label="First day of the trip" placeholder="First day" value={trip.start_date} tripStart={trip.start_date} tripEnd={trip.end_date} onChange={(day) => onChange(day, trip.end_date)} />
      <span className="text-muted font-bold">to</span>
      <DatePicker label="Last day of the trip" placeholder="Last day" value={trip.end_date} tripStart={trip.start_date} tripEnd={trip.end_date} onChange={(day) => onChange(trip.start_date, day)} />
      {(trip.start_date || trip.end_date) && (
        <button type="button" onClick={() => onChange(null, null)} className="underline font-bold text-muted min-h-[44px] px-1 cursor-pointer">No dates yet</button>
      )}
    </div>
  )
}
