// Tests for the template lesson.
// Exists so the template always validates against the shared schema and the reason text follows the slot.
import { describe, expect, it } from 'vitest'
import { lessonSchema } from './lessonSchema'
import { buildTemplateLesson } from './template'
import type { PickedPhrase } from './pickCandidates'

const phrases: PickedPhrase[] = [
  { slot: 'core_greeting', phrase: { id: '11111111-1111-4111-8111-111111111111', swahili: 'a', pronunciation: '', english: 'a', tags: ['greeting'] } },
  { slot: 'food', phrase: { id: '22222222-2222-4222-8222-222222222222', swahili: 'b', pronunciation: '', english: 'b', tags: ['food'] } },
  { slot: 'mystery', phrase: { id: '33333333-3333-4333-8333-333333333333', swahili: 'c', pronunciation: '', english: 'c', tags: [] } },
]

describe('buildTemplateLesson', () => {
  it('produces a lesson that passes the schema', () => {
    const lesson = buildTemplateLesson({ placeName: 'Diani Beach', placeType: 'beach', region: 'coast', firstStop: false, phrases })
    expect(lessonSchema.safeParse(lesson).success).toBe(true)
    expect(lesson.brief.practical).toMatch(/away from the beach/)
  })

  it('explains each phrase by the slot that chose it', () => {
    const lesson = buildTemplateLesson({ placeName: 'x', placeType: 'restaurant', region: 'nairobi', firstStop: false, phrases })
    expect(lesson.phrases[0].why_here).toBe('Say this first, before anything else.')
    expect(lesson.phrases[1].why_here).toBe('Useful when you order.')
    expect(lesson.phrases[2].why_here).toBe('Useful here.')
  })

  it('mentions greetings on a first stop', () => {
    const lesson = buildTemplateLesson({ placeName: 'Maasai Market', placeType: 'market', region: 'nairobi', firstStop: true, phrases })
    expect(lesson.brief.know_today[0]).toMatch(/first stop/)
  })
})
