// The email and password form shared by login and sign up.
// Exists so the two screens differ only in which Supabase call they make.
import { useState, type FormEvent } from 'react'
import { Button } from '../../components/Button'

interface AuthFormProps {
  submitLabel: string
  onSubmit: (email: string, password: string) => Promise<string | null>
}

export function AuthForm({ submitLabel, onSubmit }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    const message = await onSubmit(email, password)
    setError(message)
    setBusy(false)
  }

  const inputClass = 'w-full min-h-[48px] px-4 rounded-input bg-surface-2 text-text placeholder:text-muted'

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm font-bold">
        Email
        <input className={inputClass} type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-sm font-bold">
        Password
        <input className={inputClass} type="password" autoComplete="current-password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      {error && <p role="alert" className="text-sm text-accent font-bold">{error}</p>}
      <Button type="submit" full disabled={busy} className="mt-2">
        {busy ? 'One moment' : submitLabel}
      </Button>
    </form>
  )
}
