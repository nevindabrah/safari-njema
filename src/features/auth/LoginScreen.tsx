// The log in screen. Email and password only for now.
// Exists as the front door for returning users.
import { Link, useLocation, useNavigate } from 'react-router'
import { supabase } from '../../lib/supabase'
import { Card } from '../../components/Card'
import { TopBar } from '../../components/TopBar'
import { AuthForm } from './AuthForm'
import { SetupNotice } from './SetupNotice'
import { GoogleButton } from './GoogleButton'
import { isDemoMode } from '../demo/demoMode'

export function LoginScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/trip'

  async function login(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return error.message
    navigate(from, { replace: true })
    return null
  }

  return (
    <div className="min-h-dvh">
      <TopBar />
      <main className="mx-auto max-w-md px-4 py-10">
        <Card>
          <h1 className="text-3xl mb-1">Welcome back</h1>
          <p className="text-muted mb-6">Log in to open your trip.</p>
          <SetupNotice />
          {!isDemoMode && (
            <>
              <GoogleButton />
              <AuthForm submitLabel="Log in" onSubmit={login} />
              <p className="text-sm text-center mt-4"><Link to="/forgot" className="underline text-muted">Forgot your password?</Link></p>
            </>
          )}
          <p className="text-sm text-muted mt-6 text-center">
            New here? <Link to="/signup" className="font-bold text-text underline">Create an account</Link>
          </p>
        </Card>
      </main>
    </div>
  )
}
