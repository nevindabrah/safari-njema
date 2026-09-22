// The one step a new account meets first: choose a username, and check the name others will see.
// Exists because Google sign in creates an account without a username, and every account needs one before friends can find it.
import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { TopBar } from '../../components/TopBar'
import { suggestUsername, usernameProblem } from '../../lib/username'
import { useAuth } from './useAuth'
import { useProfile } from './useProfile'
import { UsernameField } from './UsernameField'

export function WelcomeScreen() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { profile, loading, save } = useProfile()
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!profile) return
    if (profile.username) navigate('/trip', { replace: true })
    setUsername((current) => current || suggestUsername(user?.email, profile.display_name))
    setDisplayName((current) => current || profile.display_name || '')
  }, [profile, user, navigate])

  async function finish(event: FormEvent) {
    event.preventDefault()
    const problem = usernameProblem(username)
    if (problem) return setError(problem)
    setBusy(true)
    const message = await save({ username, display_name: displayName.trim() || null })
    setBusy(false)
    if (message) return setError(message)
    navigate('/trip', { replace: true })
  }

  return (
    <div className="min-h-dvh">
      <TopBar />
      <main className="mx-auto max-w-md px-4 pt-6 pb-10">
        <Card>
          <p className="text-xs uppercase tracking-wide font-bold text-muted">Karibu</p>
          <h1 className="text-3xl mb-1">Choose your username</h1>
          <p className="text-muted mb-6">Friends will find you by it. You can change it later on your account page.</p>
          {loading ? <p className="text-muted">One moment.</p> : (
            <form onSubmit={finish} className="flex flex-col gap-3">
              <UsernameField value={username} onChange={setUsername} />
              <label className="flex flex-col gap-1 text-sm font-bold">
                Name shown to friends
                <input className="w-full min-h-[48px] px-4 rounded-input field text-text" type="text" autoComplete="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={60} />
              </label>
              {error && <p role="alert" className="text-sm text-accent-text font-bold">{error}</p>}
              <Button type="submit" full disabled={busy} className="mt-2">{busy ? 'Saving' : 'Continue to my trip'}</Button>
            </form>
          )}
        </Card>
      </main>
    </div>
  )
}
