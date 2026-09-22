// The tables that connect a stop to phrase tags: which tags matter for a place type, an activity or a region,
// and the ordered "slots" a template lesson fills. Exists so lesson balance is data you can read, not logic.

export const PLACE_TYPE_TAGS: Record<string, string[]> = {
  market: ['market', 'bargaining', 'numbers', 'shopping', 'price', 'paying'],
  restaurant: ['food', 'drink', 'ordering', 'paying'],
  hotel: ['hotel', 'polite', 'help'],
  park: ['safari', 'animals', 'guide'],
  beach: ['coast', 'beach', 'coastal'],
  airport: ['airport', 'transport', 'cash'],
  station: ['transport', 'directions', 'fare'],
  city: ['directions', 'transport', 'help', 'polite'],
  religious_site: ['respect', 'polite', 'questions', 'help'],
  museum: ['polite', 'questions', 'help'],
  other: ['help', 'polite', 'questions'],
}

export const ACTIVITY_TAGS: Record<string, string[]> = {
  'eating out': ['food', 'drink', 'ordering'],
  shopping: ['bargaining', 'numbers', 'shopping'],
  'game drive': ['animals', 'guide', 'safari'],
  beach: ['coast', 'beach'],
  nightlife: ['drink', 'polite'],
  'meeting family': ['respect', 'introductions', 'polite'],
  'public transport': ['transport', 'fare', 'directions'],
  hiking: ['directions', 'help'],
  'business meeting': ['introductions', 'polite'],
}

export const REGION_TAGS: Record<string, string[]> = {
  coast: ['coast', 'coastal'],
  nairobi: [],
  rift_valley_mara: ['safari'],
  central_mt_kenya: [],
  western_lake: [],
  north: [],
}

const TYPE_SLOTS: Record<string, string[]> = {
  market: ['bargaining', 'numbers', 'bargaining', 'numbers', 'shopping', 'bargaining'],
  restaurant: ['ordering', 'ordering', 'food', 'drink', 'paying', 'food'],
  hotel: ['hotel', 'polite', 'help', 'polite', 'questions', 'help'],
  park: ['animals', 'animals', 'guide', 'animals', 'guide', 'animals'],
  beach: ['coastal_greeting', 'beach', 'beach', 'coast', 'beach', 'coast'],
  airport: ['airport', 'airport', 'transport', 'airport', 'airport', 'help'],
  station: ['transport', 'fare', 'directions', 'transport', 'directions', 'fare'],
  city: ['directions', 'transport', 'help', 'directions', 'polite', 'help'],
  religious_site: ['respect', 'polite', 'polite', 'questions', 'polite', 'help'],
  museum: ['polite', 'questions', 'polite', 'help', 'polite', 'questions'],
  other: ['polite', 'help', 'questions', 'polite', 'help', 'polite'],
}

const ACTIVITY_SLOTS: Record<string, string[]> = {
  'eating out': ['ordering', 'food'],
  shopping: ['bargaining', 'numbers'],
  'game drive': ['animals', 'guide'],
  beach: ['beach', 'coast'],
  nightlife: ['drink', 'polite'],
  'meeting family': ['respect', 'introductions'],
  'public transport': ['transport', 'fare'],
  hiking: ['directions', 'help'],
  'business meeting': ['introductions', 'polite'],
}

const PROVERB_THEME: Record<string, string> = {
  market: 'market', restaurant: 'food', park: 'safari', beach: 'coast', airport: 'airport', hotel: 'airport',
  station: 'transport', city: 'basics', religious_site: 'basics', museum: 'general', other: 'help',
}

export interface Proverb {
  swahili: string
  meaning: string
  themes: string[]
}

export function pickProverb(proverbs: Proverb[], placeType: string): Proverb | null {
  const theme = PROVERB_THEME[placeType] ?? 'general'
  return proverbs.find((p) => p.themes.includes(theme)) ?? proverbs.find((p) => p.themes.includes('general')) ?? null
}

export function buildSlotPlan(placeType: string, activities: string[], firstStop: boolean): string[] {
  const greetingSlots = firstStop ? ['core_greeting', 'core_greeting'] : []
  const activitySlots = activities.flatMap((a) => ACTIVITY_SLOTS[a] ?? [])
  const typeSlots = TYPE_SLOTS[placeType] ?? TYPE_SLOTS.other
  return [...greetingSlots, ...activitySlots, ...typeSlots]
}
