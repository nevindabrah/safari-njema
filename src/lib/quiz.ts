// Builds the multiple choice quiz for a lesson. One question per phrase, alternating direction.
// Exists as a pure function so the quiz can be tested without rendering anything.
import type { Phrase } from './types'

export interface QuizQuestion {
  phraseId: string
  direction: 'sw_to_en' | 'en_to_sw'
  prompt: string
  options: string[]
  correctIndex: number
}

// Fisher-Yates shuffle that takes the random source as an argument so tests can be deterministic.
function shuffle<T>(items: T[], random: () => number): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function buildQuiz(phrases: Phrase[], random: () => number = Math.random): QuizQuestion[] {
  if (phrases.length < 2) return []

  return phrases.map((phrase, index) => {
    const direction = index % 2 === 0 ? 'sw_to_en' : 'en_to_sw'
    const others = shuffle(phrases.filter((p) => p.id !== phrase.id), random).slice(0, 3)
    const correct = direction === 'sw_to_en' ? phrase.english : phrase.swahili
    const wrong = others.map((p) => (direction === 'sw_to_en' ? p.english : p.swahili))
    const options = shuffle([correct, ...wrong], random)
    return {
      phraseId: phrase.id,
      direction,
      prompt: direction === 'sw_to_en' ? phrase.swahili : phrase.english,
      options,
      correctIndex: options.indexOf(correct),
    }
  })
}
