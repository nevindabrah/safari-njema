// Kenya-only place search using the Places Autocomplete data API, debounced by 300 ms.
// Exists so the search box is our own design and the provider can be swapped in one file.
import { useEffect, useRef, useState } from 'react'
import { useMapsLibrary } from '@vis.gl/react-google-maps'
import type { PlaceType, Region } from '../../lib/types'
import { toPlaceType } from './placeTypes'
import { countyFromAddress, regionFromCounty, regionFromLatLng } from './regions'

export interface Suggestion {
  placeId: string
  mainText: string
  secondaryText: string
  prediction: google.maps.places.PlacePrediction
}

export interface PickedPlace {
  googlePlaceId: string
  name: string
  lat: number
  lng: number
  googleTypes: string[]
  placeType: PlaceType
  region: Region
  county: string | null
  address: string
}

const FIELDS = ['id', 'displayName', 'location', 'types', 'formattedAddress', 'addressComponents']

export function usePlaceSearch() {
  const places = useMapsLibrary('places')
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [searching, setSearching] = useState(false)
  const tokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null)

  useEffect(() => {
    if (!places || query.trim().length < 2) {
      setSuggestions([])
      return
    }
    const handle = setTimeout(async () => {
      setSearching(true)
      try {
        if (!tokenRef.current) tokenRef.current = new places.AutocompleteSessionToken()
        const { suggestions } = await places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: query,
          includedRegionCodes: ['ke'],
          sessionToken: tokenRef.current,
          language: 'en',
        })
        setSuggestions(
          suggestions
            .filter((s) => s.placePrediction)
            .map((s) => ({
              placeId: s.placePrediction!.placeId,
              mainText: s.placePrediction!.mainText?.text ?? s.placePrediction!.text.text,
              secondaryText: s.placePrediction!.secondaryText?.text ?? '',
              prediction: s.placePrediction!,
            })),
        )
      } catch {
        setSuggestions([])
      } finally {
        setSearching(false)
      }
    }, 300)
    return () => clearTimeout(handle)
  }, [query, places])

  async function pick(suggestion: Suggestion): Promise<PickedPlace> {
    const place = suggestion.prediction.toPlace()
    await place.fetchFields({ fields: FIELDS })
    tokenRef.current = null
    setSuggestions([])
    setQuery('')

    const lat = place.location?.lat() ?? 0
    const lng = place.location?.lng() ?? 0
    const county = countyFromAddress(place.addressComponents)
    const googleTypes = place.types ?? []
    return {
      googlePlaceId: place.id,
      name: place.displayName ?? suggestion.mainText,
      lat,
      lng,
      googleTypes,
      placeType: toPlaceType(googleTypes),
      region: regionFromCounty(county) ?? regionFromLatLng(lat, lng),
      county,
      address: place.formattedAddress ?? suggestion.secondaryText,
    }
  }

  return { query, setQuery, suggestions, searching, pick }
}
