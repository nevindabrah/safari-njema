// Shown for an address that does not exist, and when a screen fails to load.
// Exists so a mistyped or outdated link lands somewhere friendly, not on a raw error.
import { Link } from 'react-router'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { TopBar } from '../../components/TopBar'
import { LeaveButton } from '../../components/LeaveButton'

export function NotFoundScreen() {
  return (
    <div className="min-h-dvh">
      <TopBar />
      <main className="mx-auto max-w-md px-4 pt-4 pb-10">
        <LeaveButton kind="back" label="Back" to="/" showLabel className="mb-3" />
        <Card className="text-center">
          <p lang="sw" className="font-display font-extrabold text-5xl mb-2">Nimepotea</p>
          <p className="text-muted mb-1">That is Swahili for "I am lost", and so is this page.</p>
          <p className="text-muted mb-6">The address may be mistyped, or the page may have moved.</p>
          <Link to="/"><Button full tabIndex={-1}>Go to the start</Button></Link>
        </Card>
      </main>
    </div>
  )
}
