// The hands-on exercises: match the pairs, build the sentence from word tiles, and type the answer.
// Exists apart from quiz.ts to keep each file short. Pure builders. Checking a typed answer lives in checkTyped.ts.
import type { Phrase } from './types'
import { shuffle, splitWord } from './quizChoice'

export interface MatchExercise {
  kind: 'match'
  id: string
  part: 1 | 2 | 3
  phraseIds: string[]
  instruction: string
  pairs: Array<{ phraseId: string; swahili: string; english: string }>
  // The English side, shuffled, as phrase ids.
  englishOrder: string[]
  reveal: string
}

export interface BuildExercise {
  kind: 'build'
  id: string
  part: 1 | 2 | 3
  phraseIds: string[]
  instruction: string
  english: string
  // The words in order, without punctuation. full is the sentence as the bank has it, shown once answered.
  answer: string[]
  full: string
  tiles: string[]
  reveal: string
}

export interface TypeExercise {
  kind: 'type'
  id: string
  part: 1 | 2 | 3
  phraseIds: string[]
  instruction: string
  english: string
  answer: string
  pronunciation: string
  reveal: string
}

// Up to five pairs. Two phrases with the same English or the same Swahili would be unfair, so only distinct ones go in.
export function matchExercise(phrases: Phrase[], random: () => number): MatchExercise | null {
  const chosen: Phrase[] = []
  for (const phrase of shuffle(phrases, random)) {
    if (chosen.some((c) => c.english === phrase.english || c.swahili === phrase.swahili)) continue
    chosen.push(phrase)
    if (chosen.length === 5) break
  }
  if (chosen.length < 3) return null
  return {
    kind: 'match', id: `match:${chosen.map((p) => p.id).join('+')}`, part: 1, phraseIds: chosen.map((p) => p.id),
    instruction: 'Match each phrase to its meaning', reveal: '',
    pairs: chosen.map((p) => ({ phraseId: p.id, swahili: p.swahili, english: p.english })),
    englishOrder: shuffle(chosen.map((p) => p.id), random),
  }
}

function canBuild(phrase: Phrase): boolean {
  return !phrase.swahili.includes('/') && phrase.swahili.split(' ').length >= 2
}

// The phrase's own words plus two or three words from other phrases, shuffled.
export function buildExercise(phrase: Phrase, others: Phrase[], random: () => number): BuildExercise | null {
  if (!canBuild(phrase)) return null
  const answer = phrase.swahili.split(' ').map((w) => splitWord(w).core)
  const own = new Set(answer.map((w) => w.toLowerCase()))
  const extras: string[] = []
  for (const word of shuffle(others.filter(canBuild).flatMap((p) => p.swahili.split(' ').map((w) => splitWord(w).core)), random)) {
    if (word.length < 2 || own.has(word.toLowerCase()) || extras.some((e) => e.toLowerCase() === word.toLowerCase())) continue
    extras.push(word)
    if (extras.length === (answer.length <= 3 ? 3 : 2)) break
  }
  return {
    kind: 'build', id: `build:${phrase.id}`, part: 3, phraseIds: [phrase.id], instruction: 'Build this in Swahili', reveal: `${phrase.swahili} · ${phrase.english}`,
    english: phrase.english, answer, full: phrase.swahili, tiles: shuffle([...answer, ...extras], random),
  }
}

// Typing suits short answers. Pairs like "Kushoto / Kulia" are left to the other exercises.
export function typeExercise(phrase: Phrase): TypeExercise | null {
  if (phrase.swahili.includes('/') || phrase.swahili.split(' ').length > 3) return null
  return { kind: 'type', id: `type:${phrase.id}`, part: 3, phraseIds: [phrase.id], instruction: 'Type this in Swahili', reveal: `${phrase.swahili} · ${phrase.english}`, english: phrase.english, answer: phrase.swahili, pronunciation: phrase.pronunciation }
}
