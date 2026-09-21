// Turns a clock hour into the hour a Swahili speaker would say: the count starts at sunrise, six hours after the clock's.
// Exists so the "telling time" section can show any hour both ways. The part of day boundaries are a common convention, not a rule.

export type PartOfDay = 'alfajiri' | 'asubuhi' | 'mchana' | 'jioni' | 'usiku'

export interface SwahiliHour {
  // 1 to 12. Seven in the morning is 1, the first hour of daylight.
  hour: number
  part: PartOfDay
}

// hour24 is 0 to 23, as on a phone's clock.
export function swahiliHour(hour24: number): SwahiliHour {
  const clock12 = hour24 % 12 === 0 ? 12 : hour24 % 12
  const shifted = (clock12 + 6) % 12
  return { hour: shifted === 0 ? 12 : shifted, part: partOfDay(hour24) }
}

export function partOfDay(hour24: number): PartOfDay {
  if (hour24 >= 4 && hour24 < 7) return 'alfajiri'
  if (hour24 >= 7 && hour24 < 12) return 'asubuhi'
  if (hour24 >= 12 && hour24 < 16) return 'mchana'
  if (hour24 >= 16 && hour24 < 19) return 'jioni'
  return 'usiku'
}

// "7:00 am", for showing the clock side of the pair.
export function clockLabel(hour24: number): string {
  const clock12 = hour24 % 12 === 0 ? 12 : hour24 % 12
  return `${clock12}:00 ${hour24 < 12 ? 'am' : 'pm'}`
}
