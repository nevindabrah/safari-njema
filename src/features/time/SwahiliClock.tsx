// A clock face with two rings of numbers: the outer ring is what a watch says, the inner ring is the hour said in Swahili.
// Exists so the six hour shift can be seen, not just read: the hand always points at both numbers at once. Tap an hour or drag the hand.
import { useRef, useState } from 'react'
import { hourFromPoint, swahiliHour } from '../../lib/swahiliTime'

interface SwahiliClockProps {
  // The watch hour, 1 to 12.
  clock12: number
  onHour: (clock12: number) => void
  // Night turns the face dark, as a reminder that the Swahili count starts again at sunset.
  night: boolean
  // Practice hides the inner ring, because working it out is the exercise.
  showSwahili: boolean
}

const HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
// Where a number sits on a ring of the given radius. Twelve is straight up.
const spot = (hour: number, radius: number) => ({ x: Math.sin((hour * Math.PI) / 6) * radius, y: -Math.cos((hour * Math.PI) / 6) * radius })

export function SwahiliClock({ clock12, onHour, night, showSwahili }: SwahiliClockProps) {
  const face = useRef<SVGSVGElement>(null)
  const [focused, setFocused] = useState<number | null>(null)
  const ink = night ? 'var(--on-ink)' : 'var(--text)'
  // The knob at the end of the hand, kept inside both rings of numbers so it never covers one.
  const knob = spot(clock12, 32)

  // Dragging the knob at the end of the hand: measure the finger from the middle of the face and snap to the nearest hour.
  function drag(event: React.PointerEvent) {
    const box = face.current!.getBoundingClientRect()
    const hour = hourFromPoint(event.clientX - (box.left + box.width / 2), event.clientY - (box.top + box.height / 2))
    if (hour !== clock12) onHour(hour)
  }

  return (
    <svg ref={face} viewBox="-110 -110 220 220" className="w-full max-w-[19rem] mx-auto block select-none" role="group" aria-label="Clock face. Choose an hour">
      <circle r="106" fill={night ? 'var(--ink)' : 'var(--surface)'} stroke="var(--hero)" strokeWidth="5" />
      {HOURS.map((hour) => {
        const outer = spot(hour, 90)
        const inner = spot(hour, 63)
        const chosen = hour === clock12
        return (
          <g key={hour} role="button" tabIndex={0} aria-label={`${hour} o'clock`} aria-pressed={chosen} className="cursor-pointer" style={{ outline: 'none' }}
            onClick={() => onHour(hour)} onFocus={() => setFocused(hour)} onBlur={() => setFocused(null)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onHour(hour) } }}>
            {/* An invisible wedge, so the whole slice of the face answers a finger, not only the digits. */}
            <circle cx={spot(hour, 74).x} cy={spot(hour, 74).y} r="24" fill="transparent" />
            {/* A focus ring drawn inside the drawing. A CSS outline here would be scaled with the clock and look wrong. */}
            {focused === hour && <circle cx={outer.x} cy={outer.y} r="16" fill="none" stroke={ink} strokeWidth="1.5" strokeDasharray="4 3" />}
            {chosen && <circle cx={outer.x} cy={outer.y} r="13" fill="var(--hero)" />}
            <text x={outer.x} y={outer.y + 6} textAnchor="middle" fontSize="17" fontWeight="800" fill={chosen ? 'var(--on-hero)' : ink} className="font-display">{hour}</text>
            {showSwahili && chosen && <circle cx={inner.x} cy={inner.y} r="11" fill="var(--accent)" />}
            {showSwahili && <text x={inner.x} y={inner.y + 4.5} textAnchor="middle" fontSize="12.5" fontWeight="800" fill={chosen ? 'var(--on-accent)' : night ? 'var(--hero)' : 'var(--accent-text)'}>{swahiliHour(hour).hour}</text>}
          </g>
        )
      })}
      <line x1="0" y1="0" x2={knob.x} y2={knob.y} stroke={ink} strokeWidth="6" strokeLinecap="round" style={{ pointerEvents: 'none' }} />
      <circle r="7" fill={ink} style={{ pointerEvents: 'none' }} />
      {/* The knob. touch-action none lets a finger drag it without scrolling the page. The rest of the face still scrolls. */}
      <circle cx={knob.x} cy={knob.y} r="12" fill={ink} stroke="var(--accent)" strokeWidth="4" className="cursor-grab" style={{ touchAction: 'none' }}
        onPointerDown={(e) => e.currentTarget.setPointerCapture(e.pointerId)} onPointerMove={(e) => { if (e.currentTarget.hasPointerCapture(e.pointerId)) drag(e) }} />
    </svg>
  )
}
