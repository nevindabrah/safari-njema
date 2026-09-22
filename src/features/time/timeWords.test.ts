// Tests that every time the clock can show has Swahili words and a full pronunciation guide.
// Exists because a missing minute word would print "undefined" on the screen, and a missing guide would silently show plain spelling.
import { describe, expect, it } from 'vitest'
import { swahiliTime } from '../../lib/swahiliTime'
import { ASK_THE_TIME, pronounce, sayTime } from './timeWords'

describe('sayTime and pronounce', () => {
  it('covers all 288 times of the day in steps of five minutes', () => {
    const seen = new Set<string>()
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 5) {
        const said = sayTime(swahiliTime(hour, minute))
        expect(said).not.toContain('undefined')
        for (const word of pronounce(said).split(' ')) expect(word === 'na' || /[A-Z]/.test(word)).toBe(true)
        seen.add(said)
      }
    }
    expect(seen.size).toBe(288)
  })

  it('writes the guide in the phrasebook style', () => {
    expect(pronounce(sayTime(swahiliTime(8, 15)))).toBe('SA-a m-BI-li na RO-bo a-su-BU-hi')
    expect(pronounce(ASK_THE_TIME.swahili)).toBe('SA-a n-GA-pi')
  })
})
