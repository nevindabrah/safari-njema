// The account screen: who is signed in, sign out, and delete the account with everything in it.
// Exists because the privacy page promises deletion, and a real student must be able to do it themselves without emailing anyone.
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { supabase } from '../../lib/supabase'
import { plainAuthMessage } from '../../lib/authMessages'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { TopBar } from '../../components/TopBar'
import { LeaveButton } from '../../components/LeaveButton'
import { useAuth } from '../auth/useAuth'
import { isDemoMode, leaveDemo } from '../demo/demoMode'
import { startEmptyTrip } from '../demo/localStore'

export function AccountScreen() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function deleteAccount() {
    setBusy(true)
    setError(null)
    if (isDemoMode) {
      startEmptyTrip()
      leaveDemo('/')
      return
    }
    const { error: problem } = await supabase.rpc('delete_my_account')
    if (problem) {
      setError(plainAuthMessage(problem.message))
      setBusy(false)
      return
    }
    navigate('/', { replace: true })
    await supabase.auth.signOut()
  }

  return (
    <div className="min-h-dvh">
      <TopBar />
      <main className="mx-auto max-w-md px-4 pt-4 pb-28 sm:pb-10">
        <LeaveButton kind="back" label="Back to my trip" to="/trip" showLabel className="mb-3" />
        <h1 className="text-4xl sm:text-5xl mb-5">Your account</h1>
        <Card>
          <p className="text-xs uppercase tracking-wide font-bold text-muted">Signed in as</p>
          <p className="font-bold text-lg break-all">{isDemoMode ? 'The demo account, saved in this browser' : user?.email}</p>
          <Button variant="soft" full className="mt-5" onClick={signOut}>Sign out</Button>
        </Card>

        <Card className="mt-5">
          <h2 className="text-xl mb-2">Delete your account</h2>
          <p className="text-sm text-muted">
            {isDemoMode
              ? 'This clears the demo trip and its lessons from this browser.'
              : 'This removes your account, your trip, your stops, your lessons and your kangas. Nothing is kept. It cannot be undone.'}
          </p>
          {!confirming && <Button variant="soft" full className="mt-4" onClick={() => setConfirming(true)}>Delete my account</Button>}
          {confirming && (
            <div className="mt-4 rounded-input p-4" style={{ background: 'var(--wrong-soft)' }}>
              <p className="font-bold mb-3">Are you sure? This cannot be undone.</p>
              <div className="flex gap-2 flex-wrap">
                <Button variant="accent" className="flex-1" onClick={deleteAccount} disabled={busy}>{busy ? 'Deleting' : 'Yes, delete everything'}</Button>
                <Button variant="soft" className="flex-1" onClick={() => setConfirming(false)} disabled={busy}>Keep my account</Button>
              </div>
              {error && <p role="alert" className="text-sm text-accent-text font-bold mt-3">{error}</p>}
            </div>
          )}
        </Card>
      </main>
    </div>
  )
}
