// The app's own calendar: a rounded button that shows the chosen day, and a month of round day buttons that opens from it.
// Exists because the browser's built-in date field looks different on every device and ignores the app's colours and corners.
import { useState } from 'react'
import { dayLabel } from '../lib/calendar'
import { Icon } from './icons'
import { CalendarSheet } from './CalendarSheet'

interface DatePickerProps {
  // "2026-10-05", or null for no date.
  value: string | null
  onChange: (value: string | null) => void
  // Said to screen readers, for example "Day for Diani Beach".
  label: string
  placeholder?: string
  // The trip's dates. Days inside them are tinted, and the calendar opens on the trip's month. Neither is a limit.
  tripStart?: string | null
  tripEnd?: string | null
  // Draws the button in the dark "chosen" style, used where the date sits in a row of chips.
  active?: boolean
}

export function DatePicker({ value, onChange, label, placeholder = 'Pick a date', tripStart = null, tripEnd = null, active = false }: DatePickerProps) {
  const [open, setOpen] = useState(false)

  function choose(next: string | null) {
    onChange(next)
    setOpen(false)
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-label={`${label}: ${value ? dayLabel(value) : 'no date yet'}. Change it`}
        className={`inline-flex items-center gap-2 min-h-[44px] px-4 rounded-pill text-sm font-bold cursor-pointer whitespace-nowrap ${active ? 'bg-primary text-on-primary' : 'bg-tint text-text'}`}>
        <Icon name="calendar" size={16} />
        <span className={value ? '' : 'opacity-70'}>{value ? dayLabel(value) : placeholder}</span>
      </button>
      {open && <CalendarSheet title={label} value={value} tripStart={tripStart} tripEnd={tripEnd} onChoose={choose} onClose={() => setOpen(false)} />}
    </>
  )
}
