// Loads the signed in user's friendships and makes the four moves: search, ask, accept, end.
// Exists so FriendsScreen and the trip's member picker read the same list and never write to the table themselves.
import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../auth/useAuth'
import { isDemoMode } from '../demo/demoMode'

export interface Person {
  id: string
  username: string | null
  display_name: string | null
}

export interface Friendship {
  id: string
  status: 'pending' | 'accepted'
  iAsked: boolean
  person: Person
}

interface FriendshipRow {
  id: string
  status: 'pending' | 'accepted'
  requester_id: string
  addressee_id: string
  requester: Person | null
  addressee: Person | null
}

export function useFriends() {
  const { user } = useAuth()
  const [friendships, setFriendships] = useState<Friendship[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    if (!user || isDemoMode) {
      setLoading(false)
      return
    }
    const { data } = await supabase
      .from('friendships')
      .select('id, status, requester_id, addressee_id, requester:profiles!friendships_requester_id_fkey(id, username, display_name), addressee:profiles!friendships_addressee_id_fkey(id, username, display_name)')
      .order('created_at')
    const rows = (data ?? []) as unknown as FriendshipRow[]
    setFriendships(rows.map((row) => {
      const iAsked = row.requester_id === user.id
      const other = iAsked ? row.addressee : row.requester
      return { id: row.id, status: row.status, iAsked, person: other ?? { id: iAsked ? row.addressee_id : row.requester_id, username: null, display_name: null } }
    }))
    setLoading(false)
  }, [user])

  useEffect(() => {
    reload()
  }, [reload])

  const search = useCallback(async (query: string): Promise<Person[]> => {
    if (isDemoMode) return []
    const { data } = await supabase.rpc('search_usernames', { p_query: query })
    return (data ?? []) as Person[]
  }, [])

  async function ask(personId: string): Promise<string | null> {
    if (!user) return 'Not signed in.'
    const { error } = await supabase.from('friendships').insert({ requester_id: user.id, addressee_id: personId })
    if (error) return error.code === '23505' ? 'You already have a request with this person.' : error.message
    await reload()
    return null
  }

  async function accept(friendshipId: string) {
    await supabase.from('friendships').update({ status: 'accepted' }).eq('id', friendshipId)
    await reload()
  }

  async function end(friendshipId: string) {
    await supabase.from('friendships').delete().eq('id', friendshipId)
    await reload()
  }

  const friends = friendships.filter((f) => f.status === 'accepted')
  const incoming = friendships.filter((f) => f.status === 'pending' && !f.iAsked)
  const outgoing = friendships.filter((f) => f.status === 'pending' && f.iAsked)

  return { friends, incoming, outgoing, loading, search, ask, accept, end, reload }
}
