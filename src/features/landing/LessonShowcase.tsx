// Builds three real lessons on the spot and shows them side by side: a market, a beach and a game reserve, each with its photo.
// Exists to prove the product's one idea at a glance: the place decides what you learn.
import { useEffect, useState } from 'react'
import { KangaCloth } from '../../components/KangaCloth'
import { PlacePhoto } from '../places/PlacePhoto'
import type { PlaceType } from '../../lib/types'
import type { StoredLesson } from '../demo/localStore'

const STOPS = [
  { placeId: 'sample-maasai-market', placeName: 'Maasai Market', placeType: 'market', region: 'nairobi', activities: ['shopping'], firstStop: true, note: 'First stop, so it opens with greetings, then prices and bargaining.' },
  { placeId: 'sample-diani', placeName: 'Diani Beach', placeType: 'beach', region: 'coast', activities: ['eating out'], firstStop: false, note: 'Ordering food, a coastal greeting, beach words, and a note on dress.' },
  { placeId: 'sample-maasai-mara', placeName: 'Maasai Mara', placeType: 'park', region: 'rift_valley_mara', activities: ['game drive'], firstStop: false, note: 'The animals your guide will call out, and how to ask about them.' },
]

export function LessonShowcase() {
  const [lessons, setLessons] = useState<StoredLesson[]>([])

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
      <p className="text-sm font-bold uppercase tracking-wide text-accent-text px-1">The idea</p>
      <h2 id="showcase-title" className="text-3xl sm:text-4xl mb-2 px-1">Three stops, three different lessons</h2>
      <p className="text-muted mb-6 px-1 max-w-2xl">These are built right now in your browser, by the same code that runs on the server. Nothing below is a screenshot.</p>
      <div className="grid md:grid-cols-3 gap-5">
        {STOPS.map((stop, i) => {
          const built = lessons[i]
          return (
            <article key={stop.placeName} className="bg-surface rounded-card shadow-soft overflow-hidden flex flex-col">
              <div className="relative">
                <PlacePhoto googlePlaceId={stop.placeId} placeType={stop.placeType as PlaceType} name={stop.placeName} size="small" className="w-full h-44" />
                <span className="absolute top-3 left-3 w-9 h-9 rounded-pill bg-accent text-on-accent font-display font-extrabold flex items-center justify-center" style={{ border: '3px solid var(--surface)' }}>{i + 1}</span>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-2xl">{stop.placeName}</h3>
                <p className="text-sm text-muted mt-1 mb-4">{stop.note}</p>
                <ul className="flex flex-col divide-y flex-1" style={{ borderColor: 'var(--line)' }}>
                  {(built?.phrases ?? []).slice(0, 4).map((phrase) => (
                    <li key={phrase.id} className="py-2" style={{ borderColor: 'var(--line)' }}>
                      <span lang="sw" className="block font-display font-extrabold">{phrase.swahili}</span>
                      <span className="block text-sm text-muted">{phrase.english}</span>
                    </li>
                  ))}
                  {!built && <li className="text-sm text-muted py-2">Building the lesson.</li>}
                </ul>
                {built?.lesson.kanga && (
                  <div className="mt-4 flex items-center gap-3">
                    <div className="w-24 shrink-0"><KangaCloth proverb={built.lesson.kanga.proverb} /></div>
                    <p className="text-xs text-muted">{built.lesson.kanga.meaning}</p>
                  </div>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
