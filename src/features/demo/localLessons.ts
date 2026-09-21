// Builds a template lesson in the browser with the same pure functions the Edge Function uses.
// Exists so test mode produces real lessons for any stop without a server.
import { pickCandidates, pickTemplatePhrases } from '../../../supabase/functions/_shared/pickCandidates'
import { buildTemplateLesson } from '../../../supabase/functions/_shared/template'
import { loadSeedBank } from '../lesson/seedBank'
import type { StoredLesson } from './localStore'

interface LocalLessonInput {
  placeName: string
  placeType: string
  region: string
  activities: string[]
  firstStop: boolean
}

export async function buildLocalLesson(input: LocalLessonInput): Promise<StoredLesson> {
  const bank = await loadSeedBank()
  const ctx = { placeType: input.placeType, activities: input.activities, region: input.region, firstStop: input.firstStop, level: 'none', knownIds: [] }
  const picked = pickTemplatePhrases(pickCandidates(bank, ctx), ctx)
  const lesson = buildTemplateLesson({ placeName: input.placeName, placeType: input.placeType, region: input.region, firstStop: input.firstStop, phrases: picked })
  const phrases = picked.map((p) => bank.find((b) => b.id === p.phrase.id)!)
  return { lesson, phrases, generatedBy: 'template', completed: false }
}
