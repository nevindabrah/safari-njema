// Fills a first time visitor's demo with a ready-made three stop trip: a market, a beach and a game reserve.
// Exists so the first screen a recruiter sees is a real itinerary with three different lessons, not an empty list.
import { addLocalStop, attachLocalLesson, getLocalTrip, listLocalStops, markDemoSeeded, wasDemoSeeded } from './localStore'
import { buildLocalLesson } from './localLessons'
import { SAMPLE_PLACES } from './samplePlaces'

const DEMO_STOPS = [
  { placeId: 'sample-maasai-market', activities: ['shopping'], dayOffset: 0 },
  { placeId: 'sample-diani', activities: ['eating out'], dayOffset: 2 },
  { placeId: 'sample-maasai-mara', activities: ['game drive'], dayOffset: 4 },
]

function dayOfTrip(startDate: string | null, offset: number): string | null {
  if (!startDate) return null
  const day = new Date(startDate + 'T00:00:00')
  day.setDate(day.getDate() + offset)
  return day.toISOString().slice(0, 10)
}

// One shared promise, so two callers at once (React runs effects twice in development) cannot seed the trip twice.
let seeding: Promise<void> | null = null

// Runs once per browser. After "Start with an empty trip" the flag is set, so this does nothing.
export function ensureDemoTrip(): Promise<void> {
  if (wasDemoSeeded() || listLocalStops().length > 0) return Promise.resolve()
  if (!seeding) seeding = seedDemoTrip()
  return seeding
}

async function seedDemoTrip() {
  markDemoSeeded()
  const trip = getLocalTrip()
  for (const demo of DEMO_STOPS) {
    const place = SAMPLE_PLACES.find((p) => p.googlePlaceId === demo.placeId)
    if (!place) continue
    const stop = addLocalStop(place, dayOfTrip(trip.start_date, demo.dayOffset), demo.activities)
    const lesson = await buildLocalLesson({ placeName: place.name, placeType: place.placeType, region: place.region, activities: demo.activities, firstStop: stop.position === 1 })
    attachLocalLesson(stop.id, lesson)
  }
}
