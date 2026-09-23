// The floating pill of tabs at the bottom of a phone screen. Signed in it leads to the trip, friends and phrases; signed out to the public pages.
// Exists because the PRD asks for phone navigation within thumb reach. Wide screens use the links in the top bar instead. Each tab is an icon over a word, so five fit the narrowest phone.
import { NavLink, useLocation } from 'react-router'
import { useAuth } from '../features/auth/useAuth'
import { Icon, type IconName } from './icons'

const SIGNED_IN: Array<{ to: string; label: string; icon: IconName }> = [
  { to: '/trip', label: 'My trip', icon: 'map' },
  { to: '/friends', label: 'Friends', icon: 'user' },
  { to: '/kangas', label: 'Kangas', icon: 'cloth' },
  { to: '/phrasebook', label: 'Phrases', icon: 'card' },
  { to: '/time', label: 'Time', icon: 'clock' },
]

const SIGNED_OUT: Array<{ to: string; label: string; icon: IconName }> = [
  { to: '/', label: 'Home', icon: 'other' },
  { to: '/phrasebook', label: 'Phrases', icon: 'card' },
  { to: '/time', label: 'Time', icon: 'clock' },
  { to: '/food', label: 'Food', icon: 'restaurant' },
]

export function BottomTabs({ badges = {} }: { badges?: Partial<Record<string, number>> }) {
  const { user } = useAuth()
  const { pathname } = useLocation()
  if (pathname.startsWith('/lesson') || pathname.startsWith('/preview') || pathname.startsWith('/review')) return null
  const tabs = user ? SIGNED_IN : SIGNED_OUT
  return (
    <nav aria-label="Main" className="no-print min-[700px]:hidden fixed z-30 left-1/2 -translate-x-1/2 flex gap-1 p-1.5 rounded-pill bg-surface shadow-lift" style={{ bottom: 'calc(0.9rem + env(safe-area-inset-bottom, 0px))' }}>
      {tabs.map((tab) => (
        <NavLink key={tab.to} to={tab.to} end={tab.to === '/'} className={({ isActive }) => `flex flex-col items-center justify-center gap-0.5 w-[3.6rem] min-[360px]:w-16 min-[400px]:w-[4.4rem] min-h-[52px] rounded-pill text-xs font-bold whitespace-nowrap ${isActive ? 'bg-primary text-on-primary' : 'text-muted'}`}>
          <span className="relative"><Icon name={tab.icon} size={18} />{(badges[tab.to] ?? 0) > 0 && <span aria-label={`${badges[tab.to]} new`} className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 rounded-pill text-[10px] leading-4 text-center" style={{ background: 'var(--accent)', color: 'var(--on-accent)' }}>{badges[tab.to]}</span>}</span>{tab.label}
        </NavLink>
      ))}
    </nav>
  )
}
