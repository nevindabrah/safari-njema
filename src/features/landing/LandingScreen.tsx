// The public landing page: the kanga hero, a sign up button and the demo login.
// Exists as the first thing a visitor or a reviewer sees.
import { Link, Navigate } from 'react-router'
import { Hero } from '../../components/Hero'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { TopBar } from '../../components/TopBar'
import { ReviewNote } from '../../components/ReviewNote'
import { useAuth } from '../auth/useAuth'

export function LandingScreen() {
  const { user, loading } = useAuth()
  if (!loading && user) return <Navigate to="/trip" replace />

  return (
    <div className="min-h-dvh">
      <TopBar />
      <main className="mx-auto max-w-4xl px-4 py-6 flex flex-col gap-6">
        <Hero eyebrow="A travel companion for Kenya" title="Learn the Swahili you will actually say.">
          <p className="text-lg max-w-xl">
            Add the places you are going. For each one you get a short lesson: what to know, the phrases you will need, and a quick quiz.
          </p>
          <div className="mt-6 flex gap-3 flex-wrap">
            <Link to="/signup"><Button variant="accent" tabIndex={-1}>Start your trip</Button></Link>
            <Link to="/preview"><Button variant="onHero" tabIndex={-1}>Try a sample lesson</Button></Link>
          </div>
        </Hero>

        <div className="grid sm:grid-cols-3 gap-4">
          <Card><p className="text-3xl mb-2" aria-hidden="true">🔍</p><h2 className="text-xl mb-1">Search</h2><p className="text-muted text-sm">Find any place in Kenya on the map, from a beach to a market stall.</p></Card>
          <Card><p className="text-3xl mb-2" aria-hidden="true">📌</p><h2 className="text-xl mb-1">Add</h2><p className="text-muted text-sm">Put it on a day of your trip. It becomes a pin on your map.</p></Card>
          <Card><p className="text-3xl mb-2" aria-hidden="true">🗣️</p><h2 className="text-xl mb-1">Learn</h2><p className="text-muted text-sm">A five minute lesson is made for that exact place.</p></Card>
        </div>

        <Card>
          <h2 className="text-xl mb-1">Just looking?</h2>
          <p className="text-muted text-sm">Use the demo login in the README to open a ready-made trip without signing up.</p>
        </Card>
        <ReviewNote />
      </main>
    </div>
  )
}
