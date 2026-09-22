// Runs phrase selection against the real seed for the three stops in the Phase 1 acceptance test.
// Exists so the template path is proven to give three clearly different, sensible lessons before anything goes live.
import { describe, expect, it } from 'vitest'
import seed from '../../seed/phrases.json'
import { pickCandidates, pickTemplatePhrases, type CandidatePhrase, type CandidateContext } from './pickCandidates'
import { buildTemplateLesson } from './template'
import { lessonSchema } from './lessonSchema'

const bank: CandidatePhrase[] = seed.map((p, i) => ({
  id: `00000000-0000-4000-8000-${String(i).padStart(12, '0')}`,
  swahili: p.swahili,
  pronunciation: p.pronunciation,
  english: p.english,
  tags: p.tags,
  register: p.register,
}))

function lessonFor(ctx: CandidateContext, placeName: string) {
  const picked = pickTemplatePhrases(pickCandidates(bank, ctx), ctx)
  const lesson = buildTemplateLesson({ placeName, placeType: ctx.placeType, region: ctx.region, firstStop: ctx.firstStop, phrases: picked })
  const swahili = picked.map((p) => p.phrase.swahili)
  const whyBySwahili = new Map(picked.map((p, i) => [p.phrase.swahili, lesson.phrases[i].why_here]))
  return { lesson, picked, swahili, whyBySwahili }
}

const market: CandidateContext = { placeType: 'market', activities: ['shopping'], region: 'nairobi', firstStop: true, level: 'none', knownIds: [] }
const beach: CandidateContext = { placeType: 'beach', activities: ['eating out'], region: 'coast', firstStop: false, level: 'none', knownIds: [] }
const mara: CandidateContext = { placeType: 'park', activities: ['game drive'], region: 'rift_valley_mara', firstStop: false, level: 'none', knownIds: [] }

describe('template lessons from the real seed', () => {
  it('Maasai Market, first stop: core greetings, the price question, bargaining and numbers', () => {
    const { lesson, swahili } = lessonFor(market, 'Maasai Market')
    expect(lessonSchema.safeParse(lesson).success).toBe(true)
    expect(swahili).toHaveLength(8)
    expect(swahili.slice(0, 6)).toEqual([
      'Habari?',
      'Nzuri',
      'Hii ni bei gani?',
      'Moja, mbili, tatu, nne, tano',
      'Punguza bei, tafadhali',
      'Sita, saba, nane, tisa, kumi',
    ])
  })

  it('Diani Beach, later stop: ordering food, a coastal greeting and coast words, with the dress note', () => {
    const { lesson, swahili, picked } = lessonFor(beach, 'Diani Beach')
    expect(lesson.brief.practical).toMatch(/away from the beach/)
    expect(swahili).toHaveLength(8)
    expect(swahili.slice(0, 6)).toEqual(['Naomba menyu', 'Madafu', 'Hujambo? / Sijambo', 'Bahari', 'Pwani', 'Jahazi'])
    const plainGreetings = picked.filter((p) => p.phrase.tags.includes('greeting') && !p.phrase.tags.includes('coastal'))
    expect(plainGreetings).toHaveLength(0)
  })

  it('Maasai Mara, game drive: animal names and guide phrases', () => {
    const { swahili, picked } = lessonFor(mara, 'Maasai Mara National Reserve')
    expect(swahili).toContain('Simba')
    expect(swahili).toContain('Ni mnyama gani huyo?')
    expect(picked.filter((p) => p.slot === 'animals').length).toBeGreaterThanOrEqual(3)
    expect(picked.filter((p) => p.slot === 'guide').length).toBeGreaterThanOrEqual(2)
  })

  it('gives every phrase a reason that fits it', () => {
    const { whyBySwahili } = lessonFor(market, 'Maasai Market')
    expect(whyBySwahili.get('Moja, mbili, tatu, nne, tano')).toMatch(/numbers/)
    expect(whyBySwahili.get('Punguza bei, tafadhali')).toMatch(/price/)
    expect(whyBySwahili.get('Habari?')).toMatch(/first/)
  })

  it('keeps phrases where they belong across every kind of place', () => {
    const placeTypes = ['city', 'park', 'beach', 'market', 'restaurant', 'hotel', 'airport', 'station', 'religious_site', 'museum', 'other']
    const regions = ['nairobi', 'coast', 'rift_valley_mara']
    for (const placeType of placeTypes) {
      for (const region of regions) {
        const ctx: CandidateContext = { placeType, activities: [], region, firstStop: false, level: 'none', knownIds: [] }
        const { swahili, picked } = lessonFor(ctx, 'x')
        expect(swahili, `${placeType} in ${region} should have eight phrases`).toHaveLength(8)
        if (placeType !== 'restaurant') expect(swahili).not.toContain('Naomba bili')
        if (placeType !== 'beach') expect(swahili).not.toContain('Naweza kuogelea hapa?')
        expect(picked.find((p) => p.phrase.swahili === 'Pole')?.slot ?? 'polite').toBe('polite')
      }
    }
  })

  it('opens a place of worship with the respectful greeting', () => {
    const ctx: CandidateContext = { placeType: 'religious_site', activities: [], region: 'coast', firstStop: false, level: 'none', knownIds: [] }
    expect(lessonFor(ctx, 'x').swahili[0]).toBe('Shikamoo / Marahaba')
  })

  it('never teaches Sheng by default, and the three lessons share no phrases', () => {
    const lessons = [lessonFor(market, 'a'), lessonFor(beach, 'b'), lessonFor(mara, 'c')]
    const all = lessons.flatMap((l) => l.swahili)
    expect(all).not.toContain('Sasa? / Poa')
    expect(new Set(all).size).toBe(all.length)
  })
})
