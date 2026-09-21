// The interactive part of the time section: the clock, an am or pm switch, and either a live readout or the practice.
// Exists to hold the one piece of state they all share, the hour the clock is set to.
import { useState } from 'react'
import { Icon } from '../../components/icons'
import { clockLabel, swahiliHour, toHour24 } from '../../lib/swahiliTime'
import { SwahiliClock } from './SwahiliClock'
import { TimePractice } from './TimePractice'
import { PART_WORDS, sayHour } from './timeWords'

export function TimeExplorer() {
  const [clock12, setClock12] = useState(8)
  const [pm, setPm] = useState(false)
  const [practising, setPractising] = useState(false)
  const hour24 = toHour24(clock12, pm)
  const { hour, part } = swahiliHour(hour24)
  // Dark from seven in the evening until the hour before sunrise.
  const night = hour24 >= 19 || hour24 < 6

  function setToNow() {
    const now = new Date().getHours()
    setClock12(now % 12 === 0 ? 12 : now % 12)
    setPm(now >= 12)
  }

  const tab = (active: boolean) => `flex-1 min-h-[44px] rounded-pill text-sm font-bold cursor-pointer ${active ? 'bg-primary text-on-primary' : 'text-text'}`

  return (
    <div className="mt-5 rounded-input bg-tint p-4">
      <div className="flex gap-1 p-1 rounded-pill bg-surface mb-4" role="group" aria-label="Explore or practise">
        <button type="button" aria-pressed={!practising} onClick={() => setPractising(false)} className={tab(!practising)}>Explore</button>
        <button type="button" aria-pressed={practising} onClick={() => setPractising(true)} className={tab(practising)}>Practise</button>
      </div>

      <SwahiliClock clock12={clock12} onHour={setClock12} night={night} showSwahili={!practising} />
      <p className="text-xs text-muted text-center mt-2">
        {practising ? 'Tap an hour or drag the hand, then choose am or pm.' : 'Tap an hour or drag the hand. Outer numbers are the watch. Inner numbers are the Swahili hour.'}
      </p>

      <div className="flex items-center justify-center gap-2 mt-3">
        <div className="flex gap-1 p-1 rounded-pill bg-surface" role="group" aria-label="Morning or afternoon">
          <button type="button" aria-pressed={!pm} onClick={() => setPm(false)} className={`${tab(!pm)} px-5 flex items-center gap-1.5`}><Icon name="sun" size={16} />am</button>
          <button type="button" aria-pressed={pm} onClick={() => setPm(true)} className={`${tab(pm)} px-5 flex items-center gap-1.5`}><Icon name="moon" size={16} />pm</button>
        </div>
        {!practising && <button type="button" onClick={setToNow} className="min-h-[44px] px-4 rounded-pill bg-surface text-sm font-bold cursor-pointer">Now</button>}
      </div>

      {practising ? <TimePractice hour24={hour24} /> : (
        <div className="grid grid-cols-2 gap-3 mt-4" aria-live="polite">
          <p><span className="block text-xs font-bold text-muted">On a watch</span><span className="font-display font-extrabold text-2xl">{clockLabel(hour24)}</span></p>
          <p>
            <span className="block text-xs font-bold text-muted">In Swahili</span>
            <span lang="sw" className="font-display font-extrabold text-2xl leading-tight block">{sayHour(hour, part)}</span>
            <span className="text-sm text-muted">hour {hour}, {PART_WORDS[part]}</span>
          </p>
        </div>
      )}
    </div>
  )
}
