// Loads every note readers left on phrases, for a teacher, and lets the teacher mark notes handled or remove them.
// Exists so the teacher page only draws. Row Level Security returns nothing to anyone whose profile is not a teacher's.
import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { writeProblem } from '../../lib/writeResult'

export interface PhraseNote {
  id: string
  swahili: string
  note: string
  reviewer_name: string | null
  created_at: string
  handled_at: string | null
}

export function useTeacherNotes(enabled: boolean) {
  const [notes, setNotes] = useState<PhraseNote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const alive = useRef(true)

  const reload = useCallback(async () => {
    if (!enabled) return
    const { data } = await supabase.from('phrase_notes').select('id, swahili, note, reviewer_name, created_at, handled_at').order('created_at', { ascending: false })
    if (!alive.current) return
    setNotes((data ?? []) as PhraseNote[])
    setLoading(false)
  }, [enabled])

  useEffect(() => {
    alive.current = true
    reload()
    return () => {
      alive.current = false
    }
  }, [reload])

  async function setHandled(id: string, handled: boolean) {
    const before = notes
    setNotes((list) => list.map((n) => (n.id === id ? { ...n, handled_at: handled ? new Date().toISOString() : null } : n)))
    const problem = writeProblem(await supabase.from('phrase_notes').update({ handled_at: handled ? new Date().toISOString() : null }).eq('id', id))
    if (problem) {
      setNotes(before)
      setError(problem)
    }
  }

  async function remove(id: string) {
    const before = notes
    setNotes((list) => list.filter((n) => n.id !== id))
    const problem = writeProblem(await supabase.from('phrase_notes').delete().eq('id', id))
    if (problem) {
      setNotes(before)
      setError(problem)
    }
  }

  return { notes, loading, error, setHandled, remove, reload }
}
