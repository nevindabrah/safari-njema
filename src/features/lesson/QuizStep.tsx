// The quiz: four rounds of multiple choice, then a second chance at anything missed. Only first tries count for the score.
// Exists as the practice step of a lesson. The questions come from the pure buildQuiz function.
import { useRef, useState } from 'react'
import { Button } from '../../components/Button'
import { ProgressBar } from '../../components/ProgressBar'
import { ROUNDS, type QuizQuestion } from '../../lib/quiz'
import { playSound } from '../../lib/sounds'

export interface QuizResult {
  correct: number
  total: number
  missedPhraseIds: string[]
}

interface QuizStepProps {
  questions: QuizQuestion[]
  onFinish: (result: QuizResult) => void
}

export function QuizStep({ questions, onFinish }: QuizStepProps) {
  const [queue, setQueue] = useState(questions)
  const [secondChance, setSecondChance] = useState(false)
  const [index, setIndex] = useState(0)
  const [chosen, setChosen] = useState<number | null>(null)
  const [correct, setCorrect] = useState(0)
  const [missed, setMissed] = useState<QuizQuestion[]>([])
  // A ref changes at once, unlike state. It stops two taps in the same instant from both counting as answers.
  const answered = useRef(false)
  const question = queue[index]

  if (!question) return <p className="text-muted">Not enough phrases for a quiz.</p>

  const roundsInQuiz = ROUNDS.filter((r) => questions.some((q) => q.kind === r.kind))
  const round = ROUNDS.find((r) => r.kind === question.kind)!
  const roundNumber = roundsInQuiz.findIndex((r) => r.kind === question.kind) + 1
  const isRight = chosen === question.correctIndex

  function choose(i: number) {
    if (answered.current) return
    answered.current = true
    setChosen(i)
    const right = i === question.correctIndex
    playSound(right ? 'correct' : 'wrong')
    if (secondChance) return
    if (right) setCorrect((c) => c + 1)
    else setMissed((list) => [...list, question])
  }

  function next() {
    answered.current = false
    setChosen(null)
    if (index + 1 < queue.length) return setIndex(index + 1)
    // The end of the main quiz. Anything missed comes back once, and does not change the score.
    if (!secondChance && missed.length > 0) {
      setQueue(missed)
      setSecondChance(true)
      return setIndex(0)
    }
    onFinish({ correct, total: questions.length, missedPhraseIds: [...new Set(missed.map((q) => q.phraseId))] })
  }

  // The button says Finish only when nothing will follow: the last question, with no second chance round still to come.
  const missedSoFar = missed.length + (chosen !== null && !isRight && !secondChance && !missed.includes(question) ? 1 : 0)
  const lastQuestion = index + 1 >= queue.length && (secondChance || missedSoFar === 0)

  return (
    <div>
      <p className="inline-block text-xs font-bold uppercase tracking-wide rounded-pill bg-tint px-3 py-1 mb-3">
        {secondChance ? 'Second chance' : `Round ${roundNumber} of ${roundsInQuiz.length} · ${round.title}`}
      </p>
      <ProgressBar value={index + 1} max={queue.length} label="Quiz progress" />
      <p className="text-sm text-muted mt-4">{round.instruction}</p>
      <p
        lang={question.promptLang === 'none' ? undefined : question.promptLang}
        className="font-display font-extrabold text-3xl mt-1"
        style={question.kind === 'sounds_like' ? { color: 'var(--accent)' } : undefined}
      >
        {question.prompt}
      </p>
      {question.hint && <p className="text-muted mt-1">{question.hint}</p>}

      <ul className="flex flex-col gap-3 mt-5">
        {question.options.map((option, i) => {
          let background = 'var(--tint)'
          if (chosen !== null && i === question.correctIndex) background = 'var(--success)'
          else if (chosen === i) background = 'var(--accent)'
          const marked = chosen !== null && (i === question.correctIndex || i === chosen)
          return (
            <li key={option}>
              <button
                type="button"
                lang={question.optionLang}
                onClick={() => choose(i)}
                disabled={chosen !== null}
                className="w-full text-left px-5 py-3 min-h-[52px] rounded-input font-bold cursor-pointer disabled:cursor-default"
                style={{ background, color: marked ? 'var(--on-accent)' : 'var(--text)' }}
              >
                {option}
              </button>
            </li>
          )
        })}
      </ul>

      {chosen !== null && (
        <div className="mt-5">
          <p className="font-bold mb-3" role="status">{isRight ? 'Right.' : 'Not quite. The green one is correct.'}</p>
          <Button full onClick={next}>{lastQuestion ? 'Finish' : 'Next'}</Button>
        </div>
      )}
    </div>
  )
}
