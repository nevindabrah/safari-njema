// The generate-lesson Edge Function. Input { trip_stop_id }. Output { user_lesson_id, lesson }.
// Exists to run the pipeline from section 7.3 of the PRD with the API key kept on the server.
import { createClient } from '@supabase/supabase-js'
import { pickCandidates, pickTemplatePhrases, type CandidatePhrase } from '../_shared/pickCandidates.ts'
import { buildTemplateLesson } from '../_shared/template.ts'
import { generateWithClaude } from './claude.ts'
import type { Lesson } from '../_shared/lessonSchema.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
}

const DAILY_LIMIT = 10

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const authHeader = req.headers.get('Authorization') ?? ''
  const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader } },
  })
  const { data: userData } = await userClient.auth.getUser()
  const user = userData.user
  if (!user) return json({ error: 'Not signed in' }, 401)

  const { trip_stop_id } = (await req.json().catch(() => ({}))) as { trip_stop_id?: string }
  if (!trip_stop_id) return json({ error: 'trip_stop_id is required' }, 400)

  // The service role client bypasses RLS, so every read below checks user_id by hand.
  const admin = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

  const { data: stop } = await admin
    .from('trip_stops')
    .select('id, user_id, trip_id, activities, position, place:places(id, name, place_type, region)')
    .eq('id', trip_stop_id)
    .single()
  if (!stop || stop.user_id !== user.id) return json({ error: 'Stop not found' }, 404)
  const place = stop.place as unknown as { id: string; name: string; place_type: string; region: string }

  const { data: profile } = await admin.from('profiles').select('is_demo, swahili_level').eq('id', user.id).single()
  if (profile?.is_demo) return json({ error: 'The demo account cannot generate new lessons' }, 403)
  const level = profile?.swahili_level ?? 'none'

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { count } = await admin.from('user_lessons').select('id', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', since)
  if ((count ?? 0) >= DAILY_LIMIT) {
    await admin.from('trip_stops').update({ lesson_status: 'failed' }).eq('id', stop.id)
    return json({ error: 'Daily lesson limit reached. Try again tomorrow.' }, 429)
  }

  // If this user has an earlier stop, greetings are assumed known.
  const { count: earlier } = await admin.from('trip_stops').select('id', { count: 'exact', head: true }).eq('user_id', user.id).lt('position', stop.position).eq('trip_id', stop.trip_id)
  const firstStop = (earlier ?? 0) === 0

  const { data: progress } = await admin.from('phrase_progress').select('phrase_id').eq('user_id', user.id).gte('box', 4)
  const knownIds = (progress ?? []).map((p) => p.phrase_id as string)

  const { data: bank } = await admin.from('phrases').select('id, swahili, pronunciation, english, tags, register').order('sort_order')
  const ctx = { placeType: place.place_type, activities: stop.activities ?? [], region: place.region, firstStop, level, knownIds }
  const candidates = pickCandidates((bank ?? []) as CandidatePhrase[], ctx)
  if (candidates.length === 0) {
    await admin.from('trip_stops').update({ lesson_status: 'failed' }).eq('id', stop.id)
    return json({ error: 'The phrase bank is empty. Seed it first.' }, 500)
  }

  // Cache key: activities sorted, plus a marker when this is a first stop, since that changes the phrases.
  const activitiesKey = [...(stop.activities ?? [])].sort().join(',') + (firstStop ? '|first' : '')
  const aiEnabled = Deno.env.get('LESSON_AI_ENABLED') === 'true'
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
  const model = Deno.env.get('LESSON_MODEL') ?? 'claude-opus-5'

  let lessonId: string | null = null
  let lesson: Lesson | null = null
  let generatedBy = 'template'

  const { data: cached } = await admin
    .from('lessons')
    .select('id, content, generated_by')
    .eq('place_id', place.id)
    .eq('activities_key', activitiesKey)
    .eq('level', level)
    .order('created_at', { ascending: false })
  // Prefer a model written lesson. A cached template is only reused when the AI is off anyway.
  const hit = (cached ?? []).find((l) => l.generated_by !== 'template') ?? (!aiEnabled ? cached?.[0] : undefined)
  if (hit) {
    lessonId = hit.id
    lesson = hit.content as Lesson
    generatedBy = hit.generated_by
  }

  if (!lesson && aiEnabled && apiKey) {
    lesson = await generateWithClaude(
      { placeName: place.name, placeType: place.place_type, region: place.region, address: '', activities: stop.activities ?? [], firstStop, level, candidates },
      apiKey,
      model,
    )
    if (lesson) generatedBy = model
  }

  if (!lesson) {
    lesson = buildTemplateLesson({ placeName: place.name, placeType: place.place_type, region: place.region, firstStop, phrases: pickTemplatePhrases(candidates, ctx) })
    generatedBy = 'template'
  }

  if (!lessonId) {
    const { data: inserted, error } = await admin
      .from('lessons')
      .insert({ place_id: place.id, activities_key: activitiesKey, level, content: lesson, generated_by: generatedBy })
      .select('id')
      .single()
    if (error || !inserted) {
      await admin.from('trip_stops').update({ lesson_status: 'failed' }).eq('id', stop.id)
      return json({ error: 'Could not save the lesson' }, 500)
    }
    lessonId = inserted.id
  }

  const { data: userLesson } = await admin
    .from('user_lessons')
    .insert({ user_id: user.id, trip_stop_id: stop.id, lesson_id: lessonId })
    .select('id')
    .single()
  await admin.from('trip_stops').update({ lesson_status: 'ready' }).eq('id', stop.id)

  return json({ user_lesson_id: userLesson?.id, lesson, generated_by: generatedBy })
})
