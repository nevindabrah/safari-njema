// A small strip that says this is the demo, with a button to start again from an empty trip and an X to put it away.
// Exists so nobody mistakes the demo for a real account, and so the first stop flow can be tried from scratch.
import { useState } from 'react'
import { useLocation } from 'react-router'
import { Icon } from '../../components/icons'
import { useAuth } from '../auth/useAuth'
import { isDemoMode, accountsAvailable, leaveDemo } from './demoMode'
import { startEmptyTrip } from './localStore'

const HIDDEN_KEY = 'safari-njema-demo-banner-hidden'

export function DemoBanner() {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const [hidden, setHidden] = useState(() => sessionStorage.getItem(HIDDEN_KEY) === '1')
  const focused = pathname.startsWith('/lesson') || pathname.startsWith('/card')
  if (!isDemoMode || !user || focused || hidden) return null

  function startOver() {
    startEmptyTrip()
    window.location.assign('/trip')
  }

  function hide() {
    sessionStorage.setItem(HIDDEN_KEY, '1')
    setHidden(true)
  }

  const action = 'underline font-bold min-h-[44px] sm:min-h-[36px] cursor-pointer'

  return (
    <div className="bg-tint text-text text-xs sm:text-sm">
      <div className="mx-auto max-w-6xl pl-4 pr-2 py-1 flex items-start sm:items-center gap-2">
        <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-x-3 pt-1 sm:pt-0">
          <p><b>Live demo.</b> A sample trip saved in your browser. Add your own stops, or start from empty.</p>
          <span className="shrink-0 flex gap-4">
            <button type="button" onClick={startOver} className={action}>Start with an empty trip</button>
            {accountsAvailable && <button type="button" onClick={() => leaveDemo('/signup')} className={action}>Create an account</button>}
          </span>
        </div>
        <button type="button" onClick={hide} aria-label="Hide this demo note" className="w-11 h-11 shrink-0 rounded-pill hover:bg-surface flex items-center justify-center cursor-pointer"><Icon name="close" size={16} /></button>
      </div>
    </div>
  )
}
