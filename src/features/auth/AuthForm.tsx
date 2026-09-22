// The form shared by log in and sign up: who you are, your password, and on sign up the username you want.
// Exists so the two screens differ only in which Supabase call they make.
import { useState, type FormEvent } from 'react'
import { Button } from '../../components/Button'
import { UsernameField } from './UsernameField'

export interface AuthFormValues {
  identifier: string
  password: string
  username: string
}

interface AuthFormProps {
  submitLabel: string
  mode: 'login' | 'signup'
  onSubmit: (values: AuthFormValues) => Promise<string | null>
}

export function AuthForm({ submitLabel, mode, onSubmit }: AuthFormProps) {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    const message = await onSubmit({ identifier: identifier.trim(), password, username })
    setError(message)
    setBusy(false)
  }

  const inputClass = 'w-full min-h-[48px] px-4 rounded-input field text-text placeholder:text-muted'

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {mode === 'signup' && <UsernameField value={username} onChange={setUsername} />}
      <label className="flex flex-col gap-1 text-sm font-bold">
        {mode === 'signup' ? 'Email' : 'Email or username'}
        <input className={inputClass} type={mode === 'signup' ? 'email' : 'text'} autoComplete={mode === 'signup' ? 'email' : 'username'} autoCapitalize="none" required maxLength={254} value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-sm font-bold">
        Password
        <input className={inputClass} type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      {error && <p role="alert" className="text-sm text-accent-text font-bold">{error}</p>}
      <Button type="submit" full disabled={busy} className="mt-2">
        {busy ? 'One moment' : submitLabel}
      </Button>
    </form>
  )
}
