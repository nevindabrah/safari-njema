// Runs phrase selection against the real seed for the three stops in the Phase 1 acceptance test.
// Exists so the template path is proven to give three clearly different lessons before anything goes live.
import { describe, expect, it } from 'vitest'
import seed from '../../seed/phrases.json'
import { pickCandidates, pickTemplatePhrases, type CandidatePhrase, type CandidateContext } from './pickCandidates'
import { buildTemplateLesson } from './template'
import { lessonSchema } from './lessonSchema'

// The seed has no ids yet, so give each phrase a stable fake uuid for the test.
const bank: CandidatePhrase[] = seed.map((p, i) => ({
  id: `00000000-0000-4000-8000-${String(i).padStart(12, '0')}`,
  swahili: p.swahili,
  pronunciation: p.pronunciation,
  english: p.english,
  tags: p.tags,
}))

function lessonFor(ctx: CandidateContext, placeName: string) {
  const chosen = pickTemplatePhrases(pickCandidates(bank, ctx), ctx)
  const lesson = buildTemplateLesson({ placeName, placeType: ctx.placeType, region: ctx.region, firstStop: ctx.firstStop, phrases: chosen })
  return { lesson, chosen }
}

const market: CandidateContext = { placeType: 'market', activities: ['shopping'], region: 'nairobi', firstStop: true, level: 'none', knownIds: [] }
const beach: CandidateContext = { placeType: 'beach', activities: ['eating out'], region: 'coast', firstStop: false, level: 'none', knownIds: [] }
const mara: CandidateContext = { placeType: 'park', activities: ['game drive'], region: 'rift_valley_mara', firstStop: false, level: 'none', knownIds: [] }

describe('template lessons from the real seed', () => {
  it('Maasai Market, first stop: greetings plus numbers and bargaining', () => {
    const { lesson, chosen } = lessonFor(market, 'Maasai Market')
    expect(lessonSchema.safeParse(lesson).success).toBe(true)
    expect(chosen[0].tags).toContain('greeting')
    expect(chosen[1].tags).toContain('greeting')
    expect(chosen.some((p) => p.tags.includes('numbers'))).toBe(true)
    expect(chosen.some((p) => p.tags.includes('bargaining'))).toBe(true)
  })

  it('Diani Beach, later stop: coast and food, dress note, no plain greetings', () => {
    const { lesson, chosen } = lessonFor(beach, 'Diani Beach')
    expect(lesson.brief.practical).toMatch(/away from the beach/)
    expect(chosen.some((p) => p.tags.includes('coast'))).toBe(true)
    expect(chosen.some((p) => p.tags.includes('food'))).toBe(true)
    const plainGreetings = chosen.filter((p) => p.tags.includes('greeting') && !p.tags.includes('coastal'))
    expect(plainGreetings).toHaveLength(0)
  })

  it('Maasai Mara, game drive: animal names', () => {
    const { chosen } = lessonFor(mara, 'Maasai Mara National Reserve')
    expect(chosen.filter((p) => p.tags.includes('animals')).length).toBeGreaterThanOrEqual(4)
  })

  it('the three lessons share no phrases', () => {
    const a = new Set(lessonFor(market, 'a').chosen.map((p) => p.id))
    const b = new Set(lessonFor(beach, 'b').chosen.map((p) => p.id))
    const c = new Set(lessonFor(mara, 'c').chosen.map((p) => p.id))
    for (const id of a) expect(b.has(id) || c.has(id)).toBe(false)
    for (const id of b) expect(c.has(id)).toBe(false)
  })
})
