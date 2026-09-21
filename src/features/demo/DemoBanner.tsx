// A small strip that says this is the demo, with a button to start again from an empty trip.
// Exists so nobody mistakes the demo for a real account, and so the first stop flow can be tried from scratch.
import { useLocation } from 'react-router'
import { useAuth } from '../auth/useAuth'
import { isDemoMode, accountsAvailable, leaveDemo } from './demoMode'
import { startEmptyTrip } from './localStore'

export function DemoBanner() {
  const { user } = useAuth()
  const { pathname } = useLocation()
  // Shown where the trip is managed. A lesson or a pocket card keeps the whole screen for itself.
  const focused = pathname.startsWith('/lesson') || pathname.startsWith('/card')
  if (!isDemoMode || !user || focused) return null

  function startOver() {
    startEmptyTrip()
    window.location.assign('/trip')
  }

  return (
    <div className="bg-tint text-text text-xs sm:text-sm">
      <div className="mx-auto max-w-6xl px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-x-3">
        <p><b>Live demo.</b> A sample trip saved in your browser. Add your own stops, or start from empty.</p>
        <span className="shrink-0 flex gap-4">
          <button type="button" onClick={startOver} className="underline font-bold min-h-[32px] cursor-pointer">Start with an empty trip</button>
          {accountsAvailable && <button type="button" onClick={() => leaveDemo('/signup')} className="underline font-bold min-h-[32px] cursor-pointer">Create an account</button>}
        </span>
      </div>
    </div>
  )
}
