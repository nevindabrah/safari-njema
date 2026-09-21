// The blurred sticky top bar: the logo that leads home, the main links on wide screens, and the sound, theme and sign in controls.
// Exists so every screen has the same way to get around. On a phone the main links move to BottomTabs, within thumb reach.
import { Link, NavLink } from 'react-router'
import { useAuth } from '../features/auth/useAuth'
import { DemoBanner } from '../features/demo/DemoBanner'
import { SoundToggle } from './SoundToggle'
import { ThemeToggle } from './ThemeToggle'
import { BottomTabs } from './BottomTabs'
import { Logo } from './Logo'

// py-3 around a 20px line makes each link 44px tall, a comfortable size for a thumb.
const link = ({ isActive }: { isActive: boolean }) => `px-3 py-3 rounded-pill ${isActive ? 'bg-tint' : 'hover:bg-tint'}`

export function TopBar() {
  const { user, signOut } = useAuth()
  return (
    <>
      <header className="sticky top-0 z-20 backdrop-blur-md" style={{ background: 'color-mix(in srgb, var(--bg) 80%, transparent)' }}>
        <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between gap-2">
          <Logo />
          <nav className="flex items-center gap-1 text-sm font-bold whitespace-nowrap" aria-label="Main">
            {user && <span className="hidden sm:flex items-center gap-1"><NavLink to="/trip" className={link}>My trip</NavLink><NavLink to="/kangas" className={link}>Kangas</NavLink></span>}
            <NavLink to="/phrasebook" className={(state) => `${link(state)} hidden sm:inline-block`}>Phrasebook</NavLink>
            {/* On a phone the bar holds the logo and the controls. About is in the footer of every public page. */}
            <NavLink to="/about" className={(state) => `${link(state)} hidden sm:inline-block`}>About</NavLink>
            <SoundToggle />
            <ThemeToggle />
            {user ? (
              <button onClick={signOut} className="px-2 sm:px-3 min-h-[44px] rounded-pill hover:bg-tint cursor-pointer">Sign out</button>
            ) : (
              <Link to="/login" className="px-4 min-h-[44px] inline-flex items-center rounded-pill bg-primary text-on-primary">Log in</Link>
            )}
          </nav>
        </div>
        <DemoBanner />
      </header>
      {user && <BottomTabs />}
    </>
  )
}
