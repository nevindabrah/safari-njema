// Tests for catalogue search, run against the real catalogue.
// Exists so searching by intent keeps working: "food" must find restaurants, and a typo must not find nothing.
import { describe, expect, it } from 'vitest'
import { SAMPLE_PLACES } from '../features/demo/samplePlaces'
import { CATEGORIES, searchPlaces } from './placeSearch'

const names = (query: string) => searchPlaces(SAMPLE_PLACES, query).map((p) => p.name)
const kinds = (query: string) => new Set(searchPlaces(SAMPLE_PLACES, query).map((p) => p.placeType))

describe('searchPlaces', () => {
  it('finds restaurants from words about eating', () => {
    for (const word of ['food', 'eating', 'restaurants', 'hungry', 'dinner']) {
      expect(kinds(word), word).toEqual(new Set(['restaurant']))
      expect(names(word).length, word).toBeGreaterThanOrEqual(4)
    }
  })

  it('finds other kinds of place from what people want to do', () => {
    expect(kinds('swim')).toEqual(new Set(['beach']))
    expect(kinds('animals')).toEqual(new Set(['park']))
    expect(kinds('train')).toEqual(new Set(['station']))
    expect(kinds('fly')).toEqual(new Set(['airport']))
    expect(kinds('sleep')).toEqual(new Set(['hotel']))
    expect(kinds('souvenirs')).toEqual(new Set(['market']))
  })

  it('forgives typos', () => {
    expect(kinds('restaruants')).toEqual(new Set(['restaurant']))
    expect(names('masai mara')).toContain('Maasai Mara National Reserve')
    expect(names('dianni')).toContain('Diani Beach')
  })

  it('puts a place matched by name before places matched by kind', () => {
    expect(names('market')[0]).toBe('Maasai Market')
    expect(names('giraffe')[0]).toMatch(/Giraffe/)
  })

  it('combines words: a kind of place in a part of the country', () => {
    expect(names('food mombasa')).toContain('Tamarind Mombasa')
    expect(names('food mombasa')).toEqual(['Tamarind Mombasa'])
    expect(new Set(searchPlaces(SAMPLE_PLACES, 'beach coast').map((p) => p.region))).toEqual(new Set(['coast']))
  })

  it('stays inside Kenya and ignores filler words', () => {
    expect(names('Paris')).toEqual([])
    expect(names('a')).toEqual([])
    expect(names('food in nairobi').length).toBeGreaterThan(0)
  })
})

describe('CATEGORIES', () => {
  it('puts every place in exactly one group, and leaves no group empty', () => {
    for (const place of SAMPLE_PLACES) expect(CATEGORIES.filter((c) => c.types.includes(place.placeType)), place.name).toHaveLength(1)
    for (const category of CATEGORIES) expect(SAMPLE_PLACES.some((p) => category.types.includes(p.placeType)), category.label).toBe(true)
  })
})
