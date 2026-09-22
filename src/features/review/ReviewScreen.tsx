// A short practice made only of phrases that are due today, from any stop. Finishing it reschedules each phrase.
// Exists so what a traveller learned at the market comes back just before it fades, without them having to pick a lesson.
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { supabase } from '../../lib/supabase'
import { buildQuiz } from '../../lib/quiz'
import type { Phrase } from '../../lib/types'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { TopBar } from '../../components/TopBar'
import { LeaveButton } from '../../components/LeaveButton'
import { useAuth } from '../auth/useAuth'
import { isDemoMode } from '../demo/demoMode'
import { loadSeedBank } from '../lesson/seedBank'
import { QuizStep, type QuizResult } from '../lesson/QuizStep'
import { audioUrlFor } from '../audio/audio'
import { playSound } from '../../lib/sounds'
import { recordLessonResults, useDueProgress } from './useProgress'

export function ReviewScreen() {
  const { user } = useAuth()
  const { due, loading } = useDueProgress()
  const [pool, setPool] = useState<Phrase[] | null>(null)
  const [result, setResult] = useState<QuizResult | null>(null)

  useEffect(() => {
    let cancelled = false
    if (isDemoMode) loadSeedBank().then((bank) => { if (!cancelled) setPool(bank.filter((p) => p.register !== 'sheng')) })
    else supabase.from('phrases').select('id, swahili, pronunciation, english, tags, verified').then(({ data }) => { if (!cancelled) setPool((data ?? []) as Phrase[]) })
    return () => {
      cancelled = true
    }
  }, [])

  const studied = useMemo(() => {
    if (!pool) return []
    const byId = new Map(pool.map((p) => [p.id, p]))
    return due.map((d) => byId.get(d.phrase_id)).filter((p): p is Phrase => !!p).slice(0, 8)
  }, [pool, due])
  const exercises = useMemo(() => (studied.length >= 2 && pool ? buildQuiz(studied, pool, Math.random, (sw) => audioUrlFor(sw) !== null) : []), [studied, pool])

  async function finish(quizResult: QuizResult) {
    setResult(quizResult)
    playSound('complete')
    await recordLessonResults(user?.id, studied, quizResult.missedPhraseIds)
  }

  return (
    <div className="min-h-dvh">
      <TopBar />
      <main className="mx-auto max-w-2xl px-4 pt-4 pb-28 sm:pb-10">
        <LeaveButton kind="back" label="Back to my trip" to="/trip" showLabel className="mb-3" />
        <h1 className="text-4xl sm:text-5xl mb-2">Review</h1>
        <p className="text-muted mb-5">Phrases from earlier stops, back just before you would forget them.</p>
        {(loading || !pool) && <p className="text-muted">Loading.</p>}
        {pool && !loading && studied.length < 2 && !result && (
          <Card><p className="mb-4">{due.length === 0 ? 'Nothing is due today. Finish a lesson and its phrases come back here in a day or two.' : 'Only one phrase is due, so there is not enough for a practice yet. Check back tomorrow.'}</p><Link to="/trip"><Button tabIndex={-1}>Back to my trip</Button></Link></Card>
        )}
        {pool && studied.length >= 2 && !result && (
          <Card><QuizStep exercises={exercises} onFinish={finish} /></Card>
        )}
        {result && (
          <Card className="text-center">
            <p className="text-xs uppercase tracking-wide font-bold text-muted">Done</p>
            <p className="text-3xl font-display font-extrabold mt-1">{result.correct} of {result.total} right</p>
            <p className="text-muted mt-2">{result.missedPhraseIds.length === 0 ? 'Every phrase moves up a box and comes back later.' : `${result.missedPhraseIds.length} phrase${result.missedPhraseIds.length === 1 ? '' : 's'} will come back tomorrow.`}</p>
            <Link to="/trip" className="inline-block mt-5"><Button tabIndex={-1}>Back to my trip</Button></Link>
          </Card>
        )}
      </main>
    </div>
  )
}
