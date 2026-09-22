// A clock face with an hour hand and a minute hand. The outer ring is what a watch says. The inner ring is the hour said in Swahili.
// Exists so the six hour shift can be seen, not just read. One hand is "live" at a time: tap a number or drag its knob to move it.
import { useRef, useState } from 'react'
import { hourFromPoint, minuteFromPoint, swahiliHour } from '../../lib/swahiliTime'

interface SwahiliClockProps {
  clock12: number
  minute: number
  moving: 'hour' | 'minute'
  onHour: (clock12: number) => void
  onMinute: (minute: number) => void
  showSwahili: boolean
}

const HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
const at = (degrees: number, radius: number) => ({ x: Math.sin((degrees * Math.PI) / 180) * radius, y: -Math.cos((degrees * Math.PI) / 180) * radius })

export function SwahiliClock({ clock12, minute, moving, onHour, onMinute, showSwahili }: SwahiliClockProps) {
  const face = useRef<SVGSVGElement>(null)
  const [focused, setFocused] = useState<number | null>(null)
  const ink = 'var(--text)'
  const hourAngle = (clock12 % 12) * 30 + minute / 2
  const minuteAngle = minute * 6
  const hourTip = at(hourAngle, 42)
  const minuteTip = at(minuteAngle, 76)
  const knob = moving === 'hour' ? at(hourAngle, 34) : at(minuteAngle, 40)

  function choose(position: number) {
    if (moving === 'hour') onHour(position)
    else onMinute((position % 12) * 5)
  }

  function drag(event: React.PointerEvent) {
    const box = face.current!.getBoundingClientRect()
    const dx = event.clientX - (box.left + box.width / 2)
    const dy = event.clientY - (box.top + box.height / 2)
    if (moving === 'hour' && hourFromPoint(dx, dy) !== clock12) onHour(hourFromPoint(dx, dy))
    if (moving === 'minute' && minuteFromPoint(dx, dy) !== minute) onMinute(minuteFromPoint(dx, dy))
  }

  return (
    <svg ref={face} viewBox="-110 -110 220 220" className="w-full max-w-[19rem] mx-auto block select-none" role="group" aria-label={`Clock face. Choose the ${moving}`}>
      <circle r="106" fill="var(--surface)" stroke="var(--hero)" strokeWidth="5" />
      <line x1="0" y1="0" x2={minuteTip.x} y2={minuteTip.y} stroke="var(--accent)" strokeWidth="3.5" strokeLinecap="round" opacity={moving === 'minute' ? 1 : 0.55} />
      <line x1="0" y1="0" x2={hourTip.x} y2={hourTip.y} stroke={ink} strokeWidth="6.5" strokeLinecap="round" opacity={moving === 'hour' ? 1 : 0.55} />
      {HOURS.map((position) => {
        const outer = at(position * 30, 90)
        const inner = at(position * 30, 63)
        const minuteHere = (position % 12) * 5
        const chosen = moving === 'hour' ? position === clock12 : minuteHere === minute
        const innerText = moving === 'hour' ? (showSwahili ? String(swahiliHour(position).hour) : '') : String(minuteHere).padStart(2, '0')
        return (
          <g key={position} role="button" tabIndex={0} aria-label={moving === 'hour' ? `${position} o'clock` : `${minuteHere} minutes`} aria-pressed={chosen} className="cursor-pointer" style={{ outline: 'none' }}
            onClick={() => choose(position)} onFocus={() => setFocused(position)} onBlur={() => setFocused(null)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(position) } }}>
            <circle cx={at(position * 30, 76).x} cy={at(position * 30, 76).y} r="24" fill="transparent" />
            {focused === position && <circle cx={outer.x} cy={outer.y} r="16" fill="none" stroke={ink} strokeWidth="1.5" strokeDasharray="4 3" />}
            {chosen && moving === 'hour' && <circle cx={outer.x} cy={outer.y} r="13" fill="var(--hero)" />}
            <text x={outer.x} y={outer.y + 6} textAnchor="middle" fontSize="17" fontWeight="800" fill={chosen && moving === 'hour' ? 'var(--on-hero)' : ink} className="font-display">{position}</text>
            {chosen && innerText && <circle cx={inner.x} cy={inner.y} r="11" fill="var(--accent)" />}
            <text x={inner.x} y={inner.y + 4.5} textAnchor="middle" fontSize="12.5" fontWeight="800" fill={chosen ? 'var(--on-accent)' : 'var(--accent-text)'}>{innerText}</text>
          </g>
        )
      })}
      <circle r="6" fill={ink} style={{ pointerEvents: 'none' }} />
      <circle cx={knob.x} cy={knob.y} r="11" fill={moving === 'hour' ? ink : 'var(--accent)'} stroke={moving === 'hour' ? 'var(--accent)' : 'var(--surface)'} strokeWidth="3.5" className="cursor-grab" style={{ touchAction: 'none' }}
        onPointerDown={(e) => e.currentTarget.setPointerCapture(e.pointerId)} onPointerMove={(e) => { if (e.currentTarget.hasPointerCapture(e.pointerId)) drag(e) }} />
    </svg>
  )
}
