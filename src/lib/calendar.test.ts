// Tests for the calendar arithmetic: month grids, month stepping, labels and the trip range.
// Exists because an off by one here would put a stop on the wrong day of someone's trip.
import { describe, expect, it } from 'vitest'
import { addMonths, dayLabel, isInRange, monthGrid, monthOf, monthTitle, toIso, todayIso } from './calendar'

describe('monthGrid', () => {
  it('starts October 2026 on a Thursday, with three blanks before it', () => {
    const weeks = monthGrid({ year: 2026, month: 10 })
    expect(weeks[0]).toEqual([null, null, null, '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04'])
    expect(weeks[1][0]).toBe('2026-10-05')
  })

  it('always makes full rows of seven and holds every day once', () => {
    for (const month of [1, 2, 6, 11]) {
      const weeks = monthGrid({ year: 2027, month })
      expect(weeks.every((week) => week.length === 7)).toBe(true)
      const days = weeks.flat().filter(Boolean)
      expect(new Set(days).size).toBe(days.length)
    }
    expect(monthGrid({ year: 2027, month: 2 }).flat().filter(Boolean)).toHaveLength(28)
  })

  it('gives February 29 days in a leap year', () => {
    expect(monthGrid({ year: 2028, month: 2 }).flat().filter(Boolean)).toHaveLength(29)
  })

  it('needs no blanks when the month starts on a Monday', () => {
    expect(monthGrid({ year: 2027, month: 2 })[0][0]).toBe('2027-02-01')
  })
})

describe('addMonths', () => {
  it('steps across the end and the start of a year', () => {
    expect(addMonths({ year: 2026, month: 12 }, 1)).toEqual({ year: 2027, month: 1 })
    expect(addMonths({ year: 2027, month: 1 }, -1)).toEqual({ year: 2026, month: 12 })
    expect(addMonths({ year: 2026, month: 10 }, -10)).toEqual({ year: 2025, month: 12 })
  })
})

describe('labels', () => {
  it('names the month and the day in plain words', () => {
    expect(monthTitle({ year: 2026, month: 10 })).toBe('October 2026')
    expect(dayLabel('2026-10-05', 2026)).toBe('Mon 5 Oct')
  })

  it('adds the year only when it is not this year', () => {
    expect(dayLabel('2027-01-02', 2026)).toBe('Sat 2 Jan 2027')
  })

  it('pads and reads dates', () => {
    expect(toIso(2026, 3, 7)).toBe('2026-03-07')
    expect(monthOf('2026-03-07')).toEqual({ year: 2026, month: 3 })
    expect(todayIso(new Date(2026, 8, 21, 23, 30))).toBe('2026-09-21')
  })
})

describe('isInRange', () => {
  it('includes both ends of the trip', () => {
    expect(isInRange('2026-10-05', '2026-10-05', '2026-10-11')).toBe(true)
    expect(isInRange('2026-10-11', '2026-10-05', '2026-10-11')).toBe(true)
    expect(isInRange('2026-10-12', '2026-10-05', '2026-10-11')).toBe(false)
  })

  it('tints nothing when the trip has no dates', () => {
    expect(isInRange('2026-10-05', null, '2026-10-11')).toBe(false)
  })
})
