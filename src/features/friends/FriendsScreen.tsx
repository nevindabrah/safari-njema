// The friends screen: find people by username, answer requests, and see who you can plan trips with.
// Exists because a trip is better shared. Accepting a request here joins each friend to the other's trips at once.
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { ConfirmButton } from '../../components/ConfirmButton'
import { TopBar } from '../../components/TopBar'
import { LeaveButton } from '../../components/LeaveButton'
import { SearchBox } from '../../components/SearchBox'
import { isDemoMode } from '../demo/demoMode'
import { PersonRow } from './PersonRow'
import { useFriends, type Person } from './useFriends'

export function FriendsScreen() {
  const { friends, incoming, outgoing, loading, error, search, ask, accept, end } = useFriends()
  const [busyId, setBusyId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [found, setFound] = useState<Person[]>([])
  const [note, setNote] = useState<string | null>(null)
  const known = new Set([...friends, ...incoming, ...outgoing].map((f) => f.person.id))

  useEffect(() => {
    if (query.trim().length < 2) return setFound((current) => (current.length ? [] : current))
    const handle = setTimeout(() => search(query).then(setFound), 300)
    return () => clearTimeout(handle)
  }, [query, search])

  async function sendRequest(person: Person) {
    if (busyId) return
    setBusyId(person.id)
    setNote(await ask(person.id))
    setBusyId(null)
    setQuery('')
  }

  async function act(id: string, move: (id: string) => Promise<void>) {
    if (busyId) return
    setBusyId(id)
    await move(id)
    setBusyId(null)
  }

  return (
    <div className="min-h-dvh">
      <TopBar />
      <main className="mx-auto max-w-2xl px-4 pt-4 pb-28 sm:pb-10">
        <LeaveButton kind="back" label="Back to my trip" to="/trip" showLabel className="mb-3" />
        <h1 className="text-4xl sm:text-5xl mb-2">Friends</h1>
        <p className="text-muted mb-5">Find a friend by their username. Once you are friends you plan together: each of you sees the other's trip, can add stops to it, and gets the same lessons.</p>

        {isDemoMode ? (
          <Card><p className="mb-4">Friends need an account, so the demo cannot show them. Create one to find your friends and plan a trip together.</p><Link to="/signup"><Button tabIndex={-1}>Create your account</Button></Link></Card>
        ) : (
          <>
            <SearchBox id="friend-search" label="Search by username" placeholder="Search by username" value={query} onChange={setQuery} />
            {found.length > 0 && (
              <ul className="mt-2 bg-surface rounded-card shadow-lift px-4 overflow-hidden">
                {found.map((person) => (
                  <PersonRow key={person.id} person={person}>
                    {known.has(person.id) ? <span className="text-sm text-muted self-center">Already listed</span> : <Button variant="accent" disabled={busyId === person.id} onClick={() => sendRequest(person)}>Add friend</Button>}
                  </PersonRow>
                ))}
              </ul>
            )}
            {query.trim().length >= 2 && found.length === 0 && <p className="text-sm text-muted mt-2 px-1">Nobody with a username starting like that.</p>}
            {(note || error) && <p role="alert" className="text-sm text-accent-text font-bold mt-2 px-1">{note ?? error}</p>}

            {incoming.length > 0 && (
              <Card className="mt-5">
                <h2 className="text-xl">Requests for you</h2>
                <ul>{incoming.map((f) => <PersonRow key={f.id} person={f.person}><Button disabled={busyId === f.id} onClick={() => act(f.id, accept)}>Accept</Button><Button variant="soft" disabled={busyId === f.id} onClick={() => act(f.id, end)}>Decline</Button></PersonRow>)}</ul>
              </Card>
            )}

            <Card className="mt-5">
              <h2 className="text-xl">Your friends</h2>
              {loading ? <p className="text-muted mt-2">Loading.</p> : friends.length === 0 ? <p className="text-muted mt-2">No friends yet. Search for a username above.</p> : (
                <ul>{friends.map((f) => <PersonRow key={f.id} person={f.person}><ConfirmButton question="Remove this friend?" confirmLabel="Remove" onConfirm={() => act(f.id, end)}>Remove</ConfirmButton></PersonRow>)}</ul>
              )}
            </Card>

            {outgoing.length > 0 && (
              <Card className="mt-5">
                <h2 className="text-xl">Waiting for an answer</h2>
                <ul>{outgoing.map((f) => <PersonRow key={f.id} person={f.person}><Button variant="soft" disabled={busyId === f.id} onClick={() => act(f.id, end)}>Cancel</Button></PersonRow>)}</ul>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  )
}
