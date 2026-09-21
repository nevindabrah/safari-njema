// A rounded search box with a magnifier on the left and, once something is typed, an X on the far right that clears it.
// Exists so every search in the app looks the same and can be emptied with one tap, which matters most on a phone.
import type { Ref } from 'react'
import { Icon } from './icons'

interface SearchBoxProps {
  id: string
  // Read out by screen readers. The placeholder is only a hint and disappears on typing.
  label: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  inputRef?: Ref<HTMLInputElement>
  // 'lift' floats over the map. 'soft' sits on a page.
  shadow?: 'lift' | 'soft'
  className?: string
}

export function SearchBox({ id, label, placeholder, value, onChange, inputRef, shadow = 'soft', className = '' }: SearchBoxProps) {
  return (
    <div className={`relative ${className}`}>
      <label className="sr-only" htmlFor={id}>{label}</label>
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none"><Icon name="search" size={18} /></span>
      <input ref={inputRef} id={id} type="search" enterKeyHint="search" autoComplete="off" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)}
        className={`w-full min-h-[52px] pl-11 ${value === '' ? 'pr-5' : 'pr-14'} rounded-pill bg-surface text-text placeholder:text-muted ${shadow === 'lift' ? 'shadow-lift' : 'shadow-soft'}`} />
      {value !== '' && (
        <button type="button" onClick={() => onChange('')} aria-label="Clear the search" className="absolute right-1.5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-pill flex items-center justify-center text-muted hover:bg-tint cursor-pointer">
          <Icon name="close" size={16} />
        </button>
      )}
    </div>
  )
}
