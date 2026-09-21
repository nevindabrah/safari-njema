// The search box and results list that float over the map.
// Exists so the search matches our design instead of Google's default widget.
import { usePlaceSearch, type PickedPlace, type Suggestion } from './usePlaceSearch'

interface PlaceSearchProps {
  onPick: (place: PickedPlace) => void
}

export function PlaceSearch({ onPick }: PlaceSearchProps) {
  const { query, setQuery, suggestions, searching, pick } = usePlaceSearch()

  async function choose(suggestion: Suggestion) {
    const place = await pick(suggestion)
    onPick(place)
  }

  return (
    <div className="w-full">
      <label className="sr-only" htmlFor="place-search">Search for a place in Kenya</label>
      <input
        id="place-search"
        type="search"
        autoComplete="off"
        placeholder="Where are you going? Try Diani Beach"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full min-h-[52px] px-5 rounded-pill bg-surface shadow-lift text-text placeholder:text-muted"
      />
      {(suggestions.length > 0 || searching) && (
        <ul className="mt-2 bg-surface rounded-card shadow-lift overflow-hidden" role="listbox">
          {searching && suggestions.length === 0 && (
            <li className="px-5 py-3 text-sm text-muted">Searching Kenya</li>
          )}
          {suggestions.map((s) => (
            <li key={s.placeId}>
              <button
                type="button"
                onClick={() => choose(s)}
                className="w-full text-left px-5 py-3 min-h-[48px] hover:bg-tint cursor-pointer"
              >
                <span className="block font-bold">{s.mainText}</span>
                {s.secondaryText && <span className="block text-sm text-muted">{s.secondaryText}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
