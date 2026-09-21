// A small strip that says the app is in test mode, with a button to clear the test data.
// Exists so nobody mistakes test mode for the real thing, and so a tester can start again in one tap.
import { isTestMode } from './testMode'
import { resetLocalData } from './localStore'

export function TestModeBanner() {
  if (!isTestMode) return null

  function reset() {
    resetLocalData()
    window.location.assign('/trip')
  }

  return (
    <div className="bg-tint text-text text-xs sm:text-sm">
      <div className="mx-auto max-w-6xl px-4 py-2 flex items-center justify-between gap-3">
        <p><b>Test mode.</b> You are signed in as a test user. Everything is saved in this browser only.</p>
        <button type="button" onClick={reset} className="shrink-0 underline font-bold min-h-[32px] cursor-pointer">Clear test data</button>
      </div>
    </div>
  )
}
