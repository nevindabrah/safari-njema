// A short card that points to the Telling time screen, with a small clock stuck at 7 am as the hook.
// Exists so the clock can be found from the landing page and the phrasebook, not only from the navigation.
import { Link } from 'react-router'
import { Button } from '../../components/Button'
import { Icon } from '../../components/icons'

export function TimeTeaser() {
  return (
    <section aria-labelledby="time-teaser-title" className="rounded-card bg-surface shadow-soft p-6 sm:p-8 grid sm:grid-cols-[1fr_auto] gap-5 items-center">
      <div>
        <h2 id="time-teaser-title" className="text-2xl sm:text-3xl mb-2">In Swahili, 7 am is hour one</h2>
        <p className="max-w-2xl text-muted">The day is counted from sunrise, so an agreed "hour two" pickup is 8 am, not 2. Turn the hand of the clock to see any hour both ways, then practise.</p>
      </div>
      <Link to="/time"><Button variant="accent" tabIndex={-1}><Icon name="clock" size={18} />Try the clock</Button></Link>
    </section>
  )
}
