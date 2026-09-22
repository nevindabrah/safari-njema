// Reads and writes the traveller's progress on each phrase, and says which phrases are due for review today.
// Exists so lessons can record results and the review screen can ask for what is due, with one file that knows the table.
import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { todayIso } from '../../lib/calendar'
import { afterAnswer, dueNow, firstProgress, type Progress } from '../../lib/spacedRepetition'
import type { Phrase } from '../../lib/types'
import { useAuth } from '../auth/useAuth'
import { isDemoMode } from '../demo/demoMode'

const DEMO_KEY = 'safari-njema-demo-progress'

function readDemo(): Progress[] {
  try { return JSON.parse(localStorage.getItem(DEMO_KEY) ?? '[]') as Progress[] } catch { return [] }
}

export async function recordLessonResults(userId: string | undefined, studied: Phrase[], missedIds: string[]) {
  const today = todayIso()
  const missed = new Set(missedIds)
  if (isDemoMode) {
    const current = new Map(readDemo().map((p) => [p.phrase_id, p]))
    for (const phrase of studied) {
      const before = current.get(phrase.id)
      current.set(phrase.id, before ? afterAnswer(before, !missed.has(phrase.id), today) : firstProgress(phrase.id, today))
    }
    try { localStorage.setItem(DEMO_KEY, JSON.stringify([...current.values()])) } catch { /* progress then lasts for this visit */ }
    return
  }
  if (!userId) return
  const ids = studied.map((p) => p.id)
  const { data } = await supabase.from('phrase_progress').select('phrase_id, box, due_date, times_correct, times_wrong').eq('user_id', userId).in('phrase_id', ids)
  const current = new Map(((data ?? []) as Progress[]).map((p) => [p.phrase_id, p]))
  const rows = studied.map((phrase) => {
    const before = current.get(phrase.id)
    return { user_id: userId, ...(before ? afterAnswer(before, !missed.has(phrase.id), today) : firstProgress(phrase.id, today)) }
  })
  await supabase.from('phrase_progress').upsert(rows, { onConflict: 'user_id,phrase_id' })
}

export function useDueProgress() {
  const { user } = useAuth()
  const [due, setDue] = useState<Progress[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    if (!user) return
    if (isDemoMode) {
      setDue(dueNow(readDemo(), todayIso()))
      setLoading(false)
      return
    }
    const { data } = await supabase.from('phrase_progress').select('phrase_id, box, due_date, times_correct, times_wrong').eq('user_id', user.id).lte('due_date', todayIso())
    setDue(dueNow((data ?? []) as Progress[], todayIso()))
    setLoading(false)
  }, [user])

  useEffect(() => {
    reload()
  }, [reload])

  return { due, loading, reload }
}
