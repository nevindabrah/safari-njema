// The search box used when there is no Google Maps key. It searches the built-in catalogue by name or by what you want to do.
// Exists because the real search needs a paid Google key. Quick ideas and a way into the full catalogue sit right under it.
import { useState } from 'react'
import { Icon } from '../../components/icons'
import { SearchBox } from '../../components/SearchBox'
import { searchPlaces } from '../../lib/placeSearch'
import { PlacePhoto } from '../places/PlacePhoto'
import { PLACE_TYPE_INFO } from '../trip/placeTypes'
import type { PickedPlace } from '../trip/usePlaceSearch'
import { SAMPLE_PLACES } from './samplePlaces'

const IDEAS = ['food', 'safari', 'beach', 'markets', 'museums', 'Nairobi']

interface SamplePlaceSearchProps {
  onPick: (place: PickedPlace) => void
  onBrowse: () => void
}

export function SamplePlaceSearch({ onPick, onBrowse }: SamplePlaceSearchProps) {
  const [query, setQuery] = useState('')
  const typed = query.trim().length >= 2
  const results = typed ? searchPlaces(SAMPLE_PLACES, query).slice(0, 8) : []

  function choose(place: PickedPlace) {
    setQuery('')
    onPick(place)
  }

  const pill = 'shrink-0 px-3.5 min-h-[44px] rounded-pill text-sm font-bold cursor-pointer whitespace-nowrap bg-surface shadow-soft'

  return (
    <div className="w-full">
      <SearchBox id="sample-search" label="Search for a place in Kenya" placeholder="Place, food, safari, beach" value={query} onChange={setQuery} shadow="lift" />

      {!typed && (
        <div className="flex gap-2 overflow-x-auto mt-2 pb-1">
          <button type="button" onClick={onBrowse} className={`${pill} bg-primary text-on-primary flex items-center gap-1.5`} style={{ background: 'var(--primary)', color: 'var(--on-primary)' }}><Icon name="map" size={15} />Browse all places</button>
          {IDEAS.map((idea) => <button key={idea} type="button" onClick={() => setQuery(idea)} className={pill}>{idea}</button>)}
        </div>
      )}

      {typed && (
        <ul className="mt-2 bg-surface rounded-card shadow-lift overflow-hidden max-h-72 overflow-y-auto" role="listbox">
          {results.length === 0 && <li className="px-5 py-3 text-sm text-muted">Nothing in Kenya matches that. Try a kind of place, like food or beach.</li>}
          {results.map((place) => (
            <li key={place.googlePlaceId}>
              <button type="button" onClick={() => choose(place)} className="w-full text-left px-4 py-2.5 min-h-[48px] hover:bg-tint cursor-pointer flex items-center gap-3">
                <PlacePhoto googlePlaceId={place.googlePlaceId} placeType={place.placeType} name={place.name} size="small" className="w-11 h-11 rounded-input shrink-0" />
                <span className="min-w-0">
                  <span className="block font-bold truncate">{place.name}</span>
                  <span className="text-sm text-muted flex items-center gap-1"><Icon name={place.placeType} size={13} />{PLACE_TYPE_INFO[place.placeType].label} · {place.address}</span>
                </span>
              </button>
            </li>
          ))}
          <li><button type="button" onClick={onBrowse} className="w-full text-left px-5 py-3 text-sm font-bold underline cursor-pointer bg-surface-2">Browse all {SAMPLE_PLACES.length} places</button></li>
        </ul>
      )}
    </div>
  )
}
