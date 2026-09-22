// One person in a friends list: their name, their username, and whatever buttons fit their state.
// Exists so the four lists on the friends screen draw a person the same way.
import type { ReactNode } from 'react'
import type { Person } from './useFriends'

export function PersonRow({ person, children }: { person: Person; children?: ReactNode }) {
  const initial = (person.display_name ?? person.username ?? '?').slice(0, 1).toUpperCase()
  return (
    <li className="flex items-center gap-3 py-3 border-t" style={{ borderColor: 'var(--line)' }}>
      <span aria-hidden="true" className="w-11 h-11 rounded-pill bg-hero text-on-hero font-display font-extrabold text-lg flex items-center justify-center shrink-0">{initial}</span>
      <span className="flex-1 min-w-0">
        <span className="block font-bold truncate">{person.display_name ?? person.username}</span>
        {person.username && <span className="block text-sm text-muted truncate">@{person.username}</span>}
      </span>
      <span className="flex gap-2 shrink-0">{children}</span>
    </li>
  )
}
