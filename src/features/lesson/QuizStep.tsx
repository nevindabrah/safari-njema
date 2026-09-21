// Runs the practice: one exercise at a time, feedback after each, a streak, then a second chance at anything missed.
// Exists as the practice step of a lesson. Only first tries count for the score. The exercises come from the pure buildQuiz.
import { useState } from 'react'
import { Button } from '../../components/Button'
import { ProgressBar } from '../../components/ProgressBar'
import { PART_TITLES, type Exercise } from '../../lib/quiz'
import { playSound } from '../../lib/sounds'
import { ChoiceExercise } from './exercises/ChoiceExercise'
import { MatchExercise } from './exercises/MatchExercise'
import { BuildExercise } from './exercises/BuildExercise'
import { TypeExercise } from './exercises/TypeExercise'

export interface QuizResult {
  correct: number
  total: number
  missedPhraseIds: string[]
}

interface QuizStepProps {
  exercises: Exercise[]
  onFinish: (result: QuizResult) => void
}

export function QuizStep({ exercises, onFinish }: QuizStepProps) {
  const [queue, setQueue] = useState(exercises)
  const [secondChance, setSecondChance] = useState(false)
  const [index, setIndex] = useState(0)
  const [outcome, setOutcome] = useState<{ correct: boolean; note?: string } | null>(null)
  const [correct, setCorrect] = useState(0)
  const [streak, setStreak] = useState(0)
  const [missed, setMissed] = useState<Exercise[]>([])
  const [missedPhraseIds, setMissedPhraseIds] = useState<string[]>([])
  const exercise = queue[index]

  if (!exercise) return <p className="text-muted">Not enough phrases to practise.</p>

  function answer(isCorrect: boolean, detail?: { phraseIds?: string[]; note?: string }) {
    setOutcome({ correct: isCorrect, note: detail?.note })
    playSound(isCorrect ? 'correct' : 'wrong')
    if (secondChance) return
    if (isCorrect) {
      setCorrect((c) => c + 1)
      setStreak((s) => s + 1)
      return
    }
    setStreak(0)
    setMissed((list) => [...list, exercise])
    setMissedPhraseIds((ids) => [...new Set([...ids, ...(detail?.phraseIds ?? exercise.phraseIds)])])
  }

  function next() {
    setOutcome(null)
    if (index + 1 < queue.length) return setIndex(index + 1)
    // The end of the main practice. Anything missed comes back once, and does not change the score.
    if (!secondChance && missed.length > 0) {
      setQueue(missed)
      setSecondChance(true)
      return setIndex(0)
    }
    onFinish({ correct, total: exercises.length, missedPhraseIds })
  }

  const moreToCome = index + 1 < queue.length || (!secondChance && missed.length > 0)

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-3">
        <p className="text-xs font-bold uppercase tracking-wide rounded-pill bg-tint px-3 py-1">
          {secondChance ? 'Second chance' : `Part ${exercise.part} of 3 · ${PART_TITLES[exercise.part]}`}
        </p>
        {streak >= 3 && !secondChance && <p className="text-sm font-bold" aria-live="polite">🔥 {streak} in a row</p>}
      </div>
      <ProgressBar value={index + 1} max={queue.length} label="Practice progress" />
      <p className="text-sm text-muted mt-4 mb-1">{exercise.instruction}</p>

      {/* The key makes React start each exercise fresh, including when one comes back in the second chance round. */}
      <div key={`${secondChance}-${exercise.id}`}>
        {exercise.kind === 'choice' && <ChoiceExercise exercise={exercise} onAnswer={(ok) => answer(ok)} />}
        {exercise.kind === 'match' && <MatchExercise exercise={exercise} onAnswer={(ok, ids) => answer(ok, { phraseIds: ids })} />}
        {exercise.kind === 'build' && <BuildExercise exercise={exercise} onAnswer={(ok) => answer(ok)} />}
        {exercise.kind === 'type' && <TypeExercise exercise={exercise} onAnswer={(ok, note) => answer(ok, { note })} />}
      </div>

      {outcome && (
        <div className="mt-5 rounded-card p-4" role="status" style={{ background: outcome.correct ? 'var(--right-soft)' : 'var(--wrong-soft)' }}>
          <p className="font-display font-extrabold text-lg">{outcome.correct ? (outcome.note ?? 'Right.') : 'Not quite.'}</p>
          {exercise.reveal && <p lang="sw" className="mt-1">{exercise.reveal}</p>}
          <Button full className="mt-4" onClick={next}>{moreToCome ? 'Next' : 'Finish'}</Button>
        </div>
      )}
    </div>
  )
}
