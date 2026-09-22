// Prints, as one JSON list, the Swahili for every minute of the day (1,440 times) plus "Saa ngapi?".
// Exists so generateTimeAudio.py records exactly what the app will display, using the app's own code and not a copy of it.
// Run: node scripts/listTimePhrases.ts
import { swahiliTime } from '../src/lib/swahiliTime.ts'
import { ASK_THE_TIME, sayTime } from '../src/features/time/timeWords.ts'

const phrases = new Set<string>([ASK_THE_TIME.swahili])
for (let hour = 0; hour < 24; hour++) {
  for (let minute = 0; minute < 60; minute++) phrases.add(sayTime(swahiliTime(hour, minute)))
}
console.log(JSON.stringify([...phrases]))
