// The sign up screen. Creates a Supabase account with email and password.
// Exists as the front door for new users. A trip is created on first visit to the planner.
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { supabase } from '../../lib/supabase'
import { isExistingAccount, plainAuthMessage } from '../../lib/authMessages'
import { Card } from '../../components/Card'
import { TopBar } from '../../components/TopBar'
import { LeaveButton } from '../../components/LeaveButton'
import { AuthForm } from './AuthForm'
import { SetupNotice } from './SetupNotice'
import { GoogleButton } from './GoogleButton'
import { isDemoMode } from '../demo/demoMode'

export function SignupScreen() {
  const navigate = useNavigate()
  const [needsConfirm, setNeedsConfirm] = useState(false)

  async function signup(email: string, password: string) {
    // The confirmation email, if Supabase sends one, brings the visitor back to this same site and signs them in.
    const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/trip` } })
    if (error) return plainAuthMessage(error.message)
    if (isExistingAccount(data.user)) return plainAuthMessage('User already registered')
    // If email confirmation is on in Supabase, there is no session yet.
    if (!data.session) {
      setNeedsConfirm(true)
      return null
    }
    navigate('/trip', { replace: true })
    return null
  }

  return (
    <div className="min-h-dvh">
      <TopBar />
      <main className="mx-auto max-w-md px-4 pt-4 pb-10">
        <LeaveButton kind="back" label="Back" to="/" showLabel className="mb-3" />
        <Card>
          {needsConfirm ? (
            <>
              <h1 className="text-3xl mb-2">Check your email</h1>
              <p className="text-muted">We sent a confirmation link. Open it on this device and your trip will open.</p>
            </>
          ) : (
            <>
              <h1 className="text-3xl mb-1">Create your account</h1>
              <p className="text-muted mb-6">Your itinerary and lessons will live here.</p>
              <SetupNotice />
              {!isDemoMode && <GoogleButton />}
              {!isDemoMode && <AuthForm submitLabel="Sign up" newPassword onSubmit={signup} />}
              <p className="text-sm text-muted mt-6 text-center">
                Already have one? <Link to="/login" className="font-bold text-text underline">Log in</Link>
              </p>
            </>
          )}
        </Card>
      </main>
    </div>
  )
}
