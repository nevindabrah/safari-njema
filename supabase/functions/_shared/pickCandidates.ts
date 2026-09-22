// Chooses phrases from the bank for a stop. pickCandidates scores every phrase by its tags,
// and pickTemplatePhrases fills the lesson's slots from those candidates. Pure functions, tested with Vitest.
import { ACTIVITY_TAGS, PLACE_TYPE_TAGS, REGION_TAGS, buildSlotPlan } from './lessonPlan.ts'

export interface CandidatePhrase {
  id: string
  swahili: string
  pronunciation: string
  english: string
  tags: string[]
  register?: string
}

export interface CandidateContext {
  placeType: string
  activities: string[]
  region: string
  firstStop: boolean
  level: string
  knownIds: string[]
  shengEnabled?: boolean
}

export interface PickedPhrase {
  phrase: CandidatePhrase
  slot: string
}

export function scorePhrase(phrase: CandidatePhrase, ctx: CandidateContext): number {
  let score = 0
  const typeTags = PLACE_TYPE_TAGS[ctx.placeType] ?? PLACE_TYPE_TAGS.other
  const activityTags = ctx.activities.flatMap((a) => ACTIVITY_TAGS[a] ?? [])
  const regionTags = REGION_TAGS[ctx.region] ?? []
  for (const tag of phrase.tags) {
    if (typeTags.includes(tag)) score += 3
    if (activityTags.includes(tag)) score += 3
    if (regionTags.includes(tag)) score += 2
  }
  if (phrase.tags.includes('greeting')) {
    score += ctx.firstStop ? 6 : -1
  }
  return score
}

export function pickCandidates(phrases: CandidatePhrase[], ctx: CandidateContext, limit = 40): CandidatePhrase[] {
  const known = new Set(ctx.knownIds)
  return phrases
    .filter((p) => !known.has(p.id))
    .filter((p) => ctx.shengEnabled || p.register !== 'sheng')
    .map((p, index) => ({ p, score: scorePhrase(p, ctx), index }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map((x) => x.p)
}

export function pickTemplatePhrases(candidates: CandidatePhrase[], ctx: CandidateContext, count = 8): PickedPhrase[] {
  const picked: PickedPhrase[] = []
  const used = new Set<string>()
  for (const slot of buildSlotPlan(ctx.placeType, ctx.activities, ctx.firstStop)) {
    if (picked.length >= count) break
    const fits = candidates.filter((c) => !used.has(c.id) && c.tags.includes(slot))
    const match = fits.find((c) => c.tags.includes('essential')) ?? fits[0]
    if (!match) continue
    used.add(match.id)
    picked.push({ phrase: match, slot })
  }
  for (const candidate of candidates) {
    if (picked.length >= count) break
    if (used.has(candidate.id)) continue
    used.add(candidate.id)
    picked.push({ phrase: candidate, slot: candidate.tags[0] ?? 'basics' })
  }
  return picked
}
