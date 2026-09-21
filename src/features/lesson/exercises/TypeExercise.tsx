// Type the answer in Swahili. Case and punctuation are ignored, and one small typo is forgiven.
// Exists as one of four exercise kinds, for short phrases. The checking itself is the pure checkTyped function.
import { useState, type FormEvent } from 'react'
import { Button } from '../../../components/Button'
import { checkTyped } from '../../../lib/checkTyped'
import type { TypeExercise as Typed } from '../../../lib/quizProduce'

interface TypeExerciseProps {
  exercise: Typed
  onAnswer: (correct: boolean, note?: string) => void
}

export function TypeExercise({ exercise, onAnswer }: TypeExerciseProps) {
  const [text, setText] = useState('')
  const [checked, setChecked] = useState(false)

  function check(event: FormEvent) {
    event.preventDefault()
    if (checked || text.trim() === '') return
    setChecked(true)
    const result = checkTyped(exercise.answer, text)
    onAnswer(result !== 'wrong', result === 'close' ? 'Almost. Check the spelling.' : undefined)
  }

  return (
    <form onSubmit={check}>
      <p className="font-display font-extrabold text-2xl sm:text-3xl">{exercise.english}</p>
      <label className="block mt-5">
        <span className="sr-only">Your answer in Swahili</span>
        <input
          lang="sw" type="text" value={text} onChange={(e) => setText(e.target.value)} disabled={checked}
          autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} placeholder="Type it in Swahili"
          className="w-full min-h-[56px] px-5 rounded-input field text-text text-lg font-bold placeholder:text-muted placeholder:font-normal"
        />
      </label>
      {!checked && <Button type="submit" full silent className="mt-5" disabled={text.trim() === ''}>Check</Button>}
    </form>
  )
}
