// Test mode's search box. It looks like the real one but searches the built-in list of places.
// Exists because the real search needs a Google Maps key, and test mode must work without one.
import { useState } from 'react'
import { PLACE_TYPE_INFO } from '../trip/placeTypes'
import type { PickedPlace } from '../trip/usePlaceSearch'
import { searchSamplePlaces } from './samplePlaces'

export function SamplePlaceSearch({ onPick }: { onPick: (place: PickedPlace) => void }) {
  const [query, setQuery] = useState('')
  const results = searchSamplePlaces(query)

  function choose(place: PickedPlace) {
    setQuery('')
    onPick(place)
  }

  return (
    <div className="w-full">
      <label className="sr-only" htmlFor="sample-search">Search for a place in Kenya</label>
      <input
        id="sample-search"
        type="search"
        autoComplete="off"
        placeholder="Try Diani, Mara, market, airport"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full min-h-[52px] px-5 rounded-pill bg-surface shadow-lift text-text placeholder:text-muted"
      />
      {query.trim().length >= 2 && (
        <ul className="mt-2 bg-surface rounded-card shadow-lift overflow-hidden max-h-72 overflow-y-auto" role="listbox">
          {results.length === 0 && <li className="px-5 py-3 text-sm text-muted">No places found in Kenya.</li>}
          {results.map((place) => (
            <li key={place.googlePlaceId}>
              <button type="button" onClick={() => choose(place)} className="w-full text-left px-5 py-3 min-h-[48px] hover:bg-tint cursor-pointer flex items-center gap-3">
                <span aria-hidden="true">{PLACE_TYPE_INFO[place.placeType].emoji}</span>
                <span>
                  <span className="block font-bold">{place.name}</span>
                  <span className="block text-sm text-muted">{place.address}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
