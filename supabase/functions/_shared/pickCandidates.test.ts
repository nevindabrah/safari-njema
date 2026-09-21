// Tests for candidate scoring and slot filling, using a tiny made-up bank.
// Exists so the rules about greetings, Sheng and known phrases hold in code.
import { describe, expect, it } from 'vitest'
import { pickCandidates, pickTemplatePhrases, type CandidatePhrase, type CandidateContext } from './pickCandidates'

const bank: CandidatePhrase[] = [
  { id: 'g1', swahili: 'g1', pronunciation: '', english: 'hello', tags: ['basics', 'greeting', 'core_greeting'] },
  { id: 'g2', swahili: 'g2', pronunciation: '', english: 'slang hello', tags: ['basics', 'greeting'], register: 'sheng' },
  { id: 'g3', swahili: 'g3', pronunciation: '', english: 'reply', tags: ['basics', 'greeting', 'core_greeting'] },
  { id: 'n1', swahili: 'n1', pronunciation: '', english: 'one to five', tags: ['market', 'numbers'] },
  { id: 'b1', swahili: 'b1', pronunciation: '', english: 'too expensive', tags: ['market', 'bargaining'] },
  { id: 'b2', swahili: 'b2', pronunciation: '', english: 'lower the price', tags: ['market', 'bargaining', 'essential'] },
  { id: 's1', swahili: 's1', pronunciation: '', english: 'just looking', tags: ['market', 'shopping'] },
  { id: 'f1', swahili: 'f1', pronunciation: '', english: 'the menu', tags: ['food', 'ordering'] },
  { id: 'a1', swahili: 'a1', pronunciation: '', english: 'lion', tags: ['safari', 'animals'] },
  { id: 'c1', swahili: 'c1', pronunciation: '', english: 'coastal hello', tags: ['coast', 'greeting', 'coastal_greeting', 'coastal'] },
  { id: 'c2', swahili: 'c2', pronunciation: '', english: 'ocean', tags: ['coast', 'beach'] },
]

const market: CandidateContext = { placeType: 'market', activities: ['shopping'], region: 'nairobi', firstStop: true, level: 'none', knownIds: [] }
const beach: CandidateContext = { placeType: 'beach', activities: ['eating out'], region: 'coast', firstStop: false, level: 'none', knownIds: [] }

describe('pickCandidates', () => {
  it('leaves out Sheng unless it is switched on', () => {
    expect(pickCandidates(bank, market).map((p) => p.id)).not.toContain('g2')
    expect(pickCandidates(bank, { ...market, shengEnabled: true }).map((p) => p.id)).toContain('g2')
  })

  it('drops plain greetings after the first stop but keeps a coastal one at the coast', () => {
    const ids = pickCandidates(bank, beach).map((p) => p.id)
    expect(ids).not.toContain('g1')
    expect(ids).toContain('c1')
  })

  it('leaves out phrases the user already knows', () => {
    expect(pickCandidates(bank, { ...market, knownIds: ['n1'] }).map((p) => p.id)).not.toContain('n1')
  })

  it('ignores phrases that do not fit the stop', () => {
    expect(pickCandidates(bank, market).map((p) => p.id)).not.toContain('a1')
  })
})

describe('pickTemplatePhrases', () => {
  it('fills a first market stop with two greetings, then price talk and numbers', () => {
    const picked = pickTemplatePhrases(pickCandidates(bank, market), market)
    expect(picked.map((p) => p.phrase.id)).toEqual(['g1', 'g3', 'b2', 'n1', 'b1', 's1'])
    expect(picked.map((p) => p.slot)).toEqual(['core_greeting', 'core_greeting', 'bargaining', 'numbers', 'bargaining', 'shopping'])
  })

  it('puts the essential phrase first within a slot', () => {
    const picked = pickTemplatePhrases(pickCandidates(bank, market), market)
    const bargaining = picked.filter((p) => p.slot === 'bargaining').map((p) => p.phrase.id)
    expect(bargaining[0]).toBe('b2')
  })

  it('mixes food and coast for a beach stop with eating out', () => {
    const picked = pickTemplatePhrases(pickCandidates(bank, beach), beach)
    expect(picked.map((p) => p.phrase.id)).toEqual(['f1', 'c1', 'c2'])
  })
})
