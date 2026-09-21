// The trip planner: map on one side, itinerary on the other. This is the home screen for the cut.
// Exists to hold the loop together: search, add, then open a lesson.
import { useState } from 'react'
import { APIProvider } from '@vis.gl/react-google-maps'
import { TopBar } from '../../components/TopBar'
import { ReviewNote } from '../../components/ReviewNote'
import { useTrip } from './useTrip'
import { useStops } from './useStops'
import { TripMap } from './TripMap'
import { PlaceSearch } from './PlaceSearch'
import { PlacePreviewCard } from './PlacePreviewCard'
import { ItineraryList } from './ItineraryList'
import type { PickedPlace } from './usePlaceSearch'
import { isDemoMode } from '../demo/demoMode'
import { DemoMap } from '../demo/DemoMap'
import { SamplePlaceSearch } from '../demo/SamplePlaceSearch'

export function TripScreen() {
  const mapsKey = import.meta.env.VITE_GOOGLE_MAPS_KEY as string | undefined
  const { trip, error } = useTrip()
  const { stops, loading, addStop, deleteStop, retryLesson } = useStops(trip?.id ?? null)
  const [preview, setPreview] = useState<PickedPlace | null>(null)
  const [highlightedId, setHighlightedId] = useState<string | null>(null)

  async function handleAdd(visitDate: string | null, activities: string[]) {
    if (!preview) return
    const place = preview
    setPreview(null)
    await addStop(place, visitDate, activities)
  }

  return (
    <div className="min-h-dvh flex flex-col">
      <TopBar />
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 pb-8 grid gap-6 grid-cols-1 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <section className="relative isolate min-w-0 h-[55dvh] lg:h-[calc(100dvh-6rem)] lg:sticky lg:top-20 rounded-card overflow-hidden shadow-soft bg-tint">
          {mapsKey && trip ? (
            <APIProvider apiKey={mapsKey} libraries={['places']}>
              <TripMap stops={stops} preview={preview} highlightedId={highlightedId} onPinClick={setHighlightedId} />
              <div className="absolute top-4 left-4 right-4 z-10">
                <PlaceSearch onPick={(place) => { setPreview(place); setHighlightedId(null) }} />
              </div>
              {preview && (
                <div className="absolute bottom-4 left-4 right-4 z-10 max-h-[70%] overflow-y-auto">
                  <PlacePreviewCard key={preview.googlePlaceId} place={preview} trip={trip} onAdd={handleAdd} onClose={() => setPreview(null)} />
                </div>
              )}
            </APIProvider>
          ) : isDemoMode && trip ? (
            <>
              <DemoMap stops={stops} preview={preview} highlightedId={highlightedId} onPinClick={setHighlightedId} />
              <div className="absolute top-4 left-4 right-4 z-30">
                <SamplePlaceSearch onPick={(place) => { setPreview(place); setHighlightedId(null) }} />
              </div>
              {preview && (
                <div className="absolute bottom-4 left-4 right-4 z-30 max-h-[70%] overflow-y-auto">
                  <PlacePreviewCard key={preview.googlePlaceId} place={preview} trip={trip} onAdd={handleAdd} onClose={() => setPreview(null)} />
                </div>
              )}
            </>
          ) : (
            <div className="h-full flex items-center justify-center p-6 text-center text-muted">
              {error ? error : mapsKey ? 'Loading your trip.' : 'Add VITE_GOOGLE_MAPS_KEY to .env to show the map.'}
            </div>
          )}
        </section>

        <section className="pt-2 min-w-0">
          <h2 className="text-2xl mb-4 px-2">{trip?.title ?? 'My trip'}</h2>
          {loading && trip ? (
            <p className="text-muted px-2">Loading your stops.</p>
          ) : (
            <ItineraryList stops={stops} highlightedId={highlightedId} onSelect={setHighlightedId} onDelete={deleteStop} onRetry={retryLesson} />
          )}
          <ReviewNote />
        </section>
      </main>
    </div>
  )
}
