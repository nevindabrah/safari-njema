// Step three: multiple choice in both directions. Tap an answer, see if it was right, move on.
// Exists as the recognise step, using the pure buildQuiz function.
import { useState } from 'react'
import { Button } from '../../components/Button'
import type { QuizQuestion } from '../../lib/quiz'

interface QuizStepProps {
  questions: QuizQuestion[]
  onFinish: (correct: number) => void
}

export function QuizStep({ questions, onFinish }: QuizStepProps) {
  const [index, setIndex] = useState(0)
  const [chosen, setChosen] = useState<number | null>(null)
  const [correct, setCorrect] = useState(0)
  const question = questions[index]

  if (!question) {
    return <p className="text-muted">Not enough phrases for a quiz.</p>
  }

  function choose(i: number) {
    if (chosen !== null) return
    setChosen(i)
    if (i === question.correctIndex) setCorrect((c) => c + 1)
  }

  function next() {
    if (index + 1 >= questions.length) {
      onFinish(correct)
      return
    }
    setIndex(index + 1)
    setChosen(null)
  }

  const promptLang = question.direction === 'sw_to_en' ? 'sw' : 'en'
  const optionLang = question.direction === 'sw_to_en' ? 'en' : 'sw'

  return (
    <div>
      <p className="text-sm text-muted font-bold mb-2">Question {index + 1} of {questions.length}</p>
      <p className="text-sm text-muted">{question.direction === 'sw_to_en' ? 'What does this mean?' : 'How do you say this in Swahili?'}</p>
      <p lang={promptLang} className="font-display font-extrabold text-3xl mt-1 mb-5">{question.prompt}</p>
      <ul className="flex flex-col gap-3">
        {question.options.map((option, i) => {
          let bg = 'var(--tint)'
          if (chosen !== null && i === question.correctIndex) bg = 'var(--success)'
          else if (chosen === i) bg = 'var(--accent)'
          const picked = chosen !== null && (i === question.correctIndex || i === chosen)
          return (
            <li key={option}>
              <button
                type="button"
                lang={optionLang}
                onClick={() => choose(i)}
                disabled={chosen !== null}
                className="w-full text-left px-5 min-h-[52px] rounded-input font-bold cursor-pointer disabled:cursor-default"
                style={{ background: bg, color: picked ? 'var(--on-accent)' : 'var(--text)' }}
              >
                {option}
              </button>
            </li>
          )
        })}
      </ul>
      {chosen !== null && (
        <div className="mt-5">
          <p className="font-bold mb-3" role="status">{chosen === question.correctIndex ? 'Right.' : 'Not quite. The green one is correct.'}</p>
          <Button full onClick={next}>{index + 1 >= questions.length ? 'Finish' : 'Next'}</Button>
        </div>
      )}
    </div>
  )
}
