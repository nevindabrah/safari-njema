// Runs the practice: one exercise at a time, feedback after each, a streak, then a second chance at anything missed.
// Exists as the practice step of a lesson. Only first tries count for the score. The exercises come from the pure buildQuiz.
import { useEffect, useRef, useState } from 'react'
import { Button } from '../../components/Button'
import { ProgressBar } from '../../components/ProgressBar'
import { PART_TITLES, type Exercise } from '../../lib/quiz'
import { isSoundOn, playSound } from '../../lib/sounds'
import { playPhrase } from '../audio/audio'
import { SpeakButton } from '../audio/SpeakButton'
import { Icon } from '../../components/icons'
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
  // The phrase is spoken a moment after an answer. This holds that pending clip so it can be cancelled.
  const speakTimer = useRef<number | undefined>(undefined)
  const feedback = useRef<HTMLDivElement>(null)
  const exercise = queue[index]

  // Leaving the practice must not leave a clip waiting to play over the next screen.
  useEffect(() => () => window.clearTimeout(speakTimer.current), [])

  // Once there is an answer, make sure its feedback and the Next button are on screen.
  useEffect(() => {
    if (outcome) feedback.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [outcome])

  // Enter moves on once an answer has been given.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Enter' && outcome) next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  // Every hook sits above this line, because React needs the same hooks to run on every render.
  if (!exercise) return <p className="text-muted">Not enough phrases to practise.</p>

  function answer(isCorrect: boolean, detail?: { phraseIds?: string[]; note?: string }) {
    setOutcome({ correct: isCorrect, note: detail?.note })
    playSound(isCorrect ? 'correct' : 'wrong')
    // Hearing the phrase straight after answering is what makes it stick. It waits for the chime to finish.
    if (exercise.say && isSoundOn()) speakTimer.current = window.setTimeout(() => playPhrase(exercise.say), 420)
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
    // A quick learner can press Next before the delayed clip starts. Cancel it, or it would play over a listening question.
    window.clearTimeout(speakTimer.current)
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
        {streak >= 3 && !secondChance && <p className="text-sm font-bold flex items-center gap-1 text-accent-text" aria-live="polite"><Icon name="bolt" size={16} />{streak} in a row</p>}
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
        <div ref={feedback} className="mt-5 rounded-card p-4 scroll-mb-6" role="status" style={{ background: outcome.correct ? 'var(--right-soft)' : 'var(--wrong-soft)' }}>
          <p className="font-display font-extrabold text-lg">{outcome.correct ? (outcome.note ?? 'Right.') : 'Not quite.'}</p>
          {exercise.reveal && <p lang="sw" className="mt-1 flex items-center gap-3">{exercise.say && <SpeakButton swahili={exercise.say} />}<span>{exercise.reveal}</span></p>}
          <Button full className="mt-4" onClick={next}>{moreToCome ? 'Next' : 'Finish'}</Button>
        </div>
      )}
    </div>
  )
}
