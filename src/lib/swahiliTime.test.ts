// Tests for the six hour shift between a clock and Swahili time.
// Exists because the whole point of the section is that 7 am is hour one, and an off by one would teach the wrong time.
import { describe, expect, it } from 'vitest'
import { clockLabel, partOfDay, swahiliHour } from './swahiliTime'

describe('swahiliHour', () => {
  it('counts the first hour of daylight, 7 am, as hour one', () => {
    expect(swahiliHour(7)).toEqual({ hour: 1, part: 'asubuhi' })
  })

  it('calls noon hour six and 6 pm hour twelve', () => {
    expect(swahiliHour(12).hour).toBe(6)
    expect(swahiliHour(18).hour).toBe(12)
  })

  it('starts the count again at nightfall, so 7 pm is hour one of the night', () => {
    expect(swahiliHour(19)).toEqual({ hour: 1, part: 'usiku' })
    expect(swahiliHour(0).hour).toBe(6)
  })

  it('is always six hours away from the clock, for every hour of the day', () => {
    for (let h = 0; h < 24; h++) {
      const clock12 = h % 12 === 0 ? 12 : h % 12
      const gap = Math.abs(swahiliHour(h).hour - clock12)
      expect(gap).toBe(6)
    }
  })
})

describe('partOfDay and clockLabel', () => {
  it('splits the day into five parts', () => {
    expect([5, 9, 13, 17, 22, 2].map(partOfDay)).toEqual(['alfajiri', 'asubuhi', 'mchana', 'jioni', 'usiku', 'usiku'])
  })

  it('writes clock hours the usual way', () => {
    expect([0, 7, 12, 19].map(clockLabel)).toEqual(['12:00 am', '7:00 am', '12:00 pm', '7:00 pm'])
  })
})
