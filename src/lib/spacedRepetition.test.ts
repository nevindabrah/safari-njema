// Tests for the review schedule.
// Exists because a wrong interval either nags the learner every day or never brings a phrase back.
import { describe, expect, it } from 'vitest'
import { afterAnswer, dueNow, firstProgress } from './spacedRepetition'

describe('spaced repetition', () => {
  it('a new phrase is due tomorrow', () => {
    expect(firstProgress('p1', '2026-10-05')).toEqual({ phrase_id: 'p1', box: 1, due_date: '2026-10-06', times_correct: 0, times_wrong: 0 })
  })

  it('right answers climb the boxes: 1, 3, 7, 14, 30 days, and stop at the top', () => {
    let p = firstProgress('p1', '2026-10-05')
    const dues: string[] = []
    for (const day of ['2026-10-06', '2026-10-09', '2026-10-16', '2026-10-30', '2026-11-29']) { p = afterAnswer(p, true, day); dues.push(p.due_date!) }
    expect(dues).toEqual(['2026-10-09', '2026-10-16', '2026-10-30', '2026-11-29', '2026-12-29'])
    expect(p.box).toBe(5)
    expect(p.times_correct).toBe(5)
  })

  it('a wrong answer drops to box one and comes back tomorrow', () => {
    const high = { phrase_id: 'p1', box: 4, due_date: '2026-10-30', times_correct: 3, times_wrong: 0 }
    expect(afterAnswer(high, false, '2026-10-30')).toMatchObject({ box: 1, due_date: '2026-10-31', times_wrong: 1 })
  })

  it('lists what is due today, weakest first', () => {
    const list = [
      { phrase_id: 'later', box: 2, due_date: '2026-10-20', times_correct: 1, times_wrong: 0 },
      { phrase_id: 'weak', box: 1, due_date: '2026-10-04', times_correct: 0, times_wrong: 2 },
      { phrase_id: 'ok', box: 3, due_date: '2026-10-05', times_correct: 2, times_wrong: 0 },
      { phrase_id: 'new', box: 1, due_date: null, times_correct: 0, times_wrong: 0 },
    ]
    expect(dueNow(list, '2026-10-05').map((p) => p.phrase_id)).toEqual(['weak', 'ok'])
  })
})
