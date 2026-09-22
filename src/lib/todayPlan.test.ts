// Tests for the Today decision across a trip: before, on a stop day, on a free day, and after.
// Exists because the card is the first thing a traveller sees each morning and must never point at the wrong day.
import { describe, expect, it } from 'vitest'
import { todayPlan } from './todayPlan'
import type { StopRow } from './types'

const stop = (id: string, visit_date: string | null) => ({ id, visit_date, user_lessons: [] }) as unknown as StopRow
const stops = [stop('market', '2026-10-05'), stop('beach', '2026-10-07'), stop('mara', '2026-10-09'), stop('loose', null)]

describe('todayPlan', () => {
  it('counts down before the trip and names the first stop', () => {
    expect(todayPlan(stops, '2026-10-05', '2026-10-11', '2026-10-01')).toEqual({ kind: 'before', daysUntil: 4, first: stops[0] })
  })

  it('shows the stops on a day with stops', () => {
    expect(todayPlan(stops, '2026-10-05', '2026-10-11', '2026-10-07')).toEqual({ kind: 'today', stops: [stops[1]] })
  })

  it('points at the next stop on a free day', () => {
    expect(todayPlan(stops, '2026-10-05', '2026-10-11', '2026-10-06')).toEqual({ kind: 'between', next: stops[1], daysUntil: 1 })
  })

  it('is a quiet day after the last stop but inside the trip, and over after the trip', () => {
    expect(todayPlan(stops, '2026-10-05', '2026-10-11', '2026-10-10')).toEqual({ kind: 'today', stops: [] })
    expect(todayPlan(stops, '2026-10-05', '2026-10-11', '2026-10-12')).toEqual({ kind: 'after' })
  })

  it('uses the stop dates when the trip has none, and gives up when nothing is dated', () => {
    expect(todayPlan(stops, null, null, '2026-10-09').kind).toBe('today')
    expect(todayPlan([stop('x', null)], null, null, '2026-10-09')).toEqual({ kind: 'no_dates' })
  })
})
