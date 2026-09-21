// Loads one user lesson: its content, the place, and the phrase rows it references.
// Exists so LessonScreen only renders what this hook returns.
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { lessonSchema, type Lesson } from '../../lib/lessonSchema'
import type { Phrase } from '../../lib/types'
import { isDemoMode } from '../demo/demoMode'
import { completeLocalLesson, getLocalLesson } from '../demo/localStore'
import { loadSeedBank } from './seedBank'

export interface LoadedLesson {
  userLessonId: string
  lesson: Lesson
  generatedBy: string
  phrases: Phrase[]
  // Extra phrases the quiz can use as wrong answers.
  pool: Phrase[]
}

export function useLesson(userLessonId: string | undefined) {
  const [data, setData] = useState<LoadedLesson | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userLessonId) return
    if (isDemoMode) {
      const stored = getLocalLesson(userLessonId)
      if (!stored) {
        setError('We could not find that lesson.')
        return
      }
      loadSeedBank().then((bank) => bank.filter((p) => p.register !== 'sheng')).then((pool) => setData({ userLessonId, lesson: stored.lesson, generatedBy: stored.generatedBy, phrases: stored.phrases, pool }))
      return
    }
    let cancelled = false

    async function load() {
      const { data: row, error: readError } = await supabase
        .from('user_lessons')
        .select('id, lesson:lessons(content, generated_by)')
        .eq('id', userLessonId!)
        .single()
      if (readError || !row) {
        if (!cancelled) setError('We could not find that lesson.')
        return
      }
      const lessonRow = row.lesson as unknown as { content: unknown; generated_by: string }
      const parsed = lessonSchema.safeParse(lessonRow.content)
      if (!parsed.success) {
        if (!cancelled) setError('This lesson is in a shape we do not understand.')
        return
      }
      const ids = parsed.data.phrases.map((p) => p.phrase_id)
      const { data: phraseRows } = await supabase
        .from('phrases')
        .select('id, swahili, pronunciation, english, tags, verified')
        .in('id', ids)
      // Keep the lesson's order, not the database's.
      const byId = new Map((phraseRows ?? []).map((p) => [p.id, p as Phrase]))
      const phrases = ids.map((id) => byId.get(id)).filter((p): p is Phrase => Boolean(p))
      const { data: poolRows } = await supabase.from('phrases').select('id, swahili, pronunciation, english, tags, verified').neq('register', 'sheng').limit(100)
      if (!cancelled) {
        setData({ userLessonId: row.id, lesson: parsed.data, generatedBy: lessonRow.generated_by, phrases, pool: (poolRows ?? []) as Phrase[] })
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [userLessonId])

  async function markCompleted(score: number, durationSeconds: number) {
    if (!userLessonId) return
    if (isDemoMode) return completeLocalLesson(userLessonId)
    await supabase
      .from('user_lessons')
      .update({ status: 'completed', score, duration_seconds: durationSeconds, completed_at: new Date().toISOString() })
      .eq('id', userLessonId)
  }

  return { data, error, markCompleted }
}
