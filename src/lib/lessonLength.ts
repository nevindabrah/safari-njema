// The three lesson lengths a learner can pick, and how many phrases each one studies.
// Exists so the choice lives in one table. Lessons hold up to eight phrases in priority order, and a shorter lesson takes the first few.

export type LessonLength = 'quick' | 'standard' | 'deep'

export const LESSON_LENGTHS: Record<LessonLength, { label: string; minutes: number; phrases: number; blurb: string }> = {
  quick: { label: 'Quick', minutes: 3, phrases: 4, blurb: 'The four phrases you need most.' },
  standard: { label: 'Standard', minutes: 5, phrases: 6, blurb: 'Six phrases and a full practice.' },
  deep: { label: 'Deep', minutes: 10, phrases: 8, blurb: 'Everything for this stop, practised from every side.' },
}

const KEY = 'safari-njema-lesson-length'

export function savedLessonLength(): LessonLength {
  try {
    const value = localStorage.getItem(KEY)
    if (value === 'quick' || value === 'standard' || value === 'deep') return value
  } catch {
  }
  return 'standard'
}

export function saveLessonLength(length: LessonLength) {
  try {
    localStorage.setItem(KEY, length)
  } catch {
  }
}
