// The top of a lesson: the place's photo with its name over a dark fade, or the marigold block when there is no photo.
// Exists so the first thing a learner sees is the place itself. The proverb sits here as a pill, the kanga idea from the PRD.
import { Icon } from '../../components/icons'
import type { Lesson } from '../../lib/lessonSchema'
import type { PlaceType } from '../../lib/types'
import { photoFor, photoUrl } from '../places/photoData'
import { PhotoCredit } from '../places/PlacePhoto'
import { PLACE_TYPE_INFO } from '../trip/placeTypes'

interface LessonHeroProps {
  lesson: Lesson
  placeType: PlaceType
  googlePlaceId: string | null
  note: string
}

export function LessonHero({ lesson, placeType, googlePlaceId, note }: LessonHeroProps) {
  const photo = googlePlaceId ? photoFor(googlePlaceId) : null
  const onPhoto = Boolean(photo)

  return (
    <section className={`relative overflow-hidden rounded-card mb-5 ${onPhoto ? 'min-h-[260px] sm:min-h-[320px] flex items-end' : 'bg-hero text-on-hero'}`} style={onPhoto ? { color: 'var(--on-photo)' } : undefined}>
      {photo && <img src={photoUrl(photo, 'large')} alt="" className="absolute inset-0 w-full h-full object-cover" />}
      {photo && <div className="absolute inset-0" style={{ background: 'var(--photo-fade)' }} />}
      {!photo && <div className="kanga-dots absolute inset-0 opacity-30 pointer-events-none" aria-hidden="true" />}
      <div className="relative p-6 sm:p-8 w-full">
        <p className="text-sm font-bold opacity-90 flex items-center gap-1.5"><Icon name={placeType} size={16} />{PLACE_TYPE_INFO[placeType].label}</p>
        <h1 className="text-3xl sm:text-5xl mt-1">{lesson.place.name}</h1>
        {lesson.kanga && (
          <p className="inline-flex mt-4 rounded-input px-3 py-2 text-sm" style={{ background: onPhoto ? 'var(--hero)' : 'var(--ink)', color: onPhoto ? 'var(--on-hero)' : 'var(--on-ink)' }}>
            <b lang="sw" className="font-display">{lesson.kanga.proverb}</b>
          </p>
        )}
        <p className="text-xs mt-3 opacity-80 max-w-md">{note}</p>
        {googlePlaceId && <PhotoCredit googlePlaceId={googlePlaceId} className="opacity-70 mt-1" />}
      </div>
    </section>
  )
}
