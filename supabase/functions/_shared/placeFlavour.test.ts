// Tests for reading Google's detailed place types into a lesson flavour.
// Exists so the most specific type wins and an unknown type quietly falls back to the broad kind.
import { describe, expect, it } from 'vitest'
import { flavourFor } from './placeFlavour'

describe('flavourFor', () => {
  it('prefers the most specific type over the broad one', () => {
    expect(flavourFor(['restaurant', 'coffee_shop', 'food'])?.noun).toBe('a coffee house')
    expect(flavourFor(['point_of_interest', 'national_park', 'park'])?.noun).toBe('a national park')
    expect(flavourFor(['lodging', 'resort_hotel'])?.noun).toBe('a resort')
  })
  it('gives a note, tags and slots that suit the place', () => {
    const mall = flavourFor(['shopping_mall'])
    expect(mall?.know[0]).toMatch(/printed and fixed/)
    expect(mall?.slots).toContain('price')
    expect(mall?.tags).not.toContain('bargaining')
    expect(flavourFor(['gift_shop'])?.slots).toContain('bargaining')
  })
  it('names the everyday places rather than their broad kind', () => {
    expect(flavourFor(['pharmacy', 'drugstore', 'store'])?.noun).toBe('a pharmacy')
    expect(flavourFor(['university'])?.noun).toBe('a university')
    expect(flavourFor(['atm'])?.noun).toBe('a cash machine')
    expect(flavourFor(['embassy'])?.noun).toBe('an embassy')
    expect(flavourFor(['police'])?.noun).toBe('a police station')
  })

  it('has no flavour for a plain type or an empty list', () => {
    expect(flavourFor(['restaurant', 'food'])).toBeNull()
    expect(flavourFor([])).toBeNull()
    expect(flavourFor(null)).toBeNull()
  })
  it('replaces the broad kind where it would contradict it, and says what to keep out', () => {
    expect(flavourFor(['shopping_mall'])?.what).toMatch(/fixed prices/)
    expect(flavourFor(['shopping_mall'])?.avoid).toEqual(['bargaining'])
    expect(flavourFor(['shopping_mall'])?.replacesKind).toBe(true)
    expect(flavourFor(['supermarket'])?.noun).toBe('a supermarket')
    expect(flavourFor(['national_park'])?.what).toBeUndefined()
    expect(flavourFor(['national_park'])?.replacesKind).toBeUndefined()
  })

  it('never writes Swahili of its own', () => {
    const swahili = /\b(chai|kahawa|ugali|nyama|asante|jambo|karibu|pole)\b/i
    for (const types of [['coffee_shop'], ['national_park'], ['mosque'], ['bus_station'], ['seafood_restaurant']]) {
      for (const line of flavourFor(types)!.know) expect(line).not.toMatch(swahili)
    }
  })
})
