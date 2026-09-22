// The log in screen: Google, or a username or email with a password.
// Exists as the front door for returning users.
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { supabase } from '../../lib/supabase'
import { plainAuthMessage } from '../../lib/authMessages'
import { isEmail } from '../../lib/username'
import { Card } from '../../components/Card'
import { TopBar } from '../../components/TopBar'
import { LeaveButton } from '../../components/LeaveButton'
import { AuthForm, type AuthFormValues } from './AuthForm'
import { SetupNotice } from './SetupNotice'
import { GoogleButton } from './GoogleButton'
import { isDemoMode } from '../demo/demoMode'
import { useAuth } from './useAuth'

export function LoginScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/trip'
  const { user, loading } = useAuth()
  if (!loading && user && !isDemoMode) return <Navigate to={from} replace />

  async function login({ identifier, password }: AuthFormValues) {
    let email = identifier
    if (!isEmail(identifier)) {
      const { data, error: lookup } = await supabase.rpc('email_for_login', { p_username: identifier, p_password: password })
      if (lookup) return plainAuthMessage(lookup.message)
      if (!data) return 'That username and password do not match an account.'
      email = data as string
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return plainAuthMessage(error.message)
    navigate(from, { replace: true })
    return null
  }

  return (
    <div className="min-h-dvh">
      <TopBar />
      <main className="mx-auto max-w-md px-4 pt-4 pb-10">
        <LeaveButton kind="back" label="Back" to="/" showLabel className="mb-3" />
        <Card>
          <h1 className="text-3xl mb-1">Welcome back</h1>
          <p className="text-muted mb-6">Log in to open your trip.</p>
          <SetupNotice />
          {!isDemoMode && (
            <>
              <GoogleButton />
              <AuthForm submitLabel="Log in" mode="login" onSubmit={login} />
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
