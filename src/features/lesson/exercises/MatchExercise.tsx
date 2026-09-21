// Match the pairs: tap a Swahili phrase, then its English meaning. Matched pairs turn green and drop out.
// Exists as one of four exercise kinds. It is right only if every pair was matched without a wrong guess.
import { useState } from 'react'
import type { MatchExercise as Match } from '../../../lib/quizProduce'
import { playSound } from '../../../lib/sounds'

interface MatchExerciseProps {
  exercise: Match
  onAnswer: (correct: boolean, missedPhraseIds: string[]) => void
}

export function MatchExercise({ exercise, onAnswer }: MatchExerciseProps) {
  const [selected, setSelected] = useState<string | null>(null)
  const [matched, setMatched] = useState<string[]>([])
  const [wrongPair, setWrongPair] = useState<[string, string] | null>(null)
  const [missed, setMissed] = useState<string[]>([])

  function pickEnglish(phraseId: string) {
    if (!selected || matched.includes(phraseId)) return
    if (phraseId === selected) {
      const nowMatched = [...matched, phraseId]
      setMatched(nowMatched)
      setSelected(null)
      playSound('select')
      if (nowMatched.length === exercise.pairs.length) onAnswer(missed.length === 0, missed)
      return
    }
    // A wrong guess: flash both cards, remember the phrase, and let the learner try again.
    playSound('wrong')
    setMissed((list) => (list.includes(selected) ? list : [...list, selected]))
    setWrongPair([selected, phraseId])
    setTimeout(() => setWrongPair(null), 500)
    setSelected(null)
  }

  function cardStyle(phraseId: string, side: 'sw' | 'en') {
    if (matched.includes(phraseId)) return { background: 'var(--success)', color: 'var(--on-accent)', opacity: 0.55 }
    if (wrongPair && wrongPair[side === 'sw' ? 0 : 1] === phraseId) return { background: 'var(--accent)', color: 'var(--on-accent)' }
    if (side === 'sw' && selected === phraseId) return { background: 'var(--primary)', color: 'var(--on-primary)' }
    return { background: 'var(--tint)', color: 'var(--text)' }
  }

  const card = 'w-full text-left px-4 py-3 min-h-[52px] rounded-input font-bold cursor-pointer disabled:cursor-default text-sm sm:text-base'
  const englishOf = (phraseId: string) => exercise.pairs.find((p) => p.phraseId === phraseId)!.english

  return (
    <div className="grid grid-cols-2 gap-3">
      <ul className="flex flex-col gap-3">
        {exercise.pairs.map((pair) => (
          <li key={pair.phraseId}>
            <button type="button" lang="sw" className={card} style={cardStyle(pair.phraseId, 'sw')} disabled={matched.includes(pair.phraseId)}
              aria-pressed={selected === pair.phraseId} onClick={() => { playSound('tap'); setSelected(pair.phraseId) }}>
              {pair.swahili}
            </button>
          </li>
        ))}
      </ul>
      <ul className="flex flex-col gap-3">
        {exercise.englishOrder.map((phraseId) => (
          <li key={phraseId}>
            <button type="button" className={card} style={cardStyle(phraseId, 'en')} disabled={matched.includes(phraseId) || !selected} onClick={() => pickEnglish(phraseId)}>
              {englishOf(phraseId)}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
