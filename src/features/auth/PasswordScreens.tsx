// Two small screens for a forgotten password: ask for the email, then set a new password from the emailed link.
// Exists because the PRD lists password reset by email as required. Supabase sends the email and signs the visitor in from the link.
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { supabase } from '../../lib/supabase'
import { plainAuthMessage } from '../../lib/authMessages'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { TopBar } from '../../components/TopBar'
import { LeaveButton } from '../../components/LeaveButton'
import { SetupNotice } from './SetupNotice'
import { isDemoMode } from '../demo/demoMode'

const inputClass = 'w-full min-h-[48px] px-4 rounded-input field text-text placeholder:text-muted'

export function ForgotPasswordScreen() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function send(event: FormEvent) {
    event.preventDefault()
    const { error: problem } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset` })
    if (problem) setError(plainAuthMessage(problem.message))
    else setSent(true)
  }

  return (
    <div className="min-h-dvh">
      <TopBar />
      <main className="mx-auto max-w-md px-4 pt-4 pb-10">
        <LeaveButton kind="back" label="Back to log in" to="/login" showLabel className="mb-3" />
        <Card>
          <h1 className="text-3xl mb-3">Reset your password</h1>
          <SetupNotice />
          {isDemoMode ? null : sent ? (
            <p className="text-muted">If that email has an account, a reset link is on its way. Open it on this device.</p>
          ) : (
            <form onSubmit={send} className="flex flex-col gap-3">
              <p className="text-muted mb-2">Enter your email and we will send you a link.</p>
              <label className="flex flex-col gap-1 text-sm font-bold">
                Email
                <input className={inputClass} type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </label>
              {error && <p role="alert" className="text-sm text-accent-text font-bold">{error}</p>}
              <Button type="submit" full className="mt-2">Send the link</Button>
            </form>
          )}
          <p className="text-sm text-muted mt-6 text-center"><Link to="/login" className="font-bold text-text underline">Back to log in</Link></p>
        </Card>
      </main>
    </div>
  )
}

export function ResetPasswordScreen() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function save(event: FormEvent) {
    event.preventDefault()
    const { error: problem } = await supabase.auth.updateUser({ password })
    if (problem) setError(plainAuthMessage(problem.message))
    else navigate('/trip', { replace: true })
  }

  return (
    <div className="min-h-dvh">
      <TopBar />
      <main className="mx-auto max-w-md px-4 pt-4 pb-10">
        <LeaveButton kind="back" label="Back to log in" to="/login" showLabel className="mb-3" />
        <Card>
          <h1 className="text-3xl mb-1">Choose a new password</h1>
          <form onSubmit={save} className="flex flex-col gap-3 mt-4">
            <label className="flex flex-col gap-1 text-sm font-bold">
              New password
              <input className={inputClass} type="password" autoComplete="new-password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>
            {error && <p role="alert" className="text-sm text-accent-text font-bold">{error}</p>}
            <Button type="submit" full className="mt-2">Save and continue</Button>
          </form>
        </Card>
      </main>
    </div>
  )
}
