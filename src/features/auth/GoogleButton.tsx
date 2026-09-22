// The "Continue with Google" button. Supabase sends the visitor to Google and brings them back signed in.
// Exists because the PRD asks for Google sign in beside email and password. It is hidden in the demo, which has no accounts.
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { plainAuthMessage } from '../../lib/authMessages'
import { isDemoMode } from '../demo/demoMode'

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.1 5.3-4.6 7l7.2 5.6c4.2-3.9 7.1-9.6 7.1-17.1z" />
      <path fill="#FBBC05" d="M10.5 28.7A14.5 14.5 0 0 1 9.7 24c0-1.6.3-3.2.8-4.7l-7.9-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.9-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.2-5.6c-2.1 1.4-4.9 2.3-8.7 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  )
}

export function GoogleButton() {
  const [error, setError] = useState<string | null>(null)
  const [leaving, setLeaving] = useState(false)
  if (isDemoMode) return null

  async function signIn() {
    setError(null)
    setLeaving(true)
    const { error: problem } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/trip` } })
    if (problem) {
      setError(plainAuthMessage(problem.message))
      setLeaving(false)
    }
  }

  return (
    <div className="mb-5">
      <button type="button" onClick={signIn} disabled={leaving} className="w-full min-h-[48px] rounded-pill bg-surface-2 font-bold flex items-center justify-center gap-3 cursor-pointer" style={{ boxShadow: '0 4px 0 var(--line)' }}>
        <GoogleMark />{leaving ? 'Taking you to Google' : 'Continue with Google'}
      </button>
      {error && <p role="alert" className="text-sm text-accent-text font-bold mt-2">{error}</p>}
      <p className="text-center text-xs text-muted mt-4">or use your email</p>
    </div>
  )
}
