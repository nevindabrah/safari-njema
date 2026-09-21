// A short note shown on the auth screens when Supabase has not been set up yet.
// Exists so a fresh clone explains itself instead of failing with a network error.
import { Link } from 'react-router'
import { isSupabaseConfigured } from '../../lib/supabase'

export function SetupNotice() {
  if (isSupabaseConfigured) return null
  return (
    <div className="bg-tint rounded-input p-4 mb-5 text-sm">
      <p className="font-bold">Accounts are not connected yet.</p>
      <p className="text-muted">
        Add the Supabase values to .env to sign up and plan a trip. Until then you can{' '}
        <Link to="/preview" className="underline font-bold text-text">try a sample lesson</Link>.
      </p>
    </div>
  )
}
