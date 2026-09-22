// Counts what is new for the signed in user: friend requests waiting for an answer, and trips friends shared since the last look.
// Exists so the Friends and My trip tabs can show a dot, without every screen asking the database itself.
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../auth/useAuth'
import { isDemoMode } from '../demo/demoMode'

const SEEN_KEY = 'safari-njema-seen-shared-trips'

function seenTrips(): string[] {
  try { return JSON.parse(localStorage.getItem(SEEN_KEY) ?? '[]') as string[] } catch { return [] }
}

export function markSharedTripsSeen(ids: string[]) {
  try { localStorage.setItem(SEEN_KEY, JSON.stringify([...new Set([...seenTrips(), ...ids])])) } catch { /* the dot then shows once more */ }
}

export function useBadges() {
  const { user } = useAuth()
  const [badges, setBadges] = useState({ friends: 0, trips: 0 })

  useEffect(() => {
    if (!user || isDemoMode) return
    let cancelled = false
    Promise.all([
      supabase.from('friendships').select('id', { count: 'exact', head: true }).eq('status', 'pending').eq('addressee_id', user.id),
      supabase.from('trips').select('id').neq('user_id', user.id),
    ]).then(([requests, shared]) => {
      if (cancelled) return
      const seen = new Set(seenTrips())
      setBadges({ friends: requests.count ?? 0, trips: ((shared.data ?? []) as { id: string }[]).filter((t) => !seen.has(t.id)).length })
    })
    return () => { cancelled = true }
  }, [user])

  return badges
}
