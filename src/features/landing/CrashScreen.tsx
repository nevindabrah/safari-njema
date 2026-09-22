// Shown when a screen throws while rendering: a plain apology and a reload button, instead of a blank page.
// Exists because the not found page said "I am lost", which is the wrong message for a crash.
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { TopBar } from '../../components/TopBar'

export function CrashScreen() {
  return (
    <div className="min-h-dvh">
      <TopBar />
      <main className="mx-auto max-w-md px-4 py-10">
        <Card className="text-center">
          <p lang="sw" className="font-display font-extrabold text-4xl mb-2">Pole</p>
          <p className="text-muted mb-1">Something went wrong on this screen.</p>
          <p className="text-muted mb-6">Reloading usually fixes it. Your trip is safe.</p>
          <Button full onClick={() => window.location.reload()}>Reload the page</Button>
        </Card>
      </main>
    </div>
  )
}
