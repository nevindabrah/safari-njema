// Loads a saved lesson for the signed in user and hands it to the lesson player.
// Exists as the "learn" step of the core loop.
import { Link, useParams } from 'react-router'
import { TopBar } from '../../components/TopBar'
import { Card } from '../../components/Card'
import { useLesson } from './useLesson'
import { LessonPlayer } from './LessonPlayer'

export function LessonScreen() {
  const { id } = useParams()
  const { data, error, markCompleted } = useLesson(id)

  return (
    <div className="min-h-dvh">
      <TopBar />
      <main className="mx-auto max-w-2xl px-4 pb-28 sm:pb-10">
        {error && (
          <Card className="mt-6">
            <p className="mb-2">{error}</p>
            <Link to="/trip" className="underline font-bold">Back to my trip</Link>
          </Card>
        )}
        {!error && !data && <p className="p-8 text-center text-muted">Opening your lesson.</p>}
        {data && (
          <LessonPlayer
            lesson={data.lesson}
            phrases={data.phrases}
            pool={data.pool}
            googlePlaceId={data.googlePlaceId}
            userLessonId={data.userLessonId}
            generatedBy={data.generatedBy}
            backTo="/trip"
            backLabel="Back to my trip"
            onComplete={markCompleted}
          />
        )}
      </main>
    </div>
  )
}
