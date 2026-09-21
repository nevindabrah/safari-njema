// Tests for county to region mapping.
// Exists so every county lands in a region and the name cleaning is predictable.
import { describe, expect, it } from 'vitest'
import { countyFromAddress, regionFromCounty, regionFromLatLng } from './regions'

describe('regionFromCounty', () => {
  it('handles the word County and punctuation', () => {
    expect(regionFromCounty('Nairobi County')).toBe('nairobi')
    expect(regionFromCounty("Murang'a County")).toBe('central_mt_kenya')
    expect(regionFromCounty('Taita-Taveta')).toBe('coast')
    expect(regionFromCounty('Kwale')).toBe('coast')
    expect(regionFromCounty('Narok County')).toBe('rift_valley_mara')
  })
  it('returns null for unknown names', () => {
    expect(regionFromCounty('Paris')).toBeNull()
    expect(regionFromCounty(null)).toBeNull()
  })
})

describe('regionFromLatLng', () => {
  it('places Nairobi, Diani and the Mara', () => {
    expect(regionFromLatLng(-1.2921, 36.8219)).toBe('nairobi')
    expect(regionFromLatLng(-4.2797, 39.5919)).toBe('coast')
    expect(regionFromLatLng(-1.4061, 35.0078)).toBe('rift_valley_mara')
  })
})

describe('countyFromAddress', () => {
  it('reads administrative_area_level_1', () => {
    expect(countyFromAddress([
      { longText: 'Kenya', types: ['country'] },
      { longText: 'Kwale County', types: ['administrative_area_level_1'] },
    ])).toBe('Kwale County')
  })
})
