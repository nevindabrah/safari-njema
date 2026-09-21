// The practice half of the clock: a time is given in Swahili, and the learner sets the clock to match, then checks it.
// Exists because reading the rule is not the same as using it. Getting "saa mbili" wrong here is cheaper than missing a bus.
import { useState } from 'react'
import { Button } from '../../components/Button'
import { clockLabel, swahiliHour } from '../../lib/swahiliTime'
import { playSound } from '../../lib/sounds'
import { sayHour } from './timeWords'

interface TimePracticeProps {
  // What the clock and the am or pm switch are set to right now, 0 to 23.
  hour24: number
}

function randomHour(not: number): number {
  let next = not
  while (next === not) next = Math.floor(Math.random() * 24)
  return next
}

export function TimePractice({ hour24 }: TimePracticeProps) {
  const [target, setTarget] = useState(() => randomHour(hour24))
  const [outcome, setOutcome] = useState<'right' | 'wrong' | null>(null)
  const [streak, setStreak] = useState(0)
  const asked = swahiliHour(target)

  function check() {
    const right = hour24 === target
    setOutcome(right ? 'right' : 'wrong')
    setStreak(right ? streak + 1 : 0)
    playSound(right ? 'correct' : 'wrong')
  }

  function another() {
    setTarget(randomHour(target))
    setOutcome(null)
  }

  return (
    <div className="mt-3" aria-live="polite">
      <p className="text-xs font-bold text-muted">Set the clock to</p>
      <p lang="sw" className="font-display font-extrabold text-2xl leading-tight">{sayHour(asked.hour, asked.part)}</p>
      {outcome === null && <Button full className="mt-3" silent onClick={check}>Check {clockLabel(hour24)}</Button>}
      {outcome !== null && (
        <div className="mt-3 rounded-input p-3" style={{ background: outcome === 'right' ? 'var(--right-soft)' : 'var(--wrong-soft)' }}>
          <p className="font-bold">{outcome === 'right' ? `Yes, that is ${clockLabel(target)}.` : `Not quite. It is ${clockLabel(target)}, six hours from hour ${asked.hour}.`}</p>
          {streak >= 2 && <p className="text-sm">{streak} in a row.</p>}
          <Button full variant="soft" className="mt-2" onClick={another}>Try another</Button>
        </div>
      )}
    </div>
  )
}
