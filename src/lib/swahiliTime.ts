// Turns a clock hour into the hour a Swahili speaker would say: the count starts at sunrise, six hours after the clock's.
// Exists so the "telling time" section can show any hour both ways. The part of day boundaries are a common convention, not a rule.

export type PartOfDay = 'alfajiri' | 'asubuhi' | 'mchana' | 'jioni' | 'usiku'

export interface SwahiliHour {
  hour: number
  part: PartOfDay
}

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

export function clockLabel(hour24: number, minute = 0): string {
  const clock12 = hour24 % 12 === 0 ? 12 : hour24 % 12
  return `${clock12}:${String(minute).padStart(2, '0')} ${hour24 < 12 ? 'am' : 'pm'}`
}

export type MinuteKind = 'exact' | 'past' | 'quarter' | 'half' | 'quarterTo' | 'to'

export interface SwahiliTime extends SwahiliHour {
  kind: MinuteKind
  minutes: number
}

export function swahiliTime(hour24: number, minute: number): SwahiliTime {
  const named = minute > 30 ? (hour24 + 1) % 24 : hour24
  const kind: MinuteKind = minute === 0 ? 'exact' : minute === 15 ? 'quarter' : minute === 30 ? 'half' : minute === 45 ? 'quarterTo' : minute < 30 ? 'past' : 'to'
  return { ...swahiliHour(named), kind, minutes: minute > 30 ? 60 - minute : minute }
}

export function timeInWords({ hour, kind, minutes }: SwahiliTime): string {
  if (kind === 'exact') return `hour ${hour}`
  if (kind === 'quarter') return `hour ${hour} and a quarter`
  if (kind === 'half') return `hour ${hour} and a half`
  if (kind === 'quarterTo') return `a quarter to hour ${hour}`
  return kind === 'past' ? `hour ${hour} and ${minutes} minutes` : `${minutes} minutes to hour ${hour}`
}

export function hourFromPoint(dx: number, dy: number): number {
  const degrees = (Math.atan2(dx, -dy) * 180) / Math.PI
  const hour = Math.round(((degrees + 360) % 360) / 30) % 12
  return hour === 0 ? 12 : hour
}

export function toHour24(clock12: number, pm: boolean): number {
  return (clock12 % 12) + (pm ? 12 : 0)
}

export function minuteFromPoint(dx: number, dy: number): number {
  return (hourFromPoint(dx, dy) % 12) * 5
}
