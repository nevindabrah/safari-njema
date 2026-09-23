// The blurred sticky top bar: the logo that leads home, the main links on wide screens, and the sound, theme and sign in controls.
// Exists so every screen has the same way to get around. On a phone the links move to a menu button and to BottomTabs, and on a tablet a signed in person keeps their own links while the public ones move into the menu, so nothing is squeezed.
import { Link, NavLink } from 'react-router'
import { Icon } from './icons'
import { useAuth } from '../features/auth/useAuth'
import { DemoBanner } from '../features/demo/DemoBanner'
import { SoundToggle } from './SoundToggle'
import { ThemeToggle } from './ThemeToggle'
import { BottomTabs } from './BottomTabs'
import { Logo } from './Logo'
import { MenuSheet } from './MenuSheet'
import { useBadges } from '../features/friends/useBadges'
import { useProfile } from '../features/auth/useProfile'

const link = ({ isActive }: { isActive: boolean }) => `px-3 py-3 rounded-pill ${isActive ? 'bg-tint' : 'hover:bg-tint'}`

export function TopBar() {
  const { user } = useAuth()
  const badges = useBadges()
  const { profile } = useProfile()
  const wide = user ? 'hidden lg:inline-block' : 'hidden sm:inline-block'
  const dot = (n: number) => (n > 0 ? <span aria-label={`${n} new`} className="ml-1 inline-block min-w-[18px] h-[18px] px-1 rounded-pill text-[11px] leading-[18px] text-center align-middle" style={{ background: 'var(--accent)', color: 'var(--on-accent)' }}>{n}</span> : null)
  return (
    <>
      <header className="sticky top-0 z-20 backdrop-blur-md" style={{ background: 'color-mix(in srgb, var(--bg) 80%, transparent)' }}>
        <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between gap-2">
          <Logo />
          <nav className="flex items-center gap-1 text-sm font-bold whitespace-nowrap" aria-label="Main">
            {user && <span className="hidden sm:flex items-center gap-1"><NavLink to="/trip" className={link}>My trip{dot(badges.trips)}</NavLink><NavLink to="/friends" className={link}>Friends{dot(badges.friends)}</NavLink>{profile?.is_teacher && <NavLink to="/teacher" className={link}>Notes</NavLink>}<NavLink to="/kangas" className={link}>Kangas</NavLink></span>}
            <NavLink to="/phrasebook" className={(state) => `${link(state)} ${wide}`}>Phrasebook</NavLink>
            <NavLink to="/time" className={(state) => `${link(state)} ${wide}`}>Time</NavLink>
            <NavLink to="/food" className={(state) => `${link(state)} ${wide}`}>Food</NavLink>
            <NavLink to="/about" className={(state) => `${link(state)} ${wide}`}>About</NavLink>
            <SoundToggle />
            <ThemeToggle />
            <MenuSheet until={user ? 'lg' : 'sm'} />
            {user ? (
              <Link to="/account" aria-label="Your account" className="px-2 sm:px-3 min-h-[44px] inline-flex items-center rounded-pill hover:bg-tint"><Icon name="user" size={20} /></Link>
            ) : (
              <Link to="/login" className="hidden sm:inline-flex px-4 min-h-[44px] items-center rounded-pill bg-primary text-on-primary">Log in</Link>
            )}
          </nav>
        </div>
        <DemoBanner />
      </header>
      <BottomTabs badges={{ '/trip': badges.trips, '/friends': badges.friends }} />
    </>
  )
}
