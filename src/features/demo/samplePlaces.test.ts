// Tests for test mode's sample places.
// Exists so every place in the catalogue is inside Kenya and has its own id. Searching it is tested in lib/placeSearch.test.ts.
import { describe, expect, it } from 'vitest'
import { SAMPLE_PLACES } from './samplePlaces'

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
})
