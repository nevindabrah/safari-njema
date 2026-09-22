// The "Travelling with" panel on a trip: who is on it, and for the owner a way to add a friend who is not on it yet.
// Exists so a joint trip is visible on the trip itself. Friends join automatically; the button covers anyone who was removed or joined later.
import { useState } from 'react'
import { Link } from 'react-router'
import { Button } from '../../components/Button'
import { Icon } from '../../components/icons'
import { ConfirmButton } from '../../components/ConfirmButton'
import { useFriends, type Person } from '../friends/useFriends'
import { useAuth } from '../auth/useAuth'

interface TripMembersProps {
  isOwner: boolean
  owner: Person | null
  members: Person[]
  onInvite: (personId: string) => Promise<string | null>
  onRemove: (personId: string) => Promise<void>
}

export function TripMembers({ isOwner, owner, members, onInvite, onRemove }: TripMembersProps) {
  const { user } = useAuth()
  const { friends } = useFriends()
  const [picking, setPicking] = useState(false)
  const [note, setNote] = useState<string | null>(null)
  const onTrip = new Set(members.map((m) => m.id))
  const canInvite = friends.filter((f) => !onTrip.has(f.person.id))
  const name = (p: Person) => p.display_name ?? (p.username ? `@${p.username}` : 'A friend')

  async function invite(personId: string) {
    setNote(await onInvite(personId))
    setPicking(false)
  }

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
        {isOwner && members.length === 0 && <li className="text-sm text-muted self-center">Just you so far. Friends join when they accept your request.</li>}
        {isOwner && (
          <li>
            <Button variant="soft" onClick={() => setPicking(!picking)} className="!min-h-[40px] !px-3 text-sm" aria-expanded={picking}><Icon name="user" size={16} />Invite a friend</Button>
          </li>
        )}
      </ul>
      {picking && (
        <div className="mt-2 rounded-card bg-surface shadow-lift p-3">
          {canInvite.length === 0 ? (
            <p className="text-sm text-muted">{friends.length === 0 ? <>No friends yet. <Link to="/friends" className="underline font-bold text-text">Find friends by username</Link> and they join your trip as soon as they accept.</> : 'All your friends are already on this trip.'}</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {canInvite.map((f) => <li key={f.id}><Button variant="accent" className="!min-h-[40px] !px-3 text-sm max-w-full" onClick={() => invite(f.person.id)}><span className="max-w-[12rem] truncate">{name(f.person)}</span></Button></li>)}
            </ul>
          )}
        </div>
      )}
      {note && <p role="alert" className="text-sm text-accent-text font-bold mt-2">{note}</p>}
    </div>
  )
}
