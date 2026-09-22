// The part of the account page where you change your username and the name friends see.
// Exists apart from AccountScreen so that screen stays a short list of sections.
import { useEffect, useState, type FormEvent } from 'react'
import { Button } from '../../components/Button'
import { usernameProblem } from '../../lib/username'
import { useProfile } from '../auth/useProfile'
import { UsernameField } from '../auth/UsernameField'

export function ProfileForm() {
  const { profile, save } = useProfile()
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [note, setNote] = useState<{ text: string; problem: boolean } | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!profile) return
    setUsername(profile.username ?? '')
    setDisplayName(profile.display_name ?? '')
  }, [profile])

  async function submit(event: FormEvent) {
    event.preventDefault()
    const problem = usernameProblem(username)
    if (problem) return setNote({ text: problem, problem: true })
    setBusy(true)
    const message = await save({ username, display_name: displayName.trim() || null })
    setBusy(false)
    setNote(message ? { text: message, problem: true } : { text: 'Saved.', problem: false })
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <UsernameField value={username} onChange={setUsername} current={profile?.username} />
      <label className="flex flex-col gap-1 text-sm font-bold">
        Name shown to friends
        <input className="w-full min-h-[48px] px-4 rounded-input field text-text" type="text" autoComplete="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={60} />
      </label>
      {note && <p role={note.problem ? 'alert' : 'status'} className={`text-sm font-bold ${note.problem ? 'text-accent-text' : ''}`}>{note.text}</p>}
      <Button type="submit" variant="soft" full disabled={busy} className="mt-1">{busy ? 'Saving' : 'Save profile'}</Button>
    </form>
  )
}
