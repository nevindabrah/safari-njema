// Tests for the Google type to place type mapping.
// Exists so a change to the rules cannot silently reclassify places.
import { describe, expect, it } from 'vitest'
import { PLACE_TYPE_INFO, toPlaceType } from './placeTypes'

describe('toPlaceType', () => {
  it('maps a market', () => {
    expect(toPlaceType(['market', 'point_of_interest', 'establishment'])).toBe('market')
  })
  it('maps a national reserve to park', () => {
    expect(toPlaceType(['national_park', 'tourist_attraction'])).toBe('park')
  })
  it('maps a beach', () => {
    expect(toPlaceType(['beach', 'natural_feature'])).toBe('beach')
  })
  it('prefers hotel over restaurant when both appear', () => {
    expect(toPlaceType(['restaurant', 'lodging'])).toBe('hotel')
  })
  it('maps a town', () => {
    expect(toPlaceType(['locality', 'political'])).toBe('city')
  })
  it('knows the everyday places a student needs', () => {
    expect(toPlaceType(['hospital', 'health', 'point_of_interest'])).toBe('hospital')
    expect(toPlaceType(['pharmacy', 'drugstore', 'store'])).toBe('hospital')
    expect(toPlaceType(['school', 'point_of_interest'])).toBe('school')
    expect(toPlaceType(['university'])).toBe('school')
    expect(toPlaceType(['bank', 'finance'])).toBe('bank')
    expect(toPlaceType(['atm'])).toBe('bank')
    expect(toPlaceType(['embassy'])).toBe('office')
    expect(toPlaceType(['post_office'])).toBe('office')
  })

  it('treats a plain tourist attraction as a landmark, but a named kind wins', () => {
    expect(toPlaceType(['tourist_attraction', 'point_of_interest'])).toBe('museum')
    expect(toPlaceType(['tourist_attraction', 'zoo'])).toBe('park')
  })
  it('falls back to other', () => {
    expect(toPlaceType(['point_of_interest'])).toBe('other')
  })
})

describe('PLACE_TYPE_INFO', () => {
  it('has a label and a general description for every kind of place', () => {
    for (const info of Object.values(PLACE_TYPE_INFO)) {
      expect(info.label.length).toBeGreaterThan(2)
      expect(info.about.length).toBeGreaterThan(10)
    }
  })
})
