// The multiple choice exercises: meaning, recall, sounds like, fill the gap, and true or false.
// Exists apart from quiz.ts to keep each file short. Every builder is pure and only uses Swahili already in the bank.
import type { Phrase } from './types'

export type ChoiceVariant = 'meaning' | 'recall' | 'sounds_like' | 'fill_gap' | 'true_false'

export interface ChoiceExercise {
  kind: 'choice'
  variant: ChoiceVariant
  id: string
  part: 1 | 2 | 3
  phraseIds: string[]
  instruction: string
  prompt: string
  promptLang: 'sw' | 'en' | 'none'
  // A line under the prompt: the English for fill the gap, the meaning to judge for true or false.
  hint?: string
  options: string[]
  optionLang: 'sw' | 'en'
  correctIndex: number
  // Shown once answered, so a wrong answer still teaches the right one.
  reveal: string
}

// Fisher-Yates shuffle. The random source is an argument so tests can be repeatable.
export function shuffle<T>(items: T[], random: () => number): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

// Splits "bei," into the word and the punctuation after it.
export function splitWord(word: string): { core: string; trail: string } {
  const match = word.match(/^(.*?)([?!.,]*)$/)
  return { core: match?.[1] ?? word, trail: match?.[2] ?? '' }
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

export function meaningExercise(phrase: Phrase, others: Phrase[], random: () => number): ChoiceExercise | null {
  const built = makeOptions(phrase.english, others.map((p) => p.english), random)
  if (!built) return null
  return { kind: 'choice', variant: 'meaning', id: `meaning:${phrase.id}`, part: 1, phraseIds: [phrase.id], reveal: `${phrase.swahili} · ${phrase.english}`, instruction: 'What does this mean?', prompt: phrase.swahili, promptLang: 'sw', optionLang: 'en', ...built }
}

export function recallExercise(phrase: Phrase, others: Phrase[], random: () => number): ChoiceExercise | null {
  const built = makeOptions(phrase.swahili, others.map((p) => p.swahili), random)
  if (!built) return null
  return { kind: 'choice', variant: 'recall', id: `recall:${phrase.id}`, part: 2, phraseIds: [phrase.id], reveal: `${phrase.swahili} · ${phrase.english}`, instruction: 'How do you say this in Swahili?', prompt: phrase.english, promptLang: 'en', optionLang: 'sw', ...built }
}

export function soundsLikeExercise(phrase: Phrase, others: Phrase[], random: () => number): ChoiceExercise | null {
  if (!phrase.pronunciation) return null
  const built = makeOptions(phrase.swahili, others.map((p) => p.swahili), random)
  if (!built) return null
  return { kind: 'choice', variant: 'sounds_like', id: `sounds_like:${phrase.id}`, part: 2, phraseIds: [phrase.id], reveal: `${phrase.swahili} · ${phrase.english}`, instruction: 'Which phrase is said like this?', prompt: phrase.pronunciation, promptLang: 'none', optionLang: 'sw', ...built }
}

// Half the time the meaning shown is the real one, half the time it belongs to another phrase.
export function trueFalseExercise(phrase: Phrase, others: Phrase[], random: () => number): ChoiceExercise | null {
  const wrongMeanings = others.map((p) => p.english).filter((e) => e.toLowerCase() !== phrase.english.toLowerCase())
  if (wrongMeanings.length === 0) return null
  const showTruth = random() < 0.5
  const shown = showTruth ? phrase.english : wrongMeanings[Math.floor(random() * wrongMeanings.length)]
  return {
    kind: 'choice', variant: 'true_false', id: `true_false:${phrase.id}`, part: 1, phraseIds: [phrase.id], reveal: `${phrase.swahili} · ${phrase.english}`,
    instruction: 'Does it mean this?', prompt: phrase.swahili, promptLang: 'sw', hint: shown,
    options: ['Yes, that is what it means', 'No, it means something else'], optionLang: 'en', correctIndex: showTruth ? 0 : 1,
  }
}

// Words that can fill a gap: three letters or more, from phrases that are one sentence and not an "a / b" pair.
function gapWords(phrase: Phrase, firstWord: boolean): string[] {
  if (phrase.swahili.includes('/')) return []
  return phrase.swahili.split(' ').filter((_, i) => (i === 0) === firstWord).map((w) => splitWord(w).core).filter((w) => w.length >= 3)
}

export function fillGapExercise(phrase: Phrase, others: Phrase[], random: () => number): ChoiceExercise | null {
  const words = phrase.swahili.split(' ')
  if (words.length < 2 || phrase.swahili.includes('/')) return null
  const candidates = words.map((_, i) => i).filter((i) => splitWord(words[i]).core.length >= 3)
  if (candidates.length === 0) return null
  const gapIndex = candidates[Math.floor(random() * candidates.length)]
  const { core, trail } = splitWord(words[gapIndex])
  // Wrong words come from the same position in other phrases, so capital letters never give the answer away.
  const built = makeOptions(core, others.flatMap((p) => gapWords(p, gapIndex === 0)), random)
  if (!built) return null
  const sentence = words.map((w, i) => (i === gapIndex ? '____' + trail : w)).join(' ')
  return { kind: 'choice', variant: 'fill_gap', id: `fill_gap:${phrase.id}`, part: 3, phraseIds: [phrase.id], reveal: `${phrase.swahili} · ${phrase.english}`, instruction: 'Which word is missing?', prompt: sentence, promptLang: 'sw', hint: phrase.english, optionLang: 'sw', ...built }
}
