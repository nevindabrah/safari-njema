// The catalogue: every built-in place as a photo card, browsable by kind and searchable by name or by what you want to do.
// Exists so nobody has to guess a place's name. It opens over the planner, and picking a place hands it to the same preview card as search.
import { useEffect, useRef, useState } from 'react'
import { Icon } from '../../components/icons'
import { CATEGORIES, searchPlaces } from '../../lib/placeSearch'
import { SAMPLE_PLACES } from '../demo/samplePlaces'
import { PlacePhoto } from '../places/PlacePhoto'
import { PLACE_TYPE_INFO } from './placeTypes'
import { REGION_LABEL } from './regions'
import type { PickedPlace } from './usePlaceSearch'

interface PlaceCatalogProps {
  // Places already on the trip are marked, so nobody adds the same one twice by accident.
  addedIds: string[]
  onPick: (place: PickedPlace) => void
  onClose: () => void
}

export function PlaceCatalog({ addedIds, onPick, onClose }: PlaceCatalogProps) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string | null>(null)
  const input = useRef<HTMLInputElement>(null)

  // While the catalogue is open: focus the search, close on Escape, and stop the page behind from scrolling.
  useEffect(() => {
    input.current?.focus()
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const found = query.trim() ? searchPlaces(SAMPLE_PLACES, query) : SAMPLE_PLACES
  const types = CATEGORIES.find((c) => c.key === category)?.types
  const shown = types ? found.filter((p) => types.includes(p.placeType)) : found
  const chip = (active: boolean) => `shrink-0 px-4 min-h-[40px] rounded-pill text-sm font-bold cursor-pointer whitespace-nowrap ${active ? 'bg-primary text-on-primary' : 'bg-tint text-text'}`

  return (
    <div className="fixed inset-0 z-40 flex sm:items-center sm:justify-center sm:p-6" style={{ background: 'color-mix(in srgb, var(--ink) 55%, transparent)' }} onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="catalog-title" onClick={(e) => e.stopPropagation()}
        className="bg-bg w-full sm:max-w-4xl sm:rounded-card shadow-lift flex flex-col h-dvh sm:h-[86dvh] overflow-hidden">
        <div className="p-4 sm:p-5 pb-3">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h2 id="catalog-title" className="text-2xl sm:text-3xl">Where are you going?</h2>
            <button type="button" onClick={onClose} aria-label="Close the catalogue" className="w-11 h-11 rounded-pill bg-surface shadow-soft flex items-center justify-center cursor-pointer"><Icon name="close" size={18} /></button>
          </div>
          <label className="sr-only" htmlFor="catalog-search">Search places</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"><Icon name="search" size={18} /></span>
            <input ref={input} id="catalog-search" type="search" autoComplete="off" value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="A place, or what you want to do: food, safari, swim" className="w-full min-h-[52px] pl-11 pr-5 rounded-pill bg-surface shadow-soft" />
          </div>
          <div className="flex gap-2 overflow-x-auto mt-3 pb-1 -mx-1 px-1" role="group" aria-label="Kinds of place">
            <button type="button" className={chip(category === null)} aria-pressed={category === null} onClick={() => setCategory(null)}>All {found.length}</button>
            {CATEGORIES.map((c) => {
              const count = found.filter((p) => c.types.includes(p.placeType)).length
              return <button key={c.key} type="button" disabled={count === 0} aria-pressed={category === c.key} onClick={() => setCategory(c.key)} className={`${chip(category === c.key)} disabled:opacity-40 disabled:cursor-default`}>{c.label} {count}</button>
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-5 pb-6">
          {shown.length === 0 && (
            <div className="text-center py-12">
              <p className="font-bold">Nothing matches "{query}".</p>
              <p className="text-muted text-sm mt-1">Try a kind of place, like food, beach or museum. The catalogue covers Kenya only.</p>
            </div>
          )}
          <ul className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {shown.map((place) => {
              const added = addedIds.includes(place.googlePlaceId)
              return (
                <li key={place.googlePlaceId}>
                  <button type="button" onClick={() => onPick(place)} className="w-full h-full text-left bg-surface rounded-card shadow-soft overflow-hidden cursor-pointer hover:shadow-lift transition-shadow flex flex-col">
                    <span className="relative block">
                      <PlacePhoto googlePlaceId={place.googlePlaceId} placeType={place.placeType} name={place.name} size="small" className="w-full h-28 sm:h-32" />
                      {added && <span className="absolute top-2 left-2 rounded-pill px-2 py-1 text-xs font-bold flex items-center gap-1" style={{ background: 'var(--success)', color: 'var(--on-success)' }}><Icon name="check" size={12} />On your trip</span>}
                    </span>
                    <span className="block p-3">
                      <span className="block font-display font-extrabold leading-tight">{place.name}</span>
                      <span className="text-xs text-muted flex items-center gap-1 mt-1"><Icon name={place.placeType} size={13} />{PLACE_TYPE_INFO[place.placeType].label}</span>
                      {/* "Nairobi · Nairobi" says nothing twice, so the region is only added when it differs from the address. */}
                      <span className="block text-xs text-muted mt-0.5">{place.address}{place.address === REGION_LABEL[place.region] ? '' : ` · ${REGION_LABEL[place.region]}`}</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}
