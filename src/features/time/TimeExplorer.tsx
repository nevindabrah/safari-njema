// The interactive part of the time screen: the clock, which hand to move, an am or pm switch, and a live readout or the practice.
// Exists to hold the state they all share: the hour and minute the clock is set to.
import { useState } from 'react'
import { Icon } from '../../components/icons'
import { clockLabel, swahiliTime, timeInWords, toHour24 } from '../../lib/swahiliTime'
import { SwahiliClock } from './SwahiliClock'
import { TimePractice } from './TimePractice'
import { TimeSpeakButton } from './TimeSpeakButton'
import { PART_WORDS, pronounce, sayTime } from './timeWords'

export function TimeExplorer() {
  const [clock12, setClock12] = useState(8)
  const [minute, setMinute] = useState(0)
  const [pm, setPm] = useState(false)
  const [moving, setMoving] = useState<'hour' | 'minute'>('hour')
  const [practising, setPractising] = useState(false)
  const hour24 = toHour24(clock12, pm)
  const said = swahiliTime(hour24, minute)

  function setToNow() {
    const now = new Date()
    setClock12(now.getHours() % 12 === 0 ? 12 : now.getHours() % 12)
    setPm(now.getHours() >= 12)
    setMinute(now.getMinutes())
  }

  const tab = (active: boolean) => `flex-1 min-h-[44px] rounded-pill text-sm font-bold cursor-pointer ${active ? 'bg-primary text-on-primary' : 'text-text'}`
  const group = 'flex gap-1 p-1 rounded-pill bg-surface'

  return (
    <div className="mt-5 rounded-card bg-tint p-4 sm:p-6">
      <div className={`${group} mb-4`} role="group" aria-label="Explore or practise">
        <button type="button" aria-pressed={!practising} onClick={() => setPractising(false)} className={tab(!practising)}>Explore</button>
        <button type="button" aria-pressed={practising} onClick={() => setPractising(true)} className={tab(practising)}>Practise</button>
      </div>

      <SwahiliClock clock12={clock12} minute={minute} moving={moving} onHour={setClock12} onMinute={setMinute} showSwahili={!practising} />

      <div className={`${group} mt-3`} role="group" aria-label="Which hand to move">
        <button type="button" aria-pressed={moving === 'hour'} onClick={() => setMoving('hour')} className={tab(moving === 'hour')}>Hour hand</button>
        <button type="button" aria-pressed={moving === 'minute'} onClick={() => setMoving('minute')} className={tab(moving === 'minute')}>Minute hand</button>
      </div>
      <p className="text-xs text-muted text-center mt-2">
        {moving === 'minute' ? 'Tap a number or drag the pink hand. The inner numbers are minutes.' : practising ? 'Tap a number or drag the dark hand.' : 'Tap a number or drag the dark hand. Outer numbers are the watch. Inner numbers are the Swahili hour.'}
      </p>

      <div className="flex items-center justify-center gap-2 mt-3">
        <div className={group} role="group" aria-label="Morning or afternoon">
          <button type="button" aria-pressed={!pm} onClick={() => setPm(false)} className={`${tab(!pm)} px-5 flex items-center gap-1.5`}><Icon name="sun" size={16} />am</button>
          <button type="button" aria-pressed={pm} onClick={() => setPm(true)} className={`${tab(pm)} px-5 flex items-center gap-1.5`}><Icon name="moon" size={16} />pm</button>
        </div>
        {!practising && <button type="button" onClick={setToNow} className="min-h-[44px] px-4 rounded-pill bg-surface text-sm font-bold cursor-pointer">Now</button>}
      </div>

      {practising ? <TimePractice hour24={hour24} minute={minute} /> : (
        <div className="grid grid-cols-1 min-[420px]:grid-cols-[auto_1fr] gap-x-5 gap-y-2 mt-4" aria-live="polite">
          <p><span className="block text-xs font-bold text-muted">On a watch</span><span className="font-display font-extrabold text-2xl whitespace-nowrap">{clockLabel(hour24, minute)}</span></p>
          <div className="flex items-start gap-3">
            <p className="flex-1 min-w-0">
              <span className="block text-xs font-bold text-muted">In Swahili</span>
              <span lang="sw" className="font-display font-extrabold text-2xl leading-tight block">{sayTime(said)}</span>
              <span className="block text-sm font-bold text-accent-text mt-0.5">{pronounce(sayTime(said))}</span>
              <span className="text-sm text-muted">{timeInWords(said)}, {PART_WORDS[said.part]}</span>
            </p>
            <TimeSpeakButton swahili={sayTime(said)} fallback={<span className="text-xs text-muted max-w-[8rem] text-right">No recording of this minute yet.</span>} />
          </div>
        </div>
      )}
    </div>
  )
}
