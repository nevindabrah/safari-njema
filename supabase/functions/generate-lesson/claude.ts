// Asks Claude to write the brief and choose phrases from the supplied candidates. JSON in, JSON out.
// Exists as the only place the model is called. Returns null on any failure so the caller uses the template.
import Anthropic from '@anthropic-ai/sdk'
import { lessonSchema, type Lesson } from '../_shared/lessonSchema.ts'
import type { CandidatePhrase } from '../_shared/pickCandidates.ts'

export interface ClaudeInput {
  placeName: string
  placeType: string
  region: string
  address: string
  activities: string[]
  firstStop: boolean
  level: string
  candidates: CandidatePhrase[]
}

const SYSTEM = `You write short, warm travel lessons in Swahili for visitors to Kenya. You reply with JSON only, no prose and no code fences.

Rules:
- Choose exactly eight phrases from the supplied candidates, or as many as fit if there are fewer. Use only their ids. Do not invent ids.
- Order them by how much the traveller needs them at this place, most needed first. A short lesson studies only the first four, so those four must stand on their own.
- You may add at most two new phrases in new_phrases only if the candidates have nothing suitable. Usually leave it empty.
- The brief must not state prices, opening hours, phone numbers or anything else that changes. Keep to orientation, culture and etiquette.
- Write in plain, warm, second person English. No exclamation marks.
- If this is the traveller's first stop, include two greeting phrases. Otherwise assume greetings are known and do not repeat them.
- Coast stops should mention modest dress away from the beach. Nairobi stops may be more direct in tone.

Reply with exactly this shape:
{"place":{"name":"","type":""},"brief":{"what_it_is":"2 to 3 sentences","know_today":["","",""],"etiquette":"","practical":""},"phrases":[{"phrase_id":"","why_here":"one line"}],"new_phrases":[]}`

function buildUserMessage(input: ClaudeInput): string {
  const candidates = input.candidates.map((c) => ({ id: c.id, swahili: c.swahili, english: c.english, tags: c.tags }))
  return JSON.stringify(
    {
      place: { name: input.placeName, type: input.placeType, region: input.region, address: input.address },
      activities: input.activities,
      first_stop: input.firstStop,
      swahili_level: input.level,
      candidates,
    },
    null,
    1,
  )
}

function parseLesson(text: string, allowedIds: Set<string>): Lesson | null {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start < 0 || end < 0) return null
  let json: unknown
  try {
    json = JSON.parse(text.slice(start, end + 1))
  } catch {
    return null
  }
  const parsed = lessonSchema.safeParse(json)
  if (!parsed.success) return null
  if (!parsed.data.phrases.every((p) => allowedIds.has(p.phrase_id))) return null
  return parsed.data
}

export async function generateWithClaude(input: ClaudeInput, apiKey: string, model: string): Promise<Lesson | null> {
  const client = new Anthropic({ apiKey, timeout: 25_000, maxRetries: 0 })
  const allowedIds = new Set(input.candidates.map((c) => c.id))
  const userMessage = buildUserMessage(input)

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await client.messages.create({
        model,
        max_tokens: 8000,
        system: SYSTEM,
        messages: [{ role: 'user', content: userMessage }],
      })
      if (response.stop_reason === 'refusal') return null
      const text = response.content
        .filter((block) => block.type === 'text')
        .map((block) => block.text)
        .join('')
      const lesson = parseLesson(text, allowedIds)
      if (lesson) return lesson
    } catch (error) {
      console.error('claude attempt failed', attempt, error instanceof Error ? error.message : error)
    }
  }
  return null
}
