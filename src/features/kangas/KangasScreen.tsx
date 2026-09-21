// The kanga shelf: a cloth for every finished lesson, each with its proverb and meaning, and a veiled one for every lesson still to do.
// Exists because a kanga always carries a proverb, so a collection of them is a record of the trip in the culture's own form.
import { Link } from 'react-router'
import { TopBar } from '../../components/TopBar'
import { LeaveButton } from '../../components/LeaveButton'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { KangaCloth } from '../../components/KangaCloth'
import { ProgressBar } from '../../components/ProgressBar'
import { Footer } from '../../components/Footer'
import { useKangas } from './useKangas'

export function KangasScreen() {
  const kangas = useKangas()
  const earned = kangas?.filter((k) => k.earned).length ?? 0

  return (
    <div className="min-h-dvh">
      <TopBar />
      <main className="mx-auto max-w-5xl px-4 pt-4 pb-28 sm:pb-10">
        <LeaveButton kind="back" label="Back to my trip" to="/trip" showLabel className="mb-3" />
        <h1 className="text-4xl sm:text-5xl">My kangas</h1>
        <p className="text-muted mt-2 max-w-2xl">
          A kanga is a printed cloth worn along the East African coast, and every one carries a Swahili proverb. Finish a lesson and you earn the kanga for that stop.
        </p>

        {kangas && kangas.length > 0 && (
          <div className="mt-6 max-w-md">
            <p className="text-sm font-bold mb-2">{earned === kangas.length ? 'The whole shelf is yours.' : `${earned} of ${kangas.length} earned`}</p>
            <ProgressBar value={earned} max={kangas.length} label="Kangas earned" />
          </div>
        )}

        {kangas && kangas.length === 0 && (
          <Card className="mt-8 text-center">
            <p className="font-bold">No kangas yet.</p>
            <p className="text-muted text-sm mb-4">Add a stop to your trip and finish its lesson to earn your first one.</p>
            <Link to="/trip"><Button tabIndex={-1}>Go to my trip</Button></Link>
          </Card>
        )}

        <ul className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(kangas ?? []).map((kanga) => (
            <li key={kanga.userLessonId}>
              <div className="relative">
                <div style={kanga.earned ? undefined : { filter: 'grayscale(1)', opacity: 0.35 }}><KangaCloth proverb={kanga.proverb} className="shadow-soft" veiled={!kanga.earned} /></div>
                {!kanga.earned && (
                  <Link to={`/lesson/${kanga.userLessonId}`} className="absolute inset-0 flex items-center justify-center">
                    <Button variant="accent" tabIndex={-1}>Earn it</Button>
                  </Link>
                )}
              </div>
              <p className="font-display font-extrabold text-lg mt-3">{kanga.placeName}</p>
              {kanga.earned ? (
                <p className="text-sm text-muted"><span lang="sw" className="font-bold text-text">{kanga.proverb}.</span> {kanga.meaning}</p>
              ) : (
                <p className="text-sm text-muted">Finish this lesson to read its proverb.</p>
              )}
            </li>
          ))}
        </ul>
        <Footer />
      </main>
    </div>
  )
}
