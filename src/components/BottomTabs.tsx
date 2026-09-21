// The floating pill of tabs at the bottom of a phone screen, for signed in users.
// Exists because the PRD asks for phone navigation within thumb reach. Wide screens use the links in the top bar instead.
import { NavLink } from 'react-router'
import { Icon, type IconName } from './icons'

const TABS: Array<{ to: string; label: string; icon: IconName }> = [
  { to: '/trip', label: 'My trip', icon: 'map' },
  { to: '/kangas', label: 'Kangas', icon: 'cloth' },
  { to: '/about', label: 'About', icon: 'other' },
]

export function BottomTabs() {
  return (
    <nav aria-label="Main" className="no-print sm:hidden fixed z-30 left-1/2 -translate-x-1/2 flex gap-1 p-1.5 rounded-pill bg-surface shadow-lift" style={{ bottom: 'calc(0.9rem + env(safe-area-inset-bottom, 0px))' }}>
      {TABS.map((tab) => (
        <NavLink key={tab.to} to={tab.to} className={({ isActive }) => `flex items-center gap-1.5 px-4 min-h-[44px] rounded-pill text-sm font-bold whitespace-nowrap ${isActive ? 'bg-primary text-on-primary' : 'text-muted'}`}>
          <Icon name={tab.icon} size={18} />{tab.label}
        </NavLink>
      ))}
    </nav>
  )
}
