// The Leitner boxes behind review: a phrase answered right moves up a box and comes back later, one answered wrong drops to box one and comes back tomorrow.
// Exists so every phrase a traveller has met returns just before it would be forgotten, and the rule is one small tested function.

export interface Progress {
  phrase_id: string
  box: number
  due_date: string | null
  times_correct: number
  times_wrong: number
}

export const BOX_DAYS = [1, 3, 7, 14, 30]

function addDays(iso: string, days: number): string {
  const d = new Date(iso + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

export function firstProgress(phraseId: string, todayIso: string): Progress {
  return { phrase_id: phraseId, box: 1, due_date: addDays(todayIso, BOX_DAYS[0]), times_correct: 0, times_wrong: 0 }
}

export function afterAnswer(current: Progress, correct: boolean, todayIso: string): Progress {
  const box = correct ? Math.min(current.box + 1, BOX_DAYS.length) : 1
  return {
    ...current,
    box,
    due_date: addDays(todayIso, BOX_DAYS[box - 1]),
    times_correct: current.times_correct + (correct ? 1 : 0),
    times_wrong: current.times_wrong + (correct ? 0 : 1),
  }
}

export function dueNow(progress: Progress[], todayIso: string): Progress[] {
  return progress.filter((p) => p.due_date !== null && p.due_date <= todayIso).sort((x, y) => x.box - y.box || x.due_date!.localeCompare(y.due_date!))
}
