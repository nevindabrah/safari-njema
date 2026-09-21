// Chooses candidate phrases from the bank for a stop by matching tags to place type, activities and region.
// Exists as a pure function shared by the template path and the model path, and tested with Vitest.

export interface CandidatePhrase {
  id: string
  swahili: string
  pronunciation: string
  english: string
  tags: string[]
}

export interface CandidateContext {
  placeType: string
  activities: string[]
  region: string
  firstStop: boolean
  level: string
  knownIds: string[]
}

const PLACE_TYPE_TAGS: Record<string, string[]> = {
  market: ['market', 'bargaining', 'numbers', 'money'],
  restaurant: ['food', 'drink', 'numbers', 'money'],
  hotel: ['hotel', 'help', 'polite'],
  park: ['safari', 'animals', 'questions'],
  beach: ['coast', 'beach', 'food'],
  airport: ['airport', 'transport', 'help'],
  station: ['transport', 'numbers', 'directions'],
  city: ['directions', 'transport', 'city'],
  religious_site: ['polite', 'questions'],
  museum: ['questions', 'polite'],
  other: ['help', 'questions'],
}

const ACTIVITY_TAGS: Record<string, string[]> = {
  'eating out': ['food', 'drink'],
  shopping: ['market', 'bargaining', 'numbers'],
  'game drive': ['safari', 'animals'],
  beach: ['coast', 'beach'],
  nightlife: ['nightlife', 'drink'],
  'meeting family': ['family', 'polite'],
  'public transport': ['transport', 'numbers', 'directions'],
  hiking: ['hiking', 'directions', 'help'],
  'business meeting': ['business', 'polite', 'time'],
}

const REGION_TAGS: Record<string, string[]> = {
  coast: ['coast', 'coastal'],
  nairobi: ['city'],
  rift_valley_mara: ['safari'],
  central_mt_kenya: ['hiking'],
  western_lake: [],
  north: [],
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
    // The first stop of a trip always teaches greetings. Later stops assume them.
    score += ctx.firstStop ? 6 : -1
  }
  return score
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).length
}

// Returns up to `limit` phrases, best match first. Phrases the user already knows are left out.
export function pickCandidates(phrases: CandidatePhrase[], ctx: CandidateContext, limit = 40): CandidatePhrase[] {
  const known = new Set(ctx.knownIds)
  const scored = phrases
    .filter((p) => !known.has(p.id))
    .map((p, index) => ({ p, score: scorePhrase(p, ctx), index }))
    .filter((x) => x.score > 0 || ctx.firstStop === false)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      // Beginners get shorter phrases first.
      if (ctx.level === 'none') {
        const lengthDiff = wordCount(a.p.swahili) - wordCount(b.p.swahili)
        if (lengthDiff !== 0) return lengthDiff
      }
      return a.index - b.index
    })
  return scored.slice(0, limit).map((x) => x.p)
}

// The template lesson takes the top six. On a first stop, two of them are greetings.
export function pickTemplatePhrases(candidates: CandidatePhrase[], ctx: CandidateContext, count = 6): CandidatePhrase[] {
  if (!ctx.firstStop) return candidates.slice(0, count)
  const greetings = candidates.filter((p) => p.tags.includes('greeting')).slice(0, 2)
  const rest = candidates.filter((p) => !greetings.includes(p))
  return [...greetings, ...rest].slice(0, count)
}
