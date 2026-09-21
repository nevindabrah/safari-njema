// The Swahili words the "telling time" section needs: the hour numbers, the parts of the day and two set phrases.
// Exists apart from the seed phrases because these were NOT in the teacher's review. The section labels them "not yet reviewed".
import type { PartOfDay } from '../../lib/swahiliTime'

// One to ten are the reviewed number words from the seed phrases. Eleven and twelve were added here and are unreviewed.
export const HOUR_WORDS = ['moja', 'mbili', 'tatu', 'nne', 'tano', 'sita', 'saba', 'nane', 'tisa', 'kumi', 'kumi na moja', 'kumi na mbili']

export const PART_WORDS: Record<PartOfDay, string> = {
  alfajiri: 'before dawn',
  asubuhi: 'in the morning',
  mchana: 'in the middle of the day',
  jioni: 'in the evening',
  usiku: 'at night',
}

export const ASK_THE_TIME = { swahili: 'Saa ngapi?', english: 'What time is it?' }

// "saa mbili asubuhi": the word for hour, the hour number, then the part of the day.
export function sayHour(hour: number, part: PartOfDay): string {
  return `saa ${HOUR_WORDS[hour - 1]} ${part}`
}
