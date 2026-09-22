// The trip planner: map on one side, itinerary on the other. This is the home screen for the cut.
// Exists to hold the loop together: search, add, then open a lesson.
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { APIProvider } from '@vis.gl/react-google-maps'
import { TopBar } from '../../components/TopBar'
import { ReviewNote } from '../../components/ReviewNote'
import { useTrip } from './useTrip'
import { useStops } from './useStops'
import { TripMap } from './TripMap'
import { PlaceSearch } from './PlaceSearch'
import { PlacePreviewCard } from './PlacePreviewCard'
import { PreviewSheet } from './PreviewSheet'
import { ItineraryList } from './ItineraryList'
import type { PickedPlace } from './usePlaceSearch'
import { DemoMap } from '../demo/DemoMap'
import { SamplePlaceSearch } from '../demo/SamplePlaceSearch'
import { playSound } from '../../lib/sounds'
import { TripDates } from './TripDates'
import { PlaceCatalog } from './PlaceCatalog'
import { Button } from '../../components/Button'
import { Icon } from '../../components/icons'
import { useTripMembers } from './useTripMembers'
import { useAuth } from '../auth/useAuth'
import { TripMembers } from './TripMembers'
import { TripSwitcher } from './TripSwitcher'
import { isDemoMode } from '../demo/demoMode'
import { TodayCard } from './TodayCard'
import { useDueProgress } from '../review/useProgress'

export function TripScreen() {
  const mapsKey = import.meta.env.VITE_GOOGLE_MAPS_KEY as string | undefined
  const { tripId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { trip, error, updateDates, isOwner } = useTrip(tripId ?? null)
  const { members, owner, sharedWithMe, error: membersError, invite, remove } = useTripMembers(trip?.id ?? null, trip?.user_id ?? null)
  const { stops, loading, error: stopsError, addStop, deleteStop, retryLesson, moveStop } = useStops(trip?.id ?? null)
  const { due } = useDueProgress()
  const [preview, setPreview] = useState<PickedPlace | null>(null)
  const [highlightedId, setHighlightedId] = useState<string | null>(null)
  const [catalogOpen, setCatalogOpen] = useState(false)

  function pickPlace(place: PickedPlace) {
    setCatalogOpen(false)
    setPreview(place)
    setHighlightedId(null)
  }

  function selectStop(stopId: string) {
    playSound('select')
    setHighlightedId((current) => (current === stopId ? null : stopId))
  }

  async function handleAdd(visitDate: string | null, activities: string[]) {
    if (!preview) return
    const place = preview
    setPreview(null)
    playSound('added')
    await addStop(place, visitDate, activities)
  }

  const wide = window.matchMedia('(min-width: 1024px)').matches

  async function removeMember(personId: string) {
    await remove(personId)
    if (personId === user?.id) navigate('/trip', { replace: true })
  }

  return (
    <div className="min-h-dvh flex flex-col">
      <TopBar />
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 pb-28 sm:pb-8 grid gap-6 grid-cols-1 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <section className="relative isolate min-w-0 h-[55dvh] lg:h-[calc(100dvh-6rem)] lg:sticky lg:top-20 rounded-card overflow-hidden shadow-soft bg-tint">
          {mapsKey && trip ? (
            <APIProvider apiKey={mapsKey} libraries={['places']}>
              <TripMap stops={stops} preview={preview} highlightedId={highlightedId} onPinClick={selectStop} />
              <div className="absolute top-4 left-4 right-4 z-10">
                <PlaceSearch onPick={pickPlace} />
              </div>
              {preview && wide && (
                <div className="absolute bottom-4 left-4 right-4 z-10 max-h-[70%] overflow-y-auto">
                  <PlacePreviewCard key={preview.googlePlaceId} place={preview} trip={trip} onAdd={handleAdd} onClose={() => setPreview(null)} />
                </div>
              )}
            </APIProvider>
          ) : trip ? (
            <>
              <DemoMap stops={stops} preview={preview} highlightedId={highlightedId} onPinClick={selectStop} />
              <div className="absolute top-4 left-4 right-4 z-30">
                <SamplePlaceSearch onPick={pickPlace} onBrowse={() => setCatalogOpen(true)} />
              </div>
              {preview && wide && (
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
          <TripSwitcher shared={sharedWithMe} />
          {trip && !loading && <TodayCard trip={trip} stops={stops} dueCount={due.length} onSelect={selectStop} />}
          <h2 className="text-2xl mb-3 px-2 break-words">{trip?.title ?? 'My trip'}</h2>
          {(stopsError || membersError) && <p role="alert" className="mx-2 mb-4 rounded-input p-3 text-sm font-bold" style={{ background: 'var(--wrong-soft)' }}>{stopsError ?? membersError}</p>}
          {trip && <div className="px-2 mb-5"><TripDates trip={trip} onChange={updateDates} readOnly={!isOwner && !isDemoMode} /></div>}
          {trip && !isDemoMode && <TripMembers isOwner={isOwner} owner={owner} members={members} onInvite={invite} onRemove={removeMember} />}
          <div className="px-2 mb-5"><Button variant="soft" full onClick={() => setCatalogOpen(true)}><Icon name="map" size={18} />Browse places to add</Button></div>
          {loading && trip ? (
            <p className="text-muted px-2">Loading your stops.</p>
          ) : (
            trip && <ItineraryList trip={trip} stops={stops} highlightedId={highlightedId} onSelect={selectStop} onDelete={deleteStop} onRetry={retryLesson} onMove={moveStop} />
          )}
          <ReviewNote />
        </section>
      </main>
      {preview && trip && !wide && (
        <PreviewSheet onClose={() => setPreview(null)}>
          <PlacePreviewCard key={preview.googlePlaceId} place={preview} trip={trip} onAdd={handleAdd} onClose={() => setPreview(null)} />
        </PreviewSheet>
      )}
      {catalogOpen && <PlaceCatalog addedIds={stops.map((s) => s.place.google_place_id)} onPick={pickPlace} onClose={() => setCatalogOpen(false)} />}
    </div>
  )
}
