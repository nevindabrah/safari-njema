// The app's own calendar: a rounded button that shows the chosen day, and a month of round day buttons that opens from it.
// Exists because the browser's built-in date field looks different on every device and ignores the app's colours and corners.
import { useState } from 'react'
import { dayLabel } from '../lib/calendar'
import { Icon } from './icons'
import { CalendarSheet } from './CalendarSheet'

interface DatePickerProps {
  value: string | null
  onChange: (value: string | null) => void
  label: string
  placeholder?: string
  tripStart?: string | null
  tripEnd?: string | null
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
        className={`inline-flex items-center gap-2 min-h-[44px] px-4 rounded-pill text-sm font-bold cursor-pointer whitespace-nowrap ${active ? 'bg-primary text-on-primary' : 'bg-soft text-on-soft'}`}>
        <Icon name="calendar" size={16} />
        <span className={value ? '' : 'opacity-70'}>{value ? dayLabel(value) : placeholder}</span>
      </button>
      {open && <CalendarSheet title={label} value={value} tripStart={tripStart} tripEnd={tripEnd} onChoose={choose} onClose={() => setOpen(false)} />}
    </>
  )
}
