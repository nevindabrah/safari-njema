// Builds three real lessons on the spot and shows them side by side: a market, a beach and a game reserve.
// Exists to prove the product's one idea at a glance: the place decides what you learn.
import { useEffect, useState } from 'react'
import { Card } from '../../components/Card'
import { PLACE_TYPE_INFO } from '../trip/placeTypes'
import type { PlaceType } from '../../lib/types'
import type { StoredLesson } from '../demo/localStore'

const STOPS = [
  { placeName: 'Maasai Market', placeType: 'market', region: 'nairobi', activities: ['shopping'], firstStop: true, note: 'First stop, so it opens with greetings' },
  { placeName: 'Diani Beach', placeType: 'beach', region: 'coast', activities: ['eating out'], firstStop: false, note: 'Coast words, ordering, and a note on dress' },
  { placeName: 'Maasai Mara', placeType: 'park', region: 'rift_valley_mara', activities: ['game drive'], firstStop: false, note: 'Animal names and phrases for your guide' },
]

export function LessonShowcase() {
  const [lessons, setLessons] = useState<StoredLesson[]>([])

  // The lesson builder and the seed are loaded only when this section mounts, to keep the first load small.
  useEffect(() => {
    let cancelled = false
    import('../demo/localLessons').then(async ({ buildLocalLesson }) => {
      const built = await Promise.all(STOPS.map((stop) => buildLocalLesson(stop)))
      if (!cancelled) setLessons(built)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section aria-labelledby="showcase-title">
      <h2 id="showcase-title" className="text-3xl mb-2 px-1">Three stops, three different lessons</h2>
      <p className="text-muted mb-5 px-1 max-w-2xl">These are built right now in your browser by the same code that runs on the server. Nothing here is a screenshot.</p>
      <div className="grid md:grid-cols-3 gap-4">
        {STOPS.map((stop, i) => {
          const info = PLACE_TYPE_INFO[stop.placeType as PlaceType]
          const built = lessons[i]
          return (
            <Card key={stop.placeName} className="flex flex-col">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-12 h-12 rounded-input bg-tint text-2xl flex items-center justify-center" aria-hidden="true">{info.emoji}</span>
                <div>
                  <h3 className="text-xl">{stop.placeName}</h3>
                  <p className="text-xs text-muted">{stop.note}</p>
                </div>
              </div>
              <ul className="flex flex-col gap-2 flex-1">
                {(built?.phrases ?? []).slice(0, 4).map((phrase) => (
                  <li key={phrase.id} className="bg-surface-2 rounded-input px-3 py-2">
                    <span lang="sw" className="block font-display font-extrabold">{phrase.swahili}</span>
                    <span className="block text-sm text-muted">{phrase.english}</span>
                  </li>
                ))}
                {!built && <li className="text-sm text-muted">Building the lesson.</li>}
              </ul>
              {built?.lesson.kanga && (
                <p className="mt-3 text-sm"><b lang="sw">{built.lesson.kanga.proverb}</b> <span className="text-muted">{built.lesson.kanga.meaning}</span></p>
              )}
            </Card>
          )
        })}
      </div>
    </section>
  )
}
