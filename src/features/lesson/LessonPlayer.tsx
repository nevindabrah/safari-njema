// The three step lesson itself: brief, phrases, quiz, then a short end screen. It only renders what it is given.
// Exists apart from LessonScreen so the same player runs a saved lesson and the sample lesson.
import { useEffect, useMemo, useState } from 'react'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { ProgressBar } from '../../components/ProgressBar'
import { buildQuiz } from '../../lib/quiz'
import type { Lesson } from '../../lib/lessonSchema'
import type { Phrase, PlaceType } from '../../lib/types'
import { PLACE_TYPE_INFO } from '../trip/placeTypes'
import { BriefStep } from './BriefStep'
import { PhrasesStep } from './PhrasesStep'
import { QuizStep, type QuizResult } from './QuizStep'
import { LengthPicker } from './LengthPicker'
import { LessonHero } from './LessonHero'
import { LessonEnd } from './LessonEnd'
import { LESSON_LENGTHS, saveLessonLength, savedLessonLength, type LessonLength } from '../../lib/lessonLength'
import { isDemoMode } from '../demo/demoMode'
import { audioUrlFor, preloadPhrases } from '../audio/audio'
import { playSound } from '../../lib/sounds'

const STEPS = ['The brief', 'The phrases', 'Practice']

interface LessonPlayerProps {
  lesson: Lesson
  phrases: Phrase[]
  // Where the quiz finds wrong answers. The whole bank makes guessing harder than the six lesson phrases alone.
  pool?: Phrase[]
  // Used to find the place's photo, and to link to the pocket card. Both are optional, for the sample lesson.
  googlePlaceId?: string | null
  userLessonId?: string
  generatedBy: string
  backTo: string
  backLabel: string
  onComplete?: (score: number, durationSeconds: number) => void
}

export function LessonPlayer({ lesson, phrases, pool, googlePlaceId, userLessonId, generatedBy, backTo, backLabel, onComplete }: LessonPlayerProps) {
  // Step -1 is the length picker. Then 0 the brief, 1 the phrases, 2 the practice, 3 the end.
  const [step, setStep] = useState(-1)
  const [length, setLength] = useState<LessonLength>(savedLessonLength)
  const [result, setResult] = useState<QuizResult | null>(null)
  const [startedAt] = useState(() => Date.now())
  // A lesson holds up to eight phrases, most needed first. The length decides how many of them are studied.
  const studied = useMemo(() => phrases.slice(0, LESSON_LENGTHS[length].phrases), [phrases, length])
  const hasAudio = (swahili: string) => audioUrlFor(swahili) !== null
  const exercises = useMemo(() => buildQuiz(studied, pool ?? phrases, Math.random, hasAudio), [studied, pool, phrases])
  const sizes = useMemo(() => {
    const sizeOf = (l: LessonLength) => {
      const some = phrases.slice(0, LESSON_LENGTHS[l].phrases)
      return { phrases: some.length, exercises: buildQuiz(some, pool ?? phrases, Math.random, hasAudio).length }
    }
    return { quick: sizeOf('quick'), standard: sizeOf('standard'), deep: sizeOf('deep') }
  }, [phrases, pool])

  // Fetch this lesson's recordings while the learner reads the brief, so every tap plays at once.
  useEffect(() => {
    preloadPhrases(studied.map((p) => p.swahili))
  }, [studied])

  function chooseLength(next: LessonLength) {
    setLength(next)
    saveLessonLength(next)
  }

  function finishQuiz(quizResult: QuizResult) {
    setResult(quizResult)
    setStep(3)
    playSound('complete')
    onComplete?.(quizResult.correct, Math.round((Date.now() - startedAt) / 1000))
  }

  const type = (lesson.place.type in PLACE_TYPE_INFO ? lesson.place.type : 'other') as PlaceType
  const note = generatedBy !== 'template' ? 'Written for this place' : isDemoMode ? 'Demo lesson built from the phrase bank. With the Claude API on, the brief is written for this exact place.' : 'General lesson for this kind of place'

  return (
    <>
      <LessonHero lesson={lesson} placeType={type} googlePlaceId={googlePlaceId ?? null} note={note} />

      {step >= 0 && step < 3 && (
        <div className="mb-5 px-1">
          <ProgressBar value={step + 1} max={STEPS.length} label="Lesson progress" />
          <p className="text-sm font-bold mt-2">{STEPS[step]}</p>
        </div>
      )}

      <Card>
        {step === -1 && <LengthPicker selected={length} sizes={sizes} onSelect={chooseLength} onStart={() => setStep(0)} />}
        {step === 0 && <BriefStep brief={lesson.brief} />}
        {step === 1 && <PhrasesStep phrases={studied} lessonPhrases={lesson.phrases} />}
        {step === 2 && <QuizStep exercises={exercises} onFinish={finishQuiz} />}
        {step === 3 && result && <LessonEnd lesson={lesson} studied={studied} result={result} backTo={backTo} backLabel={backLabel} userLessonId={userLessonId} />}
        {step >= 0 && step < 2 && (
          <div className="mt-6 flex gap-3">
            <Button variant="soft" onClick={() => setStep(step - 1)}>Back</Button>
            <Button className="flex-1" onClick={() => setStep(step + 1)}>Continue</Button>
          </div>
        )}
      </Card>
    </>
  )
}
