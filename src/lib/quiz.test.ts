// Tests for the quiz builder.
// Exists so the quiz always has one correct answer and never repeats it as a distractor.
import { describe, expect, it } from 'vitest'
import { buildQuiz } from './quiz'
import type { Phrase } from './types'

const phrases: Phrase[] = [
  { id: 'a', swahili: 'A sw', pronunciation: '', english: 'A en', tags: [], verified: false },
  { id: 'b', swahili: 'B sw', pronunciation: '', english: 'B en', tags: [], verified: false },
  { id: 'c', swahili: 'C sw', pronunciation: '', english: 'C en', tags: [], verified: false },
  { id: 'd', swahili: 'D sw', pronunciation: '', english: 'D en', tags: [], verified: false },
  { id: 'e', swahili: 'E sw', pronunciation: '', english: 'E en', tags: [], verified: false },
]

// A tiny seeded random so tests are repeatable.
function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

describe('buildQuiz', () => {
  it('makes one question per phrase and alternates direction', () => {
    const quiz = buildQuiz(phrases, seeded(1))
    expect(quiz).toHaveLength(5)
    expect(quiz[0].direction).toBe('sw_to_en')
    expect(quiz[1].direction).toBe('en_to_sw')
  })

  it('has four options with exactly one correct answer', () => {
    for (const q of buildQuiz(phrases, seeded(7))) {
      expect(q.options).toHaveLength(4)
      expect(new Set(q.options).size).toBe(4)
      const phrase = phrases.find((p) => p.id === q.phraseId)!
      const correct = q.direction === 'sw_to_en' ? phrase.english : phrase.swahili
      expect(q.options[q.correctIndex]).toBe(correct)
    }
  })

  it('uses fewer options when there are fewer phrases', () => {
    const quiz = buildQuiz(phrases.slice(0, 3), seeded(3))
    expect(quiz[0].options).toHaveLength(3)
  })

  it('returns nothing for a single phrase', () => {
    expect(buildQuiz(phrases.slice(0, 1))).toEqual([])
  })
})
