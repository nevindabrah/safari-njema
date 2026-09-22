// The practice half of the clock: a time is given in Swahili, and the learner sets the clock to match, then checks it.
// Exists because reading the rule is not the same as using it. Getting "saa mbili" wrong here is cheaper than missing a bus.
import { useState } from 'react'
import { Button } from '../../components/Button'
import { clockLabel, swahiliTime } from '../../lib/swahiliTime'
import { playSound } from '../../lib/sounds'
import { pronounce, sayTime } from './timeWords'
import { TimeSpeakButton } from './TimeSpeakButton'

interface TimePracticeProps {
  hour24: number
  minute: number
}

function randomTime(not: number): number {
  let next = not
  while (next === not) next = Math.floor(Math.random() * 288) * 5
  return next
}

export function TimePractice({ hour24, minute }: TimePracticeProps) {
  const set = hour24 * 60 + minute
  const [target, setTarget] = useState(() => randomTime(set))
  const [outcome, setOutcome] = useState<'right' | 'wrong' | null>(null)
  const [streak, setStreak] = useState(0)
  const targetHour = Math.floor(target / 60)
  const targetMinute = target % 60
  const asked = swahiliTime(targetHour, targetMinute)

  function check() {
    const right = set === target
    setOutcome(right ? 'right' : 'wrong')
    setStreak(right ? streak + 1 : 0)
    playSound(right ? 'correct' : 'wrong')
  }

  function another() {
    setTarget(randomTime(target))
    setOutcome(null)
  }

  return (
    <div className="mt-3" aria-live="polite">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-muted">Set the clock to</p>
          <p lang="sw" className="font-display font-extrabold text-2xl leading-tight">{sayTime(asked)}</p>
          <p className="text-sm font-bold text-accent-text mt-0.5">{pronounce(sayTime(asked))}</p>
        </div>
        <TimeSpeakButton swahili={sayTime(asked)} />
      </div>
      {outcome === null && <Button full className="mt-3" silent onClick={check}>Check {clockLabel(hour24, minute)}</Button>}
      {outcome !== null && (
        <div className="mt-3 rounded-input p-3" style={{ background: outcome === 'right' ? 'var(--right-soft)' : 'var(--wrong-soft)' }}>
          <p className="font-bold">{outcome === 'right' ? `Yes, that is ${clockLabel(targetHour, targetMinute)}.` : `Not quite. It is ${clockLabel(targetHour, targetMinute)}. Hour ${asked.hour} is six hours from the watch.`}</p>
          {streak >= 2 && <p className="text-sm">{streak} in a row.</p>}
          <Button full variant="soft" className="mt-2" onClick={another}>Try another</Button>
        </div>
      )}
    </div>
  )
}
