// The date arithmetic behind the app's own calendar: the grid of days in a month, stepping between months, and labels.
// Exists so DatePicker only draws. Dates are "2026-10-05" strings and all maths is done in UTC, so no time zone can shift a day.

export interface Month {
  year: number
  // 1 for January to 12 for December.
  month: number
}

const pad = (n: number) => String(n).padStart(2, '0')

export function toIso(year: number, month: number, day: number): string {
  return `${year}-${pad(month)}-${pad(day)}`
}

export function monthOf(iso: string): Month {
  return { year: Number(iso.slice(0, 4)), month: Number(iso.slice(5, 7)) }
}

export function todayIso(now = new Date()): string {
  return toIso(now.getFullYear(), now.getMonth() + 1, now.getDate())
}

export function addMonths({ year, month }: Month, by: number): Month {
  const index = year * 12 + (month - 1) + by
  return { year: Math.floor(index / 12), month: (index % 12) + 1 }
}

// The month as rows of seven, Monday first, as calendars in Kenya are printed. Empty corners are null.
export function monthGrid({ year, month }: Month): Array<Array<string | null>> {
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate()
  // getUTCDay counts from Sunday as 0. Shifting by six makes Monday 0.
  const blanksBefore = (new Date(Date.UTC(year, month - 1, 1)).getUTCDay() + 6) % 7
  const cells: Array<string | null> = Array(blanksBefore).fill(null)
  for (let day = 1; day <= daysInMonth; day++) cells.push(toIso(year, month, day))
  while (cells.length % 7 !== 0) cells.push(null)
  const weeks: Array<Array<string | null>> = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return weeks
}

export function monthTitle({ year, month }: Month): string {
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' })
}

// "Mon 5 Oct". The year is added only when it is not this year, to keep the button short.
export function dayLabel(iso: string, thisYear = new Date().getFullYear()): string {
  const { year, month } = monthOf(iso)
  const date = new Date(Date.UTC(year, month - 1, Number(iso.slice(8, 10))))
  const text = date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })
  return year === thisYear ? text : `${text} ${year}`
}

// True when the day falls inside the trip, so the calendar can tint those days. Either end may be missing.
export function isInRange(iso: string, start: string | null, end: string | null): boolean {
  if (!start || !end) return false
  return iso >= start && iso <= end
}
