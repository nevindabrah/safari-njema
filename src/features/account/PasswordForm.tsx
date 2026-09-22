// Set or change the password used with your email or username. Google accounts start without one.
// Exists so someone who signed up with Google can also log in by username and password on a device without Google.
import { useState, type FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { plainAuthMessage } from '../../lib/authMessages'
import { Button } from '../../components/Button'

export function PasswordForm() {
  const [password, setPassword] = useState('')
  const [again, setAgain] = useState('')
  const [note, setNote] = useState<{ text: string; problem: boolean } | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (password !== again) return setNote({ text: 'The two passwords do not match.', problem: true })
    setBusy(true)
    const { error } = await supabase.auth.updateUser({ password })
    setBusy(false)
    if (error) return setNote({ text: plainAuthMessage(error.message), problem: true })
    setPassword('')
    setAgain('')
    setNote({ text: 'Password saved. You can now log in with your username or email and this password.', problem: false })
  }

  const inputClass = 'w-full min-h-[48px] px-4 rounded-input field text-text'

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm font-bold">
        New password
        <input className={inputClass} type="password" autoComplete="new-password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-sm font-bold">
        Type it again
        <input className={inputClass} type="password" autoComplete="new-password" required minLength={6} value={again} onChange={(e) => setAgain(e.target.value)} />
      </label>
      {note && <p role={note.problem ? 'alert' : 'status'} className={`text-sm font-bold ${note.problem ? 'text-accent-text' : ''}`}>{note.text}</p>}
      <Button type="submit" variant="soft" full disabled={busy} className="mt-1">{busy ? 'Saving' : 'Save password'}</Button>
    </form>
  )
}
