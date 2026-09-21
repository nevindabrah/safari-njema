// Tests for stop ordering and day numbers.
// Exists so moving a stop to another day always lands it in the right place in the list.
import { describe, expect, it } from 'vitest'
import { dayNumber, orderStops } from './orderStops'

describe('orderStops', () => {
  it('sorts by date, then by the order added, with undated stops last', () => {
    const stops = [
      { id: 'a', visit_date: null, position: 1 },
      { id: 'b', visit_date: '2026-10-09', position: 2 },
      { id: 'c', visit_date: '2026-10-05', position: 3 },
      { id: 'd', visit_date: '2026-10-05', position: 4 },
      { id: 'e', visit_date: null, position: 5 },
    ]
    expect(orderStops(stops).map((s) => s.id)).toEqual(['c', 'd', 'b', 'a', 'e'])
  })

  it('does not change the list it was given', () => {
    const stops = [{ visit_date: null, position: 2 }, { visit_date: null, position: 1 }]
    orderStops(stops)
    expect(stops[0].position).toBe(2)
  })
})

describe('dayNumber', () => {
  it('counts from the first day of the trip', () => {
    expect(dayNumber('2026-10-05', '2026-10-05', '2026-10-11')).toBe(1)
    expect(dayNumber('2026-10-07', '2026-10-05', '2026-10-11')).toBe(3)
  })

  it('gives nothing outside the trip or without dates', () => {
    expect(dayNumber('2026-10-20', '2026-10-05', '2026-10-11')).toBeNull()
    expect(dayNumber('2026-10-01', '2026-10-05', null)).toBeNull()
    expect(dayNumber(null, '2026-10-05', null)).toBeNull()
    expect(dayNumber('2026-10-07', null, null)).toBeNull()
  })

  it('handles a month boundary', () => {
    expect(dayNumber('2026-11-02', '2026-10-30', null)).toBe(4)
  })
})
