// Who is on a trip, which of the user's trips were shared by friends, and the moves: invite a friend, remove them, leave.
// Exists so the members panel and the trip switcher read one list, and the trip screen stays about the map and the stops.
import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Trip } from '../../lib/types'
import { useAuth } from '../auth/useAuth'
import { isDemoMode } from '../demo/demoMode'
import type { Person } from '../friends/useFriends'

export interface SharedTrip extends Trip {
  owner: Person | null
}

export function useTripMembers(tripId: string | null, ownerId: string | null) {
  const { user } = useAuth()
  const [members, setMembers] = useState<Person[]>([])
  const [owner, setOwner] = useState<Person | null>(null)
  const [sharedWithMe, setSharedWithMe] = useState<SharedTrip[]>([])

  const reload = useCallback(async () => {
    if (!user || isDemoMode) return
    const [memberRows, sharedRows, ownerRow] = await Promise.all([
      tripId ? supabase.from('trip_members').select('person:profiles!trip_members_user_profile_fkey(id, username, display_name)').eq('trip_id', tripId) : Promise.resolve({ data: [] }),
      supabase.from('trips').select('id, user_id, title, start_date, end_date, owner:profiles!trips_user_profile_fkey(id, username, display_name)').neq('user_id', user.id),
      ownerId && ownerId !== user.id ? supabase.from('profiles').select('id, username, display_name').eq('id', ownerId).maybeSingle() : Promise.resolve({ data: null }),
    ])
    setMembers(((memberRows.data ?? []) as unknown as { person: Person | null }[]).map((r) => r.person).filter((p): p is Person => !!p))
    setSharedWithMe((sharedRows.data ?? []) as unknown as SharedTrip[])
    setOwner((ownerRow.data as Person | null) ?? null)
  }, [user, tripId, ownerId])

  useEffect(() => {
    reload()
  }, [reload])

  async function invite(personId: string): Promise<string | null> {
    if (!user || !tripId) return 'No trip open.'
    const { error } = await supabase.from('trip_members').insert({ trip_id: tripId, user_id: personId, added_by: user.id })
    if (error) return error.code === '23505' ? 'They are already on this trip.' : error.message
    await reload()
    return null
  }

  async function remove(personId: string) {
    if (!tripId) return
    await supabase.from('trip_members').delete().eq('trip_id', tripId).eq('user_id', personId)
    await reload()
  }

  return { members, owner, sharedWithMe, invite, remove, reload }
}
