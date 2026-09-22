// The Swahili words the "telling time" screen needs: the hour and minute numbers, the parts of the day, and the words that join them.
// Exists apart from the seed phrases because they were added later. Nevin reviewed the words and every recording on 22 September 2026.
import type { PartOfDay, SwahiliTime } from '../../lib/swahiliTime'

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

// The clock moves in steps of five, so these are all the minute numbers it can need. Quarter and half have their own words.
const MINUTE_WORDS: Record<number, string> = { 5: 'tano', 10: 'kumi', 20: 'ishirini', 25: 'ishirini na tano' }

// "saa mbili na robo asubuhi": the word for hour, the hour number, the minutes, then the part of the day.
// na adds minutes to the hour. kasoro takes them away from the hour that is coming.
export function sayTime({ hour, part, kind, minutes }: SwahiliTime): string {
  const base = `saa ${HOUR_WORDS[hour - 1]}`
  const middle = {
    exact: '',
    past: ` na dakika ${MINUTE_WORDS[minutes]}`,
    quarter: ' na robo',
    half: ' na nusu',
    quarterTo: ' kasorobo',
    to: ` kasoro dakika ${MINUTE_WORDS[minutes]}`,
  }[kind]
  return `${base}${middle} ${part}`
}

// How to say each word, in the phrasebook's style: syllables split by hyphens, the stressed one in capitals.
// Swahili stresses the second to last syllable. The guides for one to ten, nusu, ngapi and asubuhi are the teacher reviewed ones from the seed phrases.
const SAY: Record<string, string> = {
  saa: 'SA-a', na: 'na', dakika: 'da-KI-ka', robo: 'RO-bo', nusu: 'NU-su', kasorobo: 'ka-so-RO-bo', kasoro: 'ka-SO-ro', ngapi: 'n-GA-pi',
  moja: 'MO-ja', mbili: 'm-BI-li', tatu: 'TA-tu', nne: 'N-ne', tano: 'TA-no', sita: 'SI-ta', saba: 'SA-ba', nane: 'NA-ne', tisa: 'TI-sa', kumi: 'KU-mi', ishirini: 'i-shi-RI-ni',
  alfajiri: 'al-fa-JI-ri', asubuhi: 'a-su-BU-hi', mchana: 'm-CHA-na', jioni: 'ji-O-ni', usiku: 'u-SI-ku',
}

// "SA-a m-BI-li na RO-bo a-su-BU-hi". A word with no guide is left as it is written, so nothing is ever dropped.
export function pronounce(swahili: string): string {
  return swahili.split(' ').map((word) => SAY[word.toLowerCase().replace(/[?.,]/g, '')] ?? word).join(' ')
}
