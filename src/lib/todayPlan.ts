// Works out what to show a traveller today: the stops on today's date, or the next stop coming, or how far off the trip is.
// Exists so the Today card is a pure decision that can be tested for every day of a trip, and the component only draws it.
import type { StopRow } from './types'

export type TodayPlan =
  | { kind: 'no_dates' }
  | { kind: 'before'; daysUntil: number; first: StopRow | null }
  | { kind: 'today'; stops: StopRow[] }
  | { kind: 'between'; next: StopRow; daysUntil: number }
  | { kind: 'after' }

function daysBetween(fromIso: string, toIso: string): number {
  return Math.round((Date.parse(toIso + 'T00:00:00Z') - Date.parse(fromIso + 'T00:00:00Z')) / 86400000)
}

export function todayPlan(stops: StopRow[], tripStart: string | null, tripEnd: string | null, todayIso: string): TodayPlan {
  const dated = stops.filter((s) => s.visit_date).sort((x, y) => x.visit_date!.localeCompare(y.visit_date!))
  const start = tripStart ?? dated[0]?.visit_date ?? null
  const end = tripEnd ?? dated[dated.length - 1]?.visit_date ?? null
  if (!start || !end) return { kind: 'no_dates' }
  if (todayIso < start) return { kind: 'before', daysUntil: daysBetween(todayIso, start), first: dated[0] ?? null }
  if (todayIso > end) return { kind: 'after' }
  const today = dated.filter((s) => s.visit_date === todayIso)
  if (today.length > 0) return { kind: 'today', stops: today }
  const next = dated.find((s) => s.visit_date! > todayIso)
  if (next) return { kind: 'between', next, daysUntil: daysBetween(todayIso, next.visit_date!) }
  return { kind: 'today', stops: [] }
}
