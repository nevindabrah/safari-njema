// Build the sentence: tap word tiles into order, tap a placed tile to take it back, then check.
// Exists as one of four exercise kinds. The tiles are the phrase's own words plus a few from other phrases.
import { useState } from 'react'
import { Button } from '../../../components/Button'
import type { BuildExercise as Build } from '../../../lib/quizProduce'
import { playSound } from '../../../lib/sounds'

interface BuildExerciseProps {
  exercise: Build
  onAnswer: (correct: boolean) => void
}

export function BuildExercise({ exercise, onAnswer }: BuildExerciseProps) {
  // Tiles are tracked by their position in the list, because a sentence can use the same word twice.
  const [placed, setPlaced] = useState<number[]>([])
  const [checked, setChecked] = useState(false)

  function place(index: number) {
    if (checked) return
    playSound('tap')
    setPlaced((list) => [...list, index])
  }

  function takeBack(index: number) {
    if (checked) return
    playSound('tap')
    setPlaced((list) => list.filter((i) => i !== index))
  }

  function check() {
    setChecked(true)
    const built = placed.map((i) => exercise.tiles[i])
    onAnswer(built.length === exercise.answer.length && built.every((word, i) => word === exercise.answer[i]))
  }

  const tile = 'px-4 min-h-[44px] rounded-input font-bold cursor-pointer disabled:cursor-default'

  return (
    <div>
      <p className="font-display font-extrabold text-2xl sm:text-3xl">{exercise.english}</p>
      <div lang="sw" className="mt-5 min-h-[64px] rounded-card bg-surface-2 p-3 flex flex-wrap gap-2 items-start" aria-label="Your sentence">
        {placed.length === 0 && <span className="text-muted text-sm px-1 py-2">Tap the words in order.</span>}
        {placed.map((index) => (
          <button key={index} type="button" className={tile} disabled={checked} onClick={() => takeBack(index)} style={{ background: 'var(--primary)', color: 'var(--on-primary)' }}>
            {exercise.tiles[index]}
          </button>
        ))}
      </div>
      <div lang="sw" className="mt-4 flex flex-wrap gap-2">
        {exercise.tiles.map((word, index) => (
          <button key={index} type="button" className={tile} disabled={checked || placed.includes(index)} onClick={() => place(index)}
            style={{ background: 'var(--tint)', color: 'var(--text)', opacity: placed.includes(index) ? 0.3 : 1 }}>
            {word}
          </button>
        ))}
      </div>
      {!checked && <Button full silent className="mt-5" onClick={check} disabled={placed.length === 0}>Check</Button>}
    </div>
  )
}
