// The three step lesson itself: brief, phrases, quiz, then a short end screen. It only renders what it is given.
// Exists apart from LessonScreen so the same player runs a saved lesson and the sample lesson.
import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { ProgressBar } from '../../components/ProgressBar'
import { ReviewNote } from '../../components/ReviewNote'
import { buildQuiz } from '../../lib/quiz'
import type { Lesson } from '../../lib/lessonSchema'
import type { Phrase, PlaceType } from '../../lib/types'
import { PLACE_TYPE_INFO } from '../trip/placeTypes'
import { BriefStep } from './BriefStep'
import { PhrasesStep } from './PhrasesStep'
import { QuizStep } from './QuizStep'

const STEPS = ['The brief', 'The phrases', 'Quiz']

interface LessonPlayerProps {
  lesson: Lesson
  phrases: Phrase[]
  generatedBy: string
  backTo: string
  backLabel: string
  onComplete?: (score: number, durationSeconds: number) => void
}

export function LessonPlayer({ lesson, phrases, generatedBy, backTo, backLabel, onComplete }: LessonPlayerProps) {
  const [step, setStep] = useState(0)
  const [score, setScore] = useState<number | null>(null)
  const [startedAt] = useState(() => Date.now())
  const questions = useMemo(() => buildQuiz(phrases), [phrases])

  function finishQuiz(correct: number) {
    setScore(correct)
    setStep(3)
    onComplete?.(correct, Math.round((Date.now() - startedAt) / 1000))
  }

  const type = lesson.place.type as PlaceType
  const info = PLACE_TYPE_INFO[type in PLACE_TYPE_INFO ? type : 'other']

  return (
    <>
      <section className="relative overflow-hidden bg-hero text-on-hero rounded-card p-6 sm:p-8 mb-5">
        <div className="kanga-dots absolute inset-0 opacity-30 pointer-events-none" aria-hidden="true" />
        <div className="relative">
          <p className="text-sm font-bold opacity-80">{info.emoji} {info.label}</p>
          <h1 className="text-3xl sm:text-5xl mt-1">{lesson.place.name}</h1>
          <p className="text-xs mt-3 opacity-80">
            {generatedBy === 'template' ? 'General lesson for this kind of place' : 'Written for this place'}
          </p>
        </div>
      </section>

      {step < 3 && (
        <div className="mb-5 px-1">
          <ProgressBar value={step + 1} max={STEPS.length} label="Lesson progress" />
          <p className="text-sm font-bold mt-2">{STEPS[step]}</p>
        </div>
      )}

      <Card>
        {step === 0 && <BriefStep brief={lesson.brief} />}
        {step === 1 && <PhrasesStep phrases={phrases} lessonPhrases={lesson.phrases} />}
        {step === 2 && <QuizStep questions={questions} onFinish={finishQuiz} />}
        {step === 3 && (
          <div className="text-center">
            <p className="text-4xl mb-2" aria-hidden="true">🎉</p>
            <h2 className="text-3xl mb-2">Safari njema</h2>
            <p className="text-muted">You got {score} of {questions.length} right and met {phrases.length} phrases.</p>
            <Link to={backTo} className="block mt-6"><Button full tabIndex={-1}>{backLabel}</Button></Link>
          </div>
        )}
        {step < 2 && (
          <div className="mt-6 flex gap-3">
            {step > 0 && <Button variant="soft" onClick={() => setStep(step - 1)}>Back</Button>}
            <Button className="flex-1" onClick={() => setStep(step + 1)}>Continue</Button>
          </div>
        )}
      </Card>
      {step === 3 && <ReviewNote />}
    </>
  )
}
