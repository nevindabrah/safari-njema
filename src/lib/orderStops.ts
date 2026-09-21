// Puts a trip's stops in the order they will be visited: by date, then by the order they were added.
// Exists so changing a stop's day moves it in the list and renumbers the pins. Stops with no date go last.

interface Orderable {
  visit_date: string | null
  position: number
}

export function orderStops<T extends Orderable>(stops: T[]): T[] {
  return [...stops].sort((a, b) => {
    if (a.visit_date && b.visit_date && a.visit_date !== b.visit_date) return a.visit_date < b.visit_date ? -1 : 1
    if (a.visit_date && !b.visit_date) return -1
    if (!a.visit_date && b.visit_date) return 1
    return a.position - b.position
  })
}

// "Day 3" if the date falls inside the trip, otherwise nothing. Dates are plain YYYY-MM-DD strings.
export function dayNumber(date: string | null, tripStart: string | null, tripEnd: string | null): number | null {
  if (!date || !tripStart) return null
  if (date < tripStart || (tripEnd && date > tripEnd)) return null
  const msPerDay = 24 * 60 * 60 * 1000
  return Math.round((Date.parse(date + 'T00:00:00Z') - Date.parse(tripStart + 'T00:00:00Z')) / msPerDay) + 1
}
