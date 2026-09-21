// Tests for the template lesson.
// Exists so the template always validates against the shared schema and mentions the right things.
import { describe, expect, it } from 'vitest'
import { lessonSchema } from './lessonSchema'
import { buildTemplateLesson } from './template'

const phrases = [
  { id: '11111111-1111-4111-8111-111111111111', swahili: 'a', pronunciation: '', english: 'a', tags: ['greeting'] },
  { id: '22222222-2222-4222-8222-222222222222', swahili: 'b', pronunciation: '', english: 'b', tags: ['food'] },
]

describe('buildTemplateLesson', () => {
  it('produces a lesson that passes the schema', () => {
    const lesson = buildTemplateLesson({ placeName: 'Diani Beach', placeType: 'beach', region: 'coast', firstStop: false, phrases })
    expect(lessonSchema.safeParse(lesson).success).toBe(true)
    expect(lesson.brief.practical).toMatch(/away from the beach/)
    expect(lesson.phrases[0].why_here).toBe('Say this first, before anything else.')
  })

  it('mentions greetings on a first stop', () => {
    const lesson = buildTemplateLesson({ placeName: 'Maasai Market', placeType: 'market', region: 'nairobi', firstStop: true, phrases })
    expect(lesson.brief.know_today[0]).toMatch(/first stop/)
  })
})
