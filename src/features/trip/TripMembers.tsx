// The "Travelling with" panel on a trip: who is on it, with a way to leave or, for the owner, to remove someone.
// Exists so a joint trip is visible on the trip itself. Friends join automatically, so there is nothing to invite.
import { Link } from 'react-router'
import { Icon } from '../../components/icons'
import { ConfirmButton } from '../../components/ConfirmButton'
import type { Person } from '../friends/useFriends'
import { useAuth } from '../auth/useAuth'

interface TripMembersProps {
  isOwner: boolean
  owner: Person | null
  members: Person[]
  onRemove: (personId: string) => Promise<void>
}

export function TripMembers({ isOwner, owner, members, onRemove }: TripMembersProps) {
  const { user } = useAuth()
  const name = (p: Person) => p.display_name ?? (p.username ? `@${p.username}` : 'A friend')


  return (
    <div className="px-2 mb-5">
      <p className="text-sm font-bold mb-2">Travelling with</p>
      <ul className="flex flex-wrap gap-2">
        {owner && !isOwner && <li className="inline-flex items-center gap-1.5 min-h-[40px] max-w-full px-3 rounded-pill bg-tint text-sm font-bold"><Icon name="user" size={14} /><span className="max-w-[10rem] truncate">{name(owner)}</span> <span className="text-muted font-normal">owner</span></li>}
        {members.map((m) => (
          <li key={m.id} className="inline-flex items-center gap-1.5 min-h-[40px] max-w-full pl-3 pr-1 rounded-pill bg-tint text-sm font-bold">
            <span className="max-w-[10rem] truncate">{m.id === user?.id ? 'You' : name(m)}</span>
            {(isOwner || m.id === user?.id) && (
              <ConfirmButton icon question={m.id === user?.id ? 'Leave this trip?' : `Remove ${name(m)} from this trip?`} confirmLabel={m.id === user?.id ? 'Leave' : 'Remove'} onConfirm={() => onRemove(m.id)} ariaLabel={m.id === user?.id ? 'Leave this trip' : `Remove ${name(m)} from this trip`} className="w-8 h-8 rounded-pill hover:bg-surface flex items-center justify-center cursor-pointer"><Icon name="close" size={14} /></ConfirmButton>
            )}
          </li>
        ))}
        {isOwner && members.length === 0 && <li className="text-sm text-muted self-center">Just you so far. <Link to="/friends" className="underline font-bold text-text">Add a friend</Link> and they join this trip.</li>}
      </ul>
    </div>
  )
}
