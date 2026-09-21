// The sign up screen. Creates a Supabase account with email and password.
// Exists as the front door for new users. A trip is created on first visit to the planner.
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { supabase } from '../../lib/supabase'
import { Card } from '../../components/Card'
import { TopBar } from '../../components/TopBar'
import { AuthForm } from './AuthForm'
import { SetupNotice } from './SetupNotice'

export function SignupScreen() {
  const navigate = useNavigate()
  const [needsConfirm, setNeedsConfirm] = useState(false)

  async function signup(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return error.message
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
      <main className="mx-auto max-w-md px-4 py-10">
        <Card>
          {needsConfirm ? (
            <>
              <h1 className="text-3xl mb-2">Check your email</h1>
              <p className="text-muted">We sent a confirmation link. Open it, then log in.</p>
            </>
          ) : (
            <>
              <h1 className="text-3xl mb-1">Create your account</h1>
              <p className="text-muted mb-6">Your itinerary and lessons will live here.</p>
              <SetupNotice />
              <AuthForm submitLabel="Sign up" onSubmit={signup} />
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
