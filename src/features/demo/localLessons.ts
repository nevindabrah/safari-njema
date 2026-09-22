// Builds a template lesson in the browser with the same pure functions the Edge Function uses.
// Exists so test mode produces real lessons for any stop without a server.
import { pickCandidates, pickTemplatePhrases } from '../../../supabase/functions/_shared/pickCandidates'
import { buildTemplateLesson } from '../../../supabase/functions/_shared/template'
import { pickProverb } from '../../../supabase/functions/_shared/lessonPlan'
import { loadSeedBank } from '../lesson/seedBank'
import type { StoredLesson } from './localStore'

interface LocalLessonInput {
  placeName: string
  placeType: string
  region: string
  googleTypes?: string[]
  activities: string[]
  firstStop: boolean
}

export async function buildLocalLesson(input: LocalLessonInput): Promise<StoredLesson> {
  const bank = await loadSeedBank()
  const ctx = { placeType: input.placeType, activities: input.activities, region: input.region, googleTypes: input.googleTypes, firstStop: input.firstStop, level: 'none', knownIds: [] }
  const picked = pickTemplatePhrases(pickCandidates(bank, ctx), ctx)
  const proverbs = (await import('../../../supabase/seed/proverbs.json')).default
  const lesson = buildTemplateLesson({ placeName: input.placeName, placeType: input.placeType, region: input.region, googleTypes: input.googleTypes, firstStop: input.firstStop, phrases: picked, proverb: pickProverb(proverbs, input.placeType) })
  const phrases = picked.map((p) => bank.find((b) => b.id === p.phrase.id)!)
  return { lesson, phrases, generatedBy: 'template' }
}
