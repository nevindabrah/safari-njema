// Tests for the quiz builder.
// Exists so every question has exactly one right answer, no repeated options, and only real bank words.
import { describe, expect, it } from 'vitest'
import { buildQuiz, ROUNDS } from './quiz'
import type { Phrase } from './types'

function phrase(id: string, swahili: string, english: string, pronunciation = 'x-X'): Phrase {
  return { id, swahili, pronunciation, english, tags: [], verified: false }
}

const lesson: Phrase[] = [
  phrase('a', 'Alpha beta gamma', 'A en'),
  phrase('b', 'Delta epsilon', 'B en'),
  phrase('c', 'Zeta / Eta', 'C en'),
  phrase('d', 'Theta', 'D en'),
]
const pool: Phrase[] = [...lesson, phrase('p1', 'Iota kappa lambda', 'P1 en'), phrase('p2', 'Omicron sigma', 'P2 en'), phrase('p3', 'Omega, upsilon', 'P3 en')]

// A tiny seeded random so tests are repeatable.
function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

describe('buildQuiz', () => {
  it('asks about every phrase in both directions, in round order', () => {
    const quiz = buildQuiz(lesson, pool, seeded(1))
    expect(quiz.filter((q) => q.kind === 'meaning').map((q) => q.phraseId).sort()).toEqual(['a', 'b', 'c', 'd'])
    expect(quiz.filter((q) => q.kind === 'recall').map((q) => q.phraseId).sort()).toEqual(['a', 'b', 'c', 'd'])
    const order = ROUNDS.map((r) => r.kind)
    const kinds = quiz.map((q) => order.indexOf(q.kind))
    expect([...kinds].sort((x, y) => x - y)).toEqual(kinds)
  })

  it('gives every question one right answer and no repeated options', () => {
    for (const seed of [1, 7, 42]) {
      for (const q of buildQuiz(lesson, pool, seeded(seed))) {
        expect(new Set(q.options.map((o) => o.toLowerCase())).size).toBe(q.options.length)
        expect(q.options.length).toBeGreaterThanOrEqual(2)
        expect(q.options.length).toBeLessThanOrEqual(4)
        expect(q.correctIndex).toBeGreaterThanOrEqual(0)
        const taught = lesson.find((p) => p.id === q.phraseId)!
        if (q.kind === 'meaning') expect(q.options[q.correctIndex]).toBe(taught.english)
        if (q.kind === 'recall' || q.kind === 'sounds_like') expect(q.options[q.correctIndex]).toBe(taught.swahili)
      }
    }
  })

  it('builds fill the gap from real words only, and skips pairs and single words', () => {
    const bankWords = new Set(pool.flatMap((p) => p.swahili.split(' ').map((w) => w.replace(/[?!.,]/g, ''))))
    const gaps = buildQuiz(lesson, pool, seeded(3)).filter((q) => q.kind === 'fill_gap')
    expect(gaps.map((q) => q.phraseId).sort()).toEqual(['a', 'b'])
    for (const q of gaps) {
      expect(q.prompt).toContain('____')
      for (const option of q.options) expect(bankWords.has(option)).toBe(true)
      const taught = lesson.find((p) => p.id === q.phraseId)!
      expect(q.prompt.replace('____', q.options[q.correctIndex])).toBe(taught.swahili)
    }
  })

  it('keeps punctuation in the sentence, not in the answer', () => {
    const quiz = buildQuiz([phrase('x', 'Omega, upsilon', 'X en'), phrase('y', 'Kappa lambda', 'Y en')], pool, seeded(2))
    const gap = quiz.find((q) => q.kind === 'fill_gap' && q.phraseId === 'x')!
    expect(gap.options[gap.correctIndex]).not.toContain(',')
    expect(gap.prompt.replace('____', gap.options[gap.correctIndex])).toBe('Omega, upsilon')
  })

  it('is longer than one question per phrase', () => {
    expect(buildQuiz(lesson, pool, seeded(5)).length).toBeGreaterThanOrEqual(lesson.length * 2 + 2)
  })

  it('returns nothing when there is nothing to compare against', () => {
    expect(buildQuiz(lesson.slice(0, 1), lesson.slice(0, 1))).toEqual([])
  })
})
