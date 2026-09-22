// Pills to move between your own trip and the trips friends have shared with you. Hidden when there is only one.
// Exists so a shared trip is one tap away from the planner, without a separate list screen.
import { NavLink } from 'react-router'
import type { SharedTrip } from './useTripMembers'

export function TripSwitcher({ shared }: { shared: SharedTrip[] }) {
  if (shared.length === 0) return null
  const pill = ({ isActive }: { isActive: boolean }) => `inline-flex items-center min-h-[40px] px-4 rounded-pill text-sm font-bold whitespace-nowrap ${isActive ? 'bg-primary text-on-primary' : 'bg-tint text-text'}`
  return (
    <nav aria-label="Your trips" className="px-2 mb-4 flex gap-2 overflow-x-auto pb-1">
      <NavLink to="/trip" end className={pill}>My trip</NavLink>
      {shared.map((t) => <NavLink key={t.id} to={`/trip/${t.id}`} className={pill}>{t.owner?.display_name ?? (t.owner?.username ? `@${t.owner.username}` : 'A friend')}: {t.title}</NavLink>)}
    </nav>
  )
}
