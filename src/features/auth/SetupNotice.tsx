// Shown on the login and sign up screens in test mode, in place of a form that has nowhere to send a password.
// Exists so a fresh clone explains itself and still lets you in, as the test user.
import { useNavigate } from 'react-router'
import { Button } from '../../components/Button'
import { isTestMode } from '../testmode/testMode'
import { useAuth } from './useAuth'

export function SetupNotice() {
  const { signInAsTester } = useAuth()
  const navigate = useNavigate()
  if (!isTestMode) return null

  function enter() {
    signInAsTester()
    navigate('/trip', { replace: true })
  }

  return (
    <div className="bg-tint rounded-input p-4 mb-5 text-sm">
      <p className="font-bold">Accounts are not connected yet.</p>
      <p className="text-muted mb-3">
        Real sign up needs the Supabase values in .env. Until then, test mode gives you a ready-made account that lives in this browser.
      </p>
      <Button variant="accent" full onClick={enter}>Continue as the test user</Button>
    </div>
  )
}
