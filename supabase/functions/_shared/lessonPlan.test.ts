// Tests for the slot plan and the proverb picker.
// Exists so every lesson opens the right way and always carries a proverb from the seeded list, never an invented one.
import { describe, expect, it } from 'vitest'
import proverbs from '../../seed/proverbs.json'
import { buildSlotPlan, pickProverb } from './lessonPlan'

describe('buildSlotPlan', () => {
  it('opens a first stop with two core greetings, then the activity, then the place', () => {
    const plan = buildSlotPlan({ placeType: 'market', activities: ['shopping'], region: 'nairobi', firstStop: true })
    expect(plan.slice(0, 4)).toEqual(['core_greeting', 'core_greeting', 'bargaining', 'numbers'])
  })

  it('has no greeting slots after the first stop', () => {
    expect(buildSlotPlan({ placeType: 'park', activities: ['game drive'], region: 'nairobi', firstStop: false })).not.toContain('core_greeting')
  })

  it('falls back to the general plan for an unknown place type', () => {
    expect(buildSlotPlan({ placeType: 'volcano', activities: [], region: 'nairobi', firstStop: false })).toEqual(buildSlotPlan({ placeType: 'other', activities: [], region: 'nairobi', firstStop: false }))
  })

  it('asks for what Google says the place really is before the broad kind', () => {
    const plan = buildSlotPlan({ placeType: 'restaurant', activities: [], region: 'nairobi', firstStop: false, googleTypes: ['restaurant', 'seafood_restaurant'] })
    expect(plan.slice(0, 2)).toEqual(['price', 'food'])
    expect(buildSlotPlan({ placeType: 'restaurant', activities: [], region: 'nairobi', firstStop: false }).slice(0, 2)).toEqual(['ordering', 'ordering'])
  })

  it('adds a coastal greeting on the coast, after the place itself, and never twice', () => {
    const coastal = buildSlotPlan({ placeType: 'restaurant', activities: [], region: 'coast', firstStop: false })
    expect(coastal[coastal.length - 1]).toBe('coastal_greeting')
    expect(coastal[0]).toBe('ordering')
    const beach = buildSlotPlan({ placeType: 'beach', activities: [], region: 'coast', firstStop: false })
    expect(beach.filter((s) => s === 'coastal_greeting')).toHaveLength(1)
    expect(buildSlotPlan({ placeType: 'restaurant', activities: [], region: 'nairobi', firstStop: false })).not.toContain('coastal_greeting')
  })
})

describe('pickProverb', () => {
  it('finds a seeded proverb for every kind of place', () => {
    const seeded = new Set(proverbs.map((p) => p.swahili))
    for (const placeType of ['city', 'park', 'beach', 'market', 'restaurant', 'hotel', 'airport', 'station', 'religious_site', 'museum', 'other']) {
      const proverb = pickProverb(proverbs, placeType)
      expect(proverb, placeType).not.toBeNull()
      expect(seeded.has(proverb!.swahili)).toBe(true)
    }
  })

  it('matches the market and the coast to their own proverbs', () => {
    expect(pickProverb(proverbs, 'market')!.themes).toContain('market')
    expect(pickProverb(proverbs, 'beach')!.themes).toContain('coast')
  })

  it('returns nothing when there are no proverbs', () => {
    expect(pickProverb([], 'market')).toBeNull()
  })
})
