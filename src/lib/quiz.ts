// Builds a lesson's quiz: four rounds that test each phrase from a different side.
// Exists as a pure function so the quiz can be tested without rendering. It only ever uses Swahili that is already in the bank.
import type { Phrase } from './types'

export type QuestionKind = 'meaning' | 'recall' | 'sounds_like' | 'fill_gap'

export interface QuizQuestion {
  id: string
  phraseId: string
  kind: QuestionKind
  prompt: string
  promptLang: 'sw' | 'en' | 'none'
  // Fill the gap shows the English meaning under the sentence.
  hint?: string
  options: string[]
  optionLang: 'sw' | 'en'
  correctIndex: number
}

export const ROUNDS: Array<{ kind: QuestionKind; title: string; instruction: string }> = [
  { kind: 'meaning', title: 'What it means', instruction: 'What does this mean?' },
  { kind: 'recall', title: 'Say it in Swahili', instruction: 'How do you say this in Swahili?' },
  { kind: 'sounds_like', title: 'Sounds like', instruction: 'Which phrase is said like this?' },
  { kind: 'fill_gap', title: 'Fill the gap', instruction: 'Which word is missing?' },
]

// Fisher-Yates shuffle. The random source is an argument so tests can be repeatable.
function shuffle<T>(items: T[], random: () => number): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

// The right answer plus up to three different wrong ones, shuffled. Null if there is nothing wrong to offer.
function makeOptions(correct: string, wrongCandidates: string[], random: () => number) {
  const seen = new Set([correct.toLowerCase()])
  const wrong: string[] = []
  for (const candidate of shuffle(wrongCandidates, random)) {
    if (seen.has(candidate.toLowerCase())) continue
    seen.add(candidate.toLowerCase())
    wrong.push(candidate)
    if (wrong.length === 3) break
  }
  if (wrong.length === 0) return null
  const options = shuffle([correct, ...wrong], random)
  return { options, correctIndex: options.indexOf(correct) }
}

// Splits "bei," into the word and the punctuation after it.
function splitWord(word: string): { core: string; trail: string } {
  const match = word.match(/^(.*?)([?!.,]*)$/)
  return { core: match?.[1] ?? word, trail: match?.[2] ?? '' }
}

// Words that can fill a gap: three letters or more, from phrases that are one sentence and not an "a / b" pair.
function gapWords(phrase: Phrase, firstWord: boolean): string[] {
  if (phrase.swahili.includes('/')) return []
  return phrase.swahili.split(' ').filter((_, i) => (i === 0) === firstWord).map((w) => splitWord(w).core).filter((w) => w.length >= 3)
}

function fillGapQuestion(phrase: Phrase, pool: Phrase[], random: () => number): QuizQuestion | null {
  const words = phrase.swahili.split(' ')
  if (words.length < 2 || phrase.swahili.includes('/')) return null
  const candidates = words.map((_, i) => i).filter((i) => splitWord(words[i]).core.length >= 3)
  if (candidates.length === 0) return null
  const gapIndex = candidates[Math.floor(random() * candidates.length)]
  const { core, trail } = splitWord(words[gapIndex])
  // Wrong words come from the same position in other phrases, so capital letters never give the answer away.
  const wrongWords = pool.filter((p) => p.id !== phrase.id).flatMap((p) => gapWords(p, gapIndex === 0))
  const built = makeOptions(core, wrongWords, random)
  if (!built) return null
  const sentence = words.map((w, i) => (i === gapIndex ? '____' + trail : w)).join(' ')
  return { id: `fill_gap:${phrase.id}`, phraseId: phrase.id, kind: 'fill_gap', prompt: sentence, promptLang: 'sw', hint: phrase.english, optionLang: 'sw', ...built }
}

// phrases are the ones being taught. pool is where wrong answers come from, ideally the whole bank.
export function buildQuiz(phrases: Phrase[], pool: Phrase[] = phrases, random: () => number = Math.random): QuizQuestion[] {
  const others = (phrase: Phrase) => [...phrases, ...pool].filter((p) => p.id !== phrase.id)
  const questions: QuizQuestion[] = []

  for (const phrase of shuffle(phrases, random)) {
    const built = makeOptions(phrase.english, others(phrase).map((p) => p.english), random)
    if (built) questions.push({ id: `meaning:${phrase.id}`, phraseId: phrase.id, kind: 'meaning', prompt: phrase.swahili, promptLang: 'sw', optionLang: 'en', ...built })
  }
  for (const phrase of shuffle(phrases, random)) {
    const built = makeOptions(phrase.swahili, others(phrase).map((p) => p.swahili), random)
    if (built) questions.push({ id: `recall:${phrase.id}`, phraseId: phrase.id, kind: 'recall', prompt: phrase.english, promptLang: 'en', optionLang: 'sw', ...built })
  }
  for (const phrase of shuffle(phrases.filter((p) => p.pronunciation), random).slice(0, 4)) {
    const built = makeOptions(phrase.swahili, others(phrase).map((p) => p.swahili), random)
    if (built) questions.push({ id: `sounds_like:${phrase.id}`, phraseId: phrase.id, kind: 'sounds_like', prompt: phrase.pronunciation, promptLang: 'none', optionLang: 'sw', ...built })
  }
  let gaps = 0
  for (const phrase of shuffle(phrases, random)) {
    if (gaps === 4) break
    const question = fillGapQuestion(phrase, [...phrases, ...pool], random)
    if (question) {
      questions.push(question)
      gaps++
    }
  }
  return questions
}
