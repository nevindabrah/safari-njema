// The Swahili words the "telling time" screen needs: the hour and minute numbers, the parts of the day, and the words that join them.
// Exists apart from the seed phrases because they were added later. Nevin reviewed the words and every recording on 22 September 2026.
import type { PartOfDay, SwahiliTime } from '../../lib/swahiliTime'

export const HOUR_WORDS = ['moja', 'mbili', 'tatu', 'nne', 'tano', 'sita', 'saba', 'nane', 'tisa', 'kumi', 'kumi na moja', 'kumi na mbili']

export const PART_WORDS: Record<PartOfDay, string> = {
  alfajiri: 'before dawn',
  asubuhi: 'in the morning',
  mchana: 'in the middle of the day',
  jioni: 'in the evening',
  usiku: 'at night',
}

export const ASK_THE_TIME = { swahili: 'Saa ngapi?', english: 'What time is it?' }

const MINUTE_WORDS: Record<number, string> = { 5: 'tano', 10: 'kumi', 20: 'ishirini', 25: 'ishirini na tano' }

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

const SAY: Record<string, string> = {
  saa: 'SA-a', na: 'na', dakika: 'da-KI-ka', robo: 'RO-bo', nusu: 'NU-su', kasorobo: 'ka-so-RO-bo', kasoro: 'ka-SO-ro', ngapi: 'n-GA-pi',
  moja: 'MO-ja', mbili: 'm-BI-li', tatu: 'TA-tu', nne: 'N-ne', tano: 'TA-no', sita: 'SI-ta', saba: 'SA-ba', nane: 'NA-ne', tisa: 'TI-sa', kumi: 'KU-mi', ishirini: 'i-shi-RI-ni',
  alfajiri: 'al-fa-JI-ri', asubuhi: 'a-su-BU-hi', mchana: 'm-CHA-na', jioni: 'ji-O-ni', usiku: 'u-SI-ku',
}

export function pronounce(swahili: string): string {
  return swahili.split(' ').map((word) => SAY[word.toLowerCase().replace(/[?.,]/g, '')] ?? word).join(' ')
}
