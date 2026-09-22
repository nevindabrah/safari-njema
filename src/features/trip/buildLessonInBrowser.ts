// Builds a template lesson in the browser for a signed in user and saves it to their own account.
// Exists so accounts work before the Edge Function is deployed. It runs the same pure functions the function runs,
// reads the phrase bank and proverbs the user is allowed to read, and writes only to the user's own row.
import { supabase } from '../../lib/supabase'
import type { StopRow } from '../../lib/types'
import { pickCandidates, pickTemplatePhrases, type CandidatePhrase } from '../../../supabase/functions/_shared/pickCandidates'
import { buildTemplateLesson } from '../../../supabase/functions/_shared/template'
import { pickProverb, type Proverb } from '../../../supabase/functions/_shared/lessonPlan'

export async function buildLessonInBrowser(stop: StopRow, firstStop: boolean): Promise<boolean> {
  const { data: userData } = await supabase.auth.getUser()
  const userId = userData.user?.id
  if (!userId) return false

  const [{ data: bank }, { data: proverbs }] = await Promise.all([
    supabase.from('phrases').select('id, swahili, pronunciation, english, tags, register').order('sort_order'),
    supabase.from('proverbs').select('swahili, meaning, themes'),
  ])
  if (!bank || bank.length === 0) return false

  const ctx = { placeType: stop.place.place_type, activities: stop.activities, region: stop.place.region, firstStop, level: 'none', knownIds: [] }
  const picked = pickTemplatePhrases(pickCandidates(bank as CandidatePhrase[], ctx), ctx)
  if (picked.length === 0) return false
  const lesson = buildTemplateLesson({
    placeName: stop.place.name,
    placeType: stop.place.place_type,
    region: stop.place.region,
    firstStop,
    phrases: picked,
    proverb: pickProverb((proverbs ?? []) as Proverb[], stop.place.place_type),
  })

  const { error } = await supabase.from('user_lessons').insert({ user_id: userId, trip_stop_id: stop.id, content: lesson, generated_by: 'template' })
  if (error) return false
  await supabase.from('trip_stops').update({ lesson_status: 'ready' }).eq('id', stop.id)
  return true
}
