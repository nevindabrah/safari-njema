// Tests for the practice builder.
// Exists so every exercise is fair: one right answer, no repeated options, only real bank words, and a mix of kinds.
import { describe, expect, it } from 'vitest'
import seed from '../../supabase/seed/phrases.json'
import { buildQuiz, type Exercise } from './quiz'
import type { Phrase } from './types'

const bank: Phrase[] = seed.map((p, i) => ({ id: String(i), swahili: p.swahili, pronunciation: p.pronunciation, english: p.english, tags: p.tags, verified: false }))
const pick = (...names: string[]) => names.map((n) => bank.find((p) => p.swahili === n)!)
const market = pick('Habari?', 'Nzuri', 'Hii ni bei gani?', 'Moja, mbili, tatu, nne, tano', 'Punguza bei, tafadhali', 'Sita, saba, nane, tisa, kumi')
const mara = pick('Simba', 'Ni mnyama gani huyo?', 'Tembo / Ndovu', 'Twiga', 'Angalia!', 'Chui')
const bankWords = new Set(bank.flatMap((p) => p.swahili.split(' ').map((w) => w.replace(/[?!.,]/g, ''))))

// A tiny seeded random so tests are repeatable.
function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}
const kindsOf = (quiz: Exercise[]) => new Set<string>(quiz.map((e) => (e.kind === 'choice' ? e.variant : e.kind)))

describe('buildQuiz', () => {
  it('mixes at least five kinds of exercise for a lesson of sentences', () => {
    const kinds = kindsOf(buildQuiz(market, bank, seeded(1)))
    for (const kind of ['meaning', 'true_false', 'match', 'recall', 'sounds_like', 'build']) expect(kinds.has(kind), kind).toBe(true)
  })

  it('uses typing for a lesson of single words', () => {
    const quiz = buildQuiz(mara, bank, seeded(2))
    expect(quiz.filter((e) => e.kind === 'type').length).toBeGreaterThanOrEqual(3)
    expect(quiz.some((e) => e.kind === 'type' && e.answer.includes('/'))).toBe(false)
  })

  it('runs the parts in order: recognise, recall, produce', () => {
    const parts = buildQuiz(market, bank, seeded(3)).map((e) => e.part)
    expect([...parts].sort()).toEqual(parts)
    expect(new Set(parts)).toEqual(new Set([1, 2, 3]))
  })

  it('grows with the number of phrases', () => {
    const four = buildQuiz(market.slice(0, 4), bank, seeded(4)).length
    const six = buildQuiz(market, bank, seeded(4)).length
    expect(four).toBeGreaterThanOrEqual(9)
    expect(six).toBeGreaterThan(four)
  })

  it('gives every choice one right answer and no repeated options', () => {
    for (const seedValue of [1, 7, 42]) {
      for (const e of buildQuiz(market, bank, seeded(seedValue))) {
        if (e.kind !== 'choice') continue
        expect(new Set(e.options.map((o) => o.toLowerCase())).size).toBe(e.options.length)
        const taught = market.find((p) => p.id === e.phraseIds[0])!
        if (e.variant === 'meaning') expect(e.options[e.correctIndex]).toBe(taught.english)
        if (e.variant === 'recall' || e.variant === 'sounds_like') expect(e.options[e.correctIndex]).toBe(taught.swahili)
        if (e.variant === 'fill_gap') expect(e.prompt.replace('____', e.options[e.correctIndex])).toBe(taught.swahili)
        if (e.variant === 'true_false') expect(e.correctIndex === 0).toBe(e.hint === taught.english)
      }
    }
  })

  it('builds tiles from real bank words that can spell the sentence', () => {
    for (const e of buildQuiz(market, bank, seeded(5))) {
      if (e.kind !== 'build') continue
      for (const tile of e.tiles) expect(bankWords.has(tile), tile).toBe(true)
      expect(e.tiles.length).toBeGreaterThan(e.answer.length)
      const left = [...e.tiles]
      for (const word of e.answer) expect(left.splice(left.indexOf(word), 1)).toEqual([word])
      expect(e.full.replace(/[?!.,]/g, '')).toBe(e.answer.join(' '))
    }
  })

  it('matches between three and five distinct pairs', () => {
    const match = buildQuiz(market, bank, seeded(6)).find((e) => e.kind === 'match')
    expect(match?.kind).toBe('match')
    if (match?.kind !== 'match') return
    expect(match.pairs.length).toBeGreaterThanOrEqual(3)
    expect(match.pairs.length).toBeLessThanOrEqual(5)
    expect([...match.englishOrder].sort()).toEqual(match.pairs.map((p) => p.phraseId).sort())
  })

  it('returns nothing when there is nothing to compare against', () => {
    expect(buildQuiz(market.slice(0, 1), market.slice(0, 1))).toEqual([])
  })
})
