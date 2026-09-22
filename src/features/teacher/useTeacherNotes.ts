// Loads every note readers left on phrases, for a teacher, and lets the teacher mark notes handled or remove them.
// Exists so the teacher page only draws. Row Level Security returns nothing to anyone whose profile is not a teacher's.
import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

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

  const reload = useCallback(async () => {
    if (!enabled) return
    const { data } = await supabase.from('phrase_notes').select('id, swahili, note, reviewer_name, created_at, handled_at').order('created_at', { ascending: false })
    setNotes((data ?? []) as PhraseNote[])
    setLoading(false)
  }, [enabled])

  useEffect(() => {
    reload()
  }, [reload])

  async function setHandled(id: string, handled: boolean) {
    setNotes((list) => list.map((n) => (n.id === id ? { ...n, handled_at: handled ? new Date().toISOString() : null } : n)))
    await supabase.from('phrase_notes').update({ handled_at: handled ? new Date().toISOString() : null }).eq('id', id)
  }

  async function remove(id: string) {
    setNotes((list) => list.filter((n) => n.id !== id))
    await supabase.from('phrase_notes').delete().eq('id', id)
  }

  return { notes, loading, setHandled, remove, reload }
}
