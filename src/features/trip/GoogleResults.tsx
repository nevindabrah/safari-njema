// Places from Google Maps that match what was typed, listed under the catalogue when a Maps key exists.
// Exists so a search finds any place in Kenya, not only the 51 built in ones, while the catalogue keeps its photos and intent search.
import { useEffect } from 'react'
import { Icon } from '../../components/icons'
import { usePlaceSearch, type PickedPlace, type Suggestion } from './usePlaceSearch'

interface GoogleResultsProps {
  query: string
  onPick: (place: PickedPlace) => void
  compact?: boolean
}

export function GoogleResults({ query, onPick, compact = false }: GoogleResultsProps) {
  const { setQuery, suggestions, searching, pick } = usePlaceSearch()

  useEffect(() => {
    setQuery(query)
  }, [query, setQuery])

  async function choose(suggestion: Suggestion) {
    onPick(await pick(suggestion))
  }

  if (query.trim().length < 2) return null
  if (!searching && suggestions.length === 0) return null

  return (
    <div className={compact ? '' : 'mt-6'}>
      {!compact && <h3 className="text-sm uppercase tracking-wide text-muted font-bold mb-2 flex items-center gap-1.5"><Icon name="search" size={14} />On Google Maps</h3>}
      <ul className={compact ? '' : 'bg-surface rounded-card shadow-soft overflow-hidden'} role={compact ? undefined : 'listbox'}>
        {searching && suggestions.length === 0 && <li className="px-5 py-3 text-sm text-muted">Searching Kenya</li>}
        {suggestions.map((s) => (
          <li key={s.placeId}>
            <button type="button" onClick={() => choose(s)} className="w-full text-left px-5 py-3 min-h-[48px] hover:bg-tint cursor-pointer">
              <span className="block font-bold">{s.mainText}</span>
              {s.secondaryText && <span className="block text-sm text-muted">{s.secondaryText}</span>}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
