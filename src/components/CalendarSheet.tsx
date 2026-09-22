// The open calendar: one month at a time, arrows to change month, and a way to clear the date or close without choosing.
// Exists apart from DatePicker so the button stays tiny. It is drawn at the end of the page so no card or map can clip it.
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { addMonths, isInRange, monthGrid, monthOf, monthTitle, todayIso } from '../lib/calendar'
import { Icon } from './icons'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

interface CalendarSheetProps {
  title: string
  value: string | null
  tripStart: string | null
  tripEnd: string | null
  onChoose: (value: string | null) => void
  onClose: () => void
}

export function CalendarSheet({ title, value, tripStart, tripEnd, onChoose, onClose }: CalendarSheetProps) {
  const today = todayIso()
  const [month, setMonth] = useState(() => monthOf(value ?? tripStart ?? today))
  const panel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.stopPropagation()
      onClose()
    }
    window.addEventListener('keydown', onKey, true)
    const before = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panel.current?.querySelector<HTMLButtonElement>('[aria-pressed="true"], [data-today]')?.focus()
    return () => {
      window.removeEventListener('keydown', onKey, true)
      document.body.style.overflow = before
    }
  }, [onClose])

  const round = 'w-11 h-11 rounded-pill flex items-center justify-center cursor-pointer'

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: 'color-mix(in srgb, var(--ink) 55%, transparent)' }} onClick={onClose}>
      <div ref={panel} role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}
        className="w-full sm:w-[22rem] bg-surface text-text shadow-lift rounded-t-card sm:rounded-card p-4" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}>
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="text-sm font-bold text-muted px-1 truncate">{title}</p>
          <button type="button" onClick={onClose} aria-label="Close the calendar" className={`${round} bg-tint shrink-0`}><Icon name="close" size={16} /></button>
        </div>
        <div className="flex items-center justify-between mb-2">
          <button type="button" onClick={() => setMonth(addMonths(month, -1))} aria-label="Previous month" className={`${round} hover:bg-tint`}><Icon name="back" size={18} /></button>
          <h2 className="text-xl" aria-live="polite">{monthTitle(month)}</h2>
          <button type="button" onClick={() => setMonth(addMonths(month, 1))} aria-label="Next month" className={`${round} hover:bg-tint`}><Icon name="arrow" size={18} /></button>
        </div>

        <div className="grid grid-cols-7 text-center text-xs font-bold text-muted mb-1" aria-hidden="true">
          {WEEKDAYS.map((day) => <span key={day}>{day}</span>)}
        </div>
        <div className="grid grid-cols-7 gap-y-1 justify-items-center">
          {monthGrid(month).flat().map((day, i) => {
            if (!day) return <span key={`blank-${i}`} />
            const chosen = day === value
            const inTrip = isInRange(day, tripStart, tripEnd)
            return (
              <button key={day} type="button" onClick={() => onChoose(day)} aria-pressed={chosen} data-today={day === today ? '' : undefined}
                aria-label={new Date(`${day}T00:00:00Z`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })}
                className={`${round} text-sm font-bold ${chosen ? 'bg-primary text-on-primary' : inTrip ? 'bg-tint' : 'hover:bg-tint'}`}
                style={day === today && !chosen ? { boxShadow: 'inset 0 0 0 2px var(--accent)' } : undefined}>
                {Number(day.slice(8, 10))}
              </button>
            )
          })}
        </div>

        <div className="flex items-center justify-between gap-2 mt-3 text-sm">
          <p className="text-muted px-1">{tripStart && tripEnd ? 'Tinted days are inside your trip.' : ''}</p>
          {value && <button type="button" onClick={() => onChoose(null)} className="underline font-bold min-h-[44px] px-2 cursor-pointer">No date</button>}
        </div>
      </div>
    </div>,
    document.body,
  )
}
