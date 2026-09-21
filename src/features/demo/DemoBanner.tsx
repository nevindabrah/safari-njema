// A small strip that says this is the demo, with a button to start again from an empty trip.
// Exists so nobody mistakes the demo for a real account, and so the first stop flow can be tried from scratch.
import { useAuth } from '../auth/useAuth'
import { isDemoMode } from './demoMode'
import { startEmptyTrip } from './localStore'

export function DemoBanner() {
  const { user } = useAuth()
  if (!isDemoMode || !user) return null

  function startOver() {
    startEmptyTrip()
    window.location.assign('/trip')
  }

  return (
    <div className="bg-tint text-text text-xs sm:text-sm">
      <div className="mx-auto max-w-6xl px-4 py-2 flex items-center justify-between gap-3">
        <p><b>Live demo.</b> A sample trip saved in your browser. Add your own stops, or start from empty.</p>
        <button type="button" onClick={startOver} className="shrink-0 underline font-bold min-h-[32px] cursor-pointer">Start with an empty trip</button>
      </div>
    </div>
  )
}
