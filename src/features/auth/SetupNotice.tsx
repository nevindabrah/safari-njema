// Shown on the login and sign up screens in demo mode, in place of a form that has nowhere to send a password.
// Exists so a visitor is never stuck at a login wall: one tap opens the demo account.
import { useNavigate } from 'react-router'
import { Button } from '../../components/Button'
import { isDemoMode, accountsAvailable, leaveDemo } from '../demo/demoMode'
import { useAuth } from './useAuth'

export function SetupNotice() {
  const { signInAsDemoUser } = useAuth()
  const navigate = useNavigate()
  if (!isDemoMode) return null

  function enter() {
    signInAsDemoUser()
    navigate('/trip', { replace: true })
  }

  // A demo visitor on a site that does have accounts: one tap leaves the demo and brings back the real form.
  if (accountsAvailable) {
    return (
      <div className="bg-tint rounded-input p-4 mb-5 text-sm">
        <p className="font-bold">You are in the demo.</p>
        <p className="text-muted mb-3">Leave it to log in or create an account. Your demo trip stays saved in this browser.</p>
        <Button variant="accent" full onClick={() => leaveDemo(window.location.pathname)}>Leave the demo</Button>
      </div>
    )
  }

  return (
    <div className="bg-tint rounded-input p-4 mb-5 text-sm">
      <p className="font-bold">This is the live demo.</p>
      <p className="text-muted mb-3">
        Accounts are switched off here, so there is nothing to sign up for. The demo account has a ready-made trip and saves everything in your browser.
      </p>
      <Button variant="accent" full onClick={enter}>Open the demo</Button>
    </div>
  )
}
