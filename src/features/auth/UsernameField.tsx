// A username input that tidies what is typed and says at once whether the name is free.
// Exists so sign up, the welcome step and the account page all check a username the same way.
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { normaliseUsername, usernameProblem } from '../../lib/username'
import { isDemoMode } from '../demo/demoMode'

interface UsernameFieldProps {
  value: string
  onChange: (value: string) => void
  current?: string | null
  label?: string
}

export function UsernameField({ value, onChange, current = null, label = 'Username' }: UsernameFieldProps) {
  const [taken, setTaken] = useState<boolean | null>(null)
  const problem = value ? usernameProblem(value) : null

  useEffect(() => {
    setTaken(null)
    if (!value || problem || value === current || isDemoMode) return
    const handle = setTimeout(async () => {
      const { data } = await supabase.rpc('username_taken', { p_username: value })
      setTaken(data === true)
    }, 350)
    return () => clearTimeout(handle)
  }, [value, problem, current])

  const note = problem ?? (taken === true ? 'That username is taken.' : taken === false ? 'Available.' : value === current && value ? 'This is your username now.' : 'Letters, numbers and underscores. 3 to 20 characters.')

  return (
    <label className="flex flex-col gap-1 text-sm font-bold">
      {label}
      <input className="w-full min-h-[48px] px-4 rounded-input field text-text placeholder:text-muted" type="text" autoComplete="username" autoCapitalize="none" spellCheck={false}
        placeholder="amina_k" value={value} onChange={(e) => onChange(normaliseUsername(e.target.value))} aria-describedby="username-note" />
      <span id="username-note" className={`text-xs font-normal ${problem || taken ? 'text-accent-text' : taken === false ? 'text-text' : 'text-muted'}`}>{note}</span>
    </label>
  )
}
