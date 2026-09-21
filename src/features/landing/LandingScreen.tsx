// The public landing page: the kanga hero, the way in, a live showcase of lessons, and a section for reviewers.
// Exists as the first thing a visitor or a recruiter sees, so one tap must lead to the product.
import { Link, Navigate, useNavigate } from 'react-router'
import { Hero } from '../../components/Hero'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { TopBar } from '../../components/TopBar'
import { Footer } from '../../components/Footer'
import { useAuth } from '../auth/useAuth'
import { isDemoMode } from '../demo/demoMode'
import { LessonShowcase } from './LessonShowcase'
import { BuiltSection } from './BuiltSection'
import { HeroMap } from './HeroMap'
import { FullVersionSection } from './FullVersionSection'

const STEPS = [
  { emoji: '🔍', title: 'Search', body: 'Find any place in Kenya on the map, from a beach to a market stall.' },
  { emoji: '📌', title: 'Add', body: 'Put it on a day of your trip. It becomes a numbered pin on your map.' },
  { emoji: '🗣️', title: 'Learn', body: 'A five minute lesson is made for that exact place: what to know, what to say, and a quiz.' },
]

export function LandingScreen() {
  const { user, loading, signInAsDemoUser } = useAuth()
  const navigate = useNavigate()
  if (!loading && user) return <Navigate to="/trip" replace />

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
            Duolingo, but the curriculum is your itinerary. Add the places you are going, and each one becomes a short lesson made for that place.
          </p>
          <div className="mt-6 flex gap-3 flex-wrap">
            {isDemoMode ? (
              <Button variant="accent" onClick={openDemo}>Try the live demo</Button>
            ) : (
              <Link to="/signup"><Button variant="accent" tabIndex={-1}>Start your trip</Button></Link>
            )}
            <Link to="/preview"><Button variant="onHero" tabIndex={-1}>See a sample lesson</Button></Link>
          </div>
          <p className="inline-flex flex-wrap items-baseline gap-x-3 gap-y-1 mt-7 rounded-card px-4 py-3" style={{ background: 'var(--ink)', color: 'var(--on-accent)' }}>
            <b lang="sw" className="font-display">Haba na haba hujaza kibaba</b>
            <span className="text-sm opacity-75">Little by little fills the measure.</span>
          </p>
        </Hero>

        <section aria-labelledby="how-title">
          <h2 id="how-title" className="text-3xl mb-5 px-1">How it works</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {STEPS.map((step, i) => (
              <Card key={step.title}>
                <p className="text-3xl mb-3" aria-hidden="true">{step.emoji}</p>
                <h3 className="text-xl mb-1">{i + 1}. {step.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{step.body}</p>
              </Card>
            ))}
          </div>
        </section>

        <LessonShowcase />
        <FullVersionSection />
        <BuiltSection />
        <Footer />
      </main>
    </div>
  )
}
