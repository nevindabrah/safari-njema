// Tests for kanga design picking.
// Exists so a proverb's cloth never changes between visits, and the seeded proverbs do not all look alike.
import { describe, expect, it } from 'vitest'
import proverbs from '../../supabase/seed/proverbs.json'
import { COLOURWAYS, kangaDesignFor } from './kangaDesigns'

describe('kangaDesignFor', () => {
  it('always gives the same design for the same proverb', () => {
    expect(kangaDesignFor('Haba na haba hujaza kibaba')).toEqual(kangaDesignFor('Haba na haba hujaza kibaba'))
  })

  it('never uses the same motif for the border and the field', () => {
    for (const p of proverbs) {
      const design = kangaDesignFor(p.swahili)
      expect(design.borderMotif).not.toBe(design.fieldMotif)
      expect(COLOURWAYS).toContain(design.colourway)
    }
  })

  it('uses every colourway across the seeded proverbs', () => {
    const used = new Set(proverbs.map((p) => kangaDesignFor(p.swahili).colourway.name))
    expect(used.size).toBe(COLOURWAYS.length)
  })

  it('gives the three demo stops three different cloths', () => {
    const demo = ['Kizuri chajiuza, kibaya chajitembeza', 'Maji ya kifuu ni bahari ya chungu', 'Kuishi kwingi ni kuona mengi']
    expect(new Set(demo.map((p) => kangaDesignFor(p).colourway.name)).size).toBe(3)
  })
})
