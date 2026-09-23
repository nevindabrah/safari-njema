// The phone menu: one button in the top bar that opens a sheet listing every screen, for people signed in or not.
// Exists because on a phone the top bar has no room for links, and a visitor who is not signed in had no way to reach the phrasebook, the clock or the food page. The sheet is drawn at the document root, because the blurred top bar would otherwise pin it in place.
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { NavLink, useLocation } from 'react-router'
import { useAuth } from '../features/auth/useAuth'
import { useProfile } from '../features/auth/useProfile'
import { Icon, type IconName } from './icons'
import { trapTab } from './trapTab'

interface Entry { to: string; label: string; icon: IconName }

const PUBLIC: Entry[] = [
  { to: '/', label: 'Home', icon: 'other' },
  { to: '/phrasebook', label: 'Phrasebook', icon: 'card' },
  { to: '/time', label: 'Telling time', icon: 'clock' },
  { to: '/food', label: 'Food', icon: 'restaurant' },
  { to: '/about', label: 'About', icon: 'user' },
]

export function MenuSheet() {
  const { user } = useAuth()
  const { profile } = useProfile()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const panel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
      trapTab(event, panel.current)
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    panel.current?.querySelector<HTMLElement>('a, button')?.focus()
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  const mine: Entry[] = user
    ? [{ to: '/trip', label: 'My trip', icon: 'map' }, { to: '/friends', label: 'Friends', icon: 'user' }, { to: '/kangas', label: 'Kangas', icon: 'cloth' }, { to: '/review', label: 'Review', icon: 'bolt' }, { to: '/account', label: 'Your account', icon: 'user' }, ...(profile?.is_teacher ? [{ to: '/teacher', label: 'Notes from readers', icon: 'card' } as Entry] : [])]
    : [{ to: '/login', label: 'Log in', icon: 'user' }, { to: '/signup', label: 'Create your account', icon: 'bolt' }]
  const row = ({ isActive }: { isActive: boolean }) => `flex items-center gap-3 min-h-[48px] px-4 rounded-pill text-base font-bold ${isActive ? 'bg-primary text-on-primary' : 'hover:bg-tint'}`

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label="Open the menu" aria-expanded={open} className="min-[700px]:hidden w-11 h-11 rounded-pill hover:bg-tint cursor-pointer flex items-center justify-center">
        <Icon name="menu" size={22} />
      </button>
      {open && createPortal(
        <div className="fixed inset-0 z-50 flex items-end min-[700px]:hidden" style={{ background: 'color-mix(in srgb, var(--ink) 55%, transparent)' }} onClick={() => setOpen(false)}>
          <div ref={panel} role="dialog" aria-modal="true" aria-label="Menu" onClick={(e) => e.stopPropagation()} className="w-full max-h-[85dvh] overflow-y-auto rounded-t-card bg-surface p-4" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}>
            <div className="flex items-center justify-between mb-2">
              <p className="font-display font-extrabold text-xl px-2">Where to?</p>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close the menu" className="w-11 h-11 rounded-pill bg-tint flex items-center justify-center cursor-pointer"><Icon name="close" size={18} /></button>
            </div>
            <nav aria-label="All screens" className="flex flex-col gap-1">
              {mine.map((e) => <NavLink key={e.to} to={e.to} end={e.to === '/'} className={row}><Icon name={e.icon} size={20} />{e.label}</NavLink>)}
              <hr className="my-2 border-0 border-t" style={{ borderColor: 'var(--line)' }} />
              {PUBLIC.map((e) => <NavLink key={e.to} to={e.to} end={e.to === '/'} className={row}><Icon name={e.icon} size={20} />{e.label}</NavLink>)}
            </nav>
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}
