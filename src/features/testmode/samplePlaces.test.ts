// Tests for test mode's sample places.
// Exists so every sample is inside Kenya and search stays limited to the list, like the real Kenya-only search.
import { describe, expect, it } from 'vitest'
import { SAMPLE_PLACES, searchSamplePlaces } from './samplePlaces'

describe('sample places', () => {
  it('are all inside Kenya and have unique ids', () => {
    for (const place of SAMPLE_PLACES) {
      expect(place.lat).toBeGreaterThan(-4.9)
      expect(place.lat).toBeLessThan(5.1)
      expect(place.lng).toBeGreaterThan(33.8)
      expect(place.lng).toBeLessThan(42)
    }
    expect(new Set(SAMPLE_PLACES.map((p) => p.googlePlaceId)).size).toBe(SAMPLE_PLACES.length)
  })

  it('cover every kind of place a lesson can be built for, except other', () => {
    const types = new Set(SAMPLE_PLACES.map((p) => p.placeType))
    for (const type of ['city', 'park', 'beach', 'market', 'restaurant', 'hotel', 'airport', 'station', 'religious_site', 'museum']) {
      expect(types.has(type as never), type).toBe(true)
    }
  })

  it('finds places by any word and returns nothing for Paris', () => {
    expect(searchSamplePlaces('mara').map((p) => p.name)).toContain('Maasai Mara National Reserve')
    expect(searchSamplePlaces('beach')).toHaveLength(2)
    expect(searchSamplePlaces('Paris')).toEqual([])
    expect(searchSamplePlaces('d')).toEqual([])
  })
})
