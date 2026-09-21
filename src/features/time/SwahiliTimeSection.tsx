// A short section on telling time in Swahili: the story of why 7 am is "hour one", the rule, and a slider to try any hour.
// Exists because this is the one thing that makes travellers miss a bus: an agreed "saa mbili" is 8 am, not 2.
import { useState } from 'react'
import { Card } from '../../components/Card'
import { Icon } from '../../components/icons'
import { clockLabel, swahiliHour } from '../../lib/swahiliTime'
import { ASK_THE_TIME, PART_WORDS, sayHour } from './timeWords'

export function SwahiliTimeSection() {
  const [hour24, setHour24] = useState(8)
  // Starts folded to one line, so the phrase list below it stays within easy reach on a phone.
  const [open, setOpen] = useState(false)
  return (
    <Card className="mt-5">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="w-full flex items-center justify-between gap-3 text-left cursor-pointer min-h-[44px]">
        <span>
          <span className="block text-xs uppercase tracking-wide font-bold text-muted">Telling time</span>
          <span className="block font-display font-extrabold text-2xl sm:text-3xl mt-1">Why 7 am is hour one</span>
        </span>
        <span className="w-11 h-11 shrink-0 rounded-pill bg-tint flex items-center justify-center"><Icon name={open ? 'close' : 'arrow'} size={18} /></span>
      </button>
      {open && <TimeStory hour24={hour24} onHour={setHour24} />}
    </Card>
  )
}

function TimeStory({ hour24, onHour }: { hour24: number; onHour: (hour: number) => void }) {
  const { hour, part } = swahiliHour(hour24)
  return (
    <>
      <p className="mt-3 leading-relaxed">
        Swahili time counts from sunrise, not from midnight. Kenya sits on the equator, so the sun comes up at about six and goes down at about six, every day of the year.
        The first full hour of daylight, which a watch calls 7 am, is hour one. When darkness falls the count starts again, so 7 pm is hour one of the night.
      </p>
      <p className="mt-3 leading-relaxed">
        The rule is simple: add or take away six. Many people keep their watch on clock time and say the Swahili hour out loud.
        So when you agree a pickup time, check which way you both mean. Hour two in the morning is 8 am, not 2.
      </p>

      <div className="mt-5 rounded-input bg-tint p-4">
        <label htmlFor="time-hour" className="text-sm font-bold">Slide to any hour</label>
        <input id="time-hour" type="range" min={0} max={23} step={1} value={hour24} onChange={(e) => onHour(Number(e.target.value))}
          aria-valuetext={clockLabel(hour24)} className="w-full mt-2 h-11 cursor-pointer" style={{ accentColor: 'var(--accent)' }} />
        <div className="grid grid-cols-2 gap-3 mt-1" aria-live="polite">
          <p><span className="block text-xs font-bold text-muted">On a watch</span><span className="font-display font-extrabold text-2xl">{clockLabel(hour24)}</span></p>
          <p>
            <span className="block text-xs font-bold text-muted">In Swahili</span>
            <span lang="sw" className="font-display font-extrabold text-2xl leading-tight block">{sayHour(hour, part)}</span>
            <span className="text-sm text-muted">hour {hour}, {PART_WORDS[part]}</span>
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm">To ask: <b lang="sw">{ASK_THE_TIME.swahili}</b> <span className="text-muted">{ASK_THE_TIME.english}</span></p>
      <p className="mt-3 text-xs text-muted">
        <span className="inline-block rounded-pill bg-tint text-text font-bold px-2 py-0.5 mr-1">Not yet reviewed</span>
        The time words here were added after the teacher's review of the phrasebook and are waiting for a check. Where one part of the day ends and the next begins also varies from speaker to speaker.
      </p>
    </>
  )
}
