// A multiple choice exercise: meaning, recall, sounds like, fill the gap, or true or false.
// Exists as one of four exercise kinds. It shows the options, marks the answer, and reports right or wrong once.
import { useEffect, useRef, useState } from 'react'
import type { ChoiceExercise as Choice } from '../../../lib/quizChoice'
import { playPhrase } from '../../audio/audio'
import { SpeakButton } from '../../audio/SpeakButton'

interface ChoiceExerciseProps {
  exercise: Choice
  onAnswer: (correct: boolean) => void
}

export function ChoiceExercise({ exercise, onAnswer }: ChoiceExerciseProps) {
  const [chosen, setChosen] = useState<number | null>(null)
  // A ref changes at once, unlike state. It stops two taps in the same instant from both counting.
  const answered = useRef(false)

  function choose(i: number) {
    if (answered.current) return
    answered.current = true
    setChosen(i)
    onAnswer(i === exercise.correctIndex)
  }

  // A listening exercise speaks as soon as it appears. The tap that brought the learner here allows the sound.
  useEffect(() => {
    if (exercise.variant === 'listen') playPhrase(exercise.say)
  }, [exercise])

  // Number keys pick an option, so a laptop user never has to reach for the mouse.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const i = Number(event.key) - 1
      if (Number.isInteger(i) && i >= 0 && i < exercise.options.length) choose(i)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <div>
      {exercise.variant === 'listen' && (
        <div className="flex items-center gap-4 py-2">
          <SpeakButton swahili={exercise.say} size="large" />
          <p className="text-muted">Tap to hear it again.</p>
        </div>
      )}
      <p lang={exercise.promptLang === 'none' ? undefined : exercise.promptLang} className="font-display font-extrabold text-3xl"
        style={exercise.variant === 'sounds_like' ? { color: 'var(--accent)' } : undefined}>
        {exercise.prompt}
      </p>
      {exercise.hint && <p className={exercise.variant === 'true_false' ? 'mt-3 text-xl font-bold' : 'mt-1 text-muted'}>{exercise.variant === 'true_false' ? `“${exercise.hint}”` : exercise.hint}</p>}
      <ul className="flex flex-col gap-3 mt-5">
        {exercise.options.map((option, i) => {
          let background = 'var(--tint)'
          if (chosen !== null && i === exercise.correctIndex) background = 'var(--success)'
          else if (chosen === i) background = 'var(--accent)'
          const marked = chosen !== null && (i === exercise.correctIndex || i === chosen)
          return (
            <li key={option}>
              <button type="button" lang={exercise.optionLang} onClick={() => choose(i)} disabled={chosen !== null}
                className="w-full text-left px-5 py-3 min-h-[52px] rounded-input font-bold cursor-pointer disabled:cursor-default"
                style={{ background, color: marked ? 'var(--on-accent)' : 'var(--text)' }}>
                <span className="hidden sm:inline-block w-6 text-xs opacity-50" aria-hidden="true">{i + 1}</span>{option}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
