// Tests for the slot plan and the proverb picker.
// Exists so every lesson opens the right way and always carries a proverb from the seeded list, never an invented one.
import { describe, expect, it } from 'vitest'
import proverbs from '../../seed/proverbs.json'
import { buildSlotPlan, pickProverb } from './lessonPlan'

describe('buildSlotPlan', () => {
  it('opens a first stop with two core greetings, then the activity, then the place', () => {
    const plan = buildSlotPlan('market', ['shopping'], true)
    expect(plan.slice(0, 4)).toEqual(['core_greeting', 'core_greeting', 'bargaining', 'numbers'])
  })

  it('has no greeting slots after the first stop', () => {
    expect(buildSlotPlan('park', ['game drive'], false)).not.toContain('core_greeting')
  })

  it('falls back to the general plan for an unknown place type', () => {
    expect(buildSlotPlan('volcano', [], false)).toEqual(buildSlotPlan('other', [], false))
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
