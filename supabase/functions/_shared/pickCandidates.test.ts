// Tests for candidate selection.
// Exists so the acceptance test's expectations about greetings and tags hold in code.
import { describe, expect, it } from 'vitest'
import { pickCandidates, pickTemplatePhrases, type CandidatePhrase, type CandidateContext } from './pickCandidates'

const bank: CandidatePhrase[] = [
  { id: 'g1', swahili: 'g1', pronunciation: '', english: 'hello', tags: ['greeting'] },
  { id: 'g2', swahili: 'g2', pronunciation: '', english: 'how are you', tags: ['greeting'] },
  { id: 'm1', swahili: 'm1', pronunciation: '', english: 'how much', tags: ['market', 'numbers'] },
  { id: 'm2', swahili: 'm2', pronunciation: '', english: 'lower the price', tags: ['bargaining', 'market'] },
  { id: 'f1', swahili: 'f1', pronunciation: '', english: 'the bill please', tags: ['food', 'money'] },
  { id: 's1', swahili: 's1', pronunciation: '', english: 'lion', tags: ['safari', 'animals'] },
  { id: 'c1', swahili: 'c1', pronunciation: '', english: 'coastal hello', tags: ['greeting', 'coastal'] },
  { id: 'h1', swahili: 'h1', pronunciation: '', english: 'help', tags: ['help'] },
]

const base: CandidateContext = { placeType: 'market', activities: ['shopping'], region: 'nairobi', firstStop: true, level: 'none', knownIds: [] }

describe('pickCandidates', () => {
  it('puts greetings and market phrases first on a first stop', () => {
    const ids = pickCandidates(bank, base).map((p) => p.id)
    expect(ids.slice(0, 4).sort()).toEqual(['g1', 'g2', 'm1', 'm2'].sort())
  })

  it('drops plain greetings on later stops but keeps a coastal one for the coast', () => {
    const ctx: CandidateContext = { ...base, placeType: 'beach', activities: ['eating out'], region: 'coast', firstStop: false }
    const ids = pickCandidates(bank, ctx).map((p) => p.id)
    expect(ids[0]).toBe('f1')
    expect(ids).toContain('c1')
    expect(ids.indexOf('c1')).toBeLessThan(ids.indexOf('g1'))
  })

  it('leaves out phrases the user already knows', () => {
    const ids = pickCandidates(bank, { ...base, knownIds: ['m1'] }).map((p) => p.id)
    expect(ids).not.toContain('m1')
  })

  it('finds safari words for a game drive', () => {
    const ctx: CandidateContext = { ...base, placeType: 'park', activities: ['game drive'], region: 'rift_valley_mara', firstStop: false }
    expect(pickCandidates(bank, ctx)[0].id).toBe('s1')
  })
})

describe('pickTemplatePhrases', () => {
  it('starts with two greetings on a first stop', () => {
    const chosen = pickTemplatePhrases(pickCandidates(bank, base), base)
    expect(chosen[0].tags).toContain('greeting')
    expect(chosen[1].tags).toContain('greeting')
    expect(chosen).toHaveLength(6)
  })
})
