// The search box that floats over the Google map: catalogue matches first, then places from Google Maps.
// Exists so the search matches our design instead of Google's widget, and so typing "food" or "safari" still works with the real map.
import { useState } from 'react'
import { Icon } from '../../components/icons'
import { SearchBox } from '../../components/SearchBox'
import { searchPlaces } from '../../lib/placeSearch'
import { SAMPLE_PLACES } from '../demo/samplePlaces'
import { PlacePhoto } from '../places/PlacePhoto'
import { PLACE_TYPE_INFO } from './placeTypes'
import { GoogleResults } from './GoogleResults'
import type { PickedPlace } from './usePlaceSearch'

const IDEAS = ['food', 'safari', 'beach', 'markets', 'museums', 'Nairobi']

interface PlaceSearchProps {
  onPick: (place: PickedPlace) => void
  onBrowse: () => void
}

export function PlaceSearch({ onPick, onBrowse }: PlaceSearchProps) {
  const [query, setQuery] = useState('')
  const typed = query.trim().length >= 2
  const fromCatalogue = typed ? searchPlaces(SAMPLE_PLACES, query).slice(0, 4) : []

  function choose(place: PickedPlace) {
    setQuery('')
    onPick(place)
  }

  const pill = 'shrink-0 px-3.5 min-h-[44px] rounded-pill text-sm font-bold cursor-pointer whitespace-nowrap bg-surface shadow-soft'

  return (
    <div className="w-full">
      <SearchBox id="place-search" label="Search for a place in Kenya" placeholder="Where are you going? Try Diani Beach" value={query} onChange={setQuery} shadow="lift" />

      {!typed && (
        <div className="flex gap-2 overflow-x-auto mt-2 pb-1">
          <button type="button" onClick={onBrowse} className={`${pill} flex items-center gap-1.5`} style={{ background: 'var(--primary)', color: 'var(--on-primary)' }}><Icon name="map" size={15} />Browse all places</button>
          {IDEAS.map((idea) => <button key={idea} type="button" onClick={() => setQuery(idea)} className={pill}>{idea}</button>)}
        </div>
      )}

      {typed && (
        <div className="mt-2 bg-surface rounded-card shadow-lift overflow-hidden max-h-80 overflow-y-auto" role="listbox">
          {fromCatalogue.map((place) => (
            <button key={place.googlePlaceId} type="button" role="option" aria-selected={false} onClick={() => choose(place)} className="w-full text-left px-4 py-2.5 min-h-[48px] hover:bg-tint cursor-pointer flex items-center gap-3">
              <PlacePhoto googlePlaceId={place.googlePlaceId} placeType={place.placeType} name={place.name} size="small" className="w-11 h-11 rounded-input shrink-0" />
              <span className="min-w-0">
                <span className="block font-bold truncate">{place.name}</span>
                <span className="text-sm text-muted flex items-center gap-1"><Icon name={place.placeType} size={13} />{PLACE_TYPE_INFO[place.placeType].label} · {place.address}</span>
              </span>
            </button>
          ))}
          <GoogleResults query={query} onPick={choose} compact />
        </div>
      )}
    </div>
  )
}
