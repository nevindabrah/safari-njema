// The public landing page: the kanga hero, the way in, three sample lessons, the clock and the phrasebook.
// Exists as the first thing a traveller sees, so one tap must lead to their trip.
import { Link, Navigate, useNavigate } from 'react-router'
import { Hero } from '../../components/Hero'
import { Icon, type IconName } from '../../components/icons'
import { Button } from '../../components/Button'
import { TopBar } from '../../components/TopBar'
import { Footer } from '../../components/Footer'
import { useAuth } from '../auth/useAuth'
import { isDemoMode } from '../demo/demoMode'
import { LessonShowcase } from './LessonShowcase'
import { TimeTeaser } from '../time/TimeTeaser'
import { HeroMap } from './HeroMap'

const STEPS: Array<{ icon: IconName; title: string; body: string }> = [
  { icon: 'search', title: 'Pick', body: 'Choose the places you are going in Kenya, from a beach to a market stall.' },
  { icon: 'other', title: 'Add', body: 'Put it on a day of your trip. It becomes a numbered pin on your map.' },
  { icon: 'bolt', title: 'Learn', body: 'A lesson is made for that exact place, as long as you have time for: what to know, what to say, and practice.' },
]

export function LandingScreen() {
  const { user, loading, signInAsDemoUser } = useAuth()
  const navigate = useNavigate()
  const firstScreen = ((window.history.state as { idx?: number } | null)?.idx ?? 0) === 0
  if (!loading && user && firstScreen) return <Navigate to="/trip" replace />

  function openDemo() {
    signInAsDemoUser()
    navigate('/trip')
  }

  return (
    <div className="min-h-dvh">
      <TopBar />
      <main className="mx-auto max-w-5xl px-4 py-6 flex flex-col gap-12">
        <Hero eyebrow="A travel companion for Kenya" title="Learn the Swahili you will actually say." art={<HeroMap />}>
          <p className="text-lg max-w-xl">
            Taught in the order your trip needs it. Add the places you are going, and each one becomes a short lesson made for that place.
          </p>
          <div className="mt-6 flex gap-3 flex-wrap">
            {user ? (
              <Link to="/trip"><Button variant="accent" tabIndex={-1}>Open my trip</Button></Link>
            ) : isDemoMode ? (
              <Button variant="accent" onClick={openDemo}>Try the live demo</Button>
            ) : (
              <Link to="/signup"><Button variant="accent" tabIndex={-1}>Create your account</Button></Link>
            )}
            <Link to="/preview"><Button variant="onHero" tabIndex={-1}>See a sample lesson</Button></Link>
          </div>
          <p className="inline-flex flex-wrap items-baseline gap-x-3 gap-y-1 mt-7 rounded-card px-4 py-3" style={{ background: 'var(--ink)', color: 'var(--on-ink)' }}>
            <b lang="sw" className="font-display">Haba na haba hujaza kibaba</b>
            <span className="text-sm opacity-75">Little by little fills the measure.</span>
          </p>
        </Hero>

        <section aria-labelledby="how-title">
          <h2 id="how-title" className="sr-only">How it works</h2>
          <ol className="grid sm:grid-cols-3 gap-x-8 gap-y-6 px-1">
            {STEPS.map((step, i) => (
              <li key={step.title} className="border-t-4 pt-4" style={{ borderColor: 'var(--hero)' }}>
                <p className="flex items-center justify-between text-muted"><span className="font-display font-extrabold text-5xl text-text">{i + 1}</span><Icon name={step.icon} size={28} /></p>
                <h3 className="text-2xl mt-2 mb-1">{step.title}</h3>
                <p className="text-muted leading-relaxed">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <LessonShowcase />
        <TimeTeaser />
        <section aria-labelledby="help-title" className="rounded-card bg-tint p-6 sm:p-8 grid sm:grid-cols-[1fr_auto] gap-5 items-center">
          <div>
            <h2 id="help-title" className="text-2xl sm:text-3xl mb-2">Do you speak Swahili?</h2>
            <p className="max-w-2xl">The phrasebook lists every phrase with its pronunciation guide and recording. If something could be said better, leave a note beside it and send your notes in one go. No account needed.</p>
          </div>
          <Link to="/phrasebook"><Button tabIndex={-1}>Open the phrasebook<Icon name="arrow" size={18} /></Button></Link>
        </section>

        <Footer />
      </main>
    </div>
  )
}
