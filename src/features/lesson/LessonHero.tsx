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
  // Once the lesson is under way, a phone shows only a slim strip with the place name, so the lesson itself fits on screen.
  compact?: boolean
}

export function LessonHero({ lesson, placeType, googlePlaceId, note, compact = false }: LessonHeroProps) {
  const photo = googlePlaceId ? photoFor(googlePlaceId) : null
  const onPhoto = Boolean(photo)
  // Extra detail that a compact hero hides on a phone and keeps on a wider screen.
  const detail = compact ? 'hidden sm:block' : ''

  return (
    <section className={`relative overflow-hidden rounded-card mb-5 ${onPhoto ? `${compact ? 'min-h-[84px]' : 'min-h-[260px]'} sm:min-h-[320px] flex items-end` : 'bg-hero text-on-hero'}`} style={onPhoto ? { color: 'var(--on-photo)' } : undefined}>
      {photo && <img src={photoUrl(photo, 'large')} alt="" className="absolute inset-0 w-full h-full object-cover" />}
      {photo && <div className="absolute inset-0" style={{ background: 'var(--photo-fade)' }} />}
      {!photo && <div className="kanga-dots absolute inset-0 opacity-30 pointer-events-none" aria-hidden="true" />}
      <div className={`relative w-full sm:p-8 ${compact ? 'py-4 pl-5 pr-16' : 'p-6'}`}>
        <p className={`text-sm font-bold opacity-90 flex items-center gap-1.5 ${compact ? 'hidden sm:flex' : ''}`}><Icon name={placeType} size={16} />{PLACE_TYPE_INFO[placeType].label}</p>
        <h1 className={`sm:text-5xl sm:mt-1 ${compact ? 'text-xl' : 'text-3xl mt-1'}`}>{lesson.place.name}</h1>
        {lesson.kanga && (
          <p className={`mt-4 rounded-input px-3 py-2 text-sm ${compact ? 'hidden sm:inline-flex' : 'inline-flex'}`} style={{ background: onPhoto ? 'var(--hero)' : 'var(--ink)', color: onPhoto ? 'var(--on-hero)' : 'var(--on-ink)' }}>
            <b lang="sw" className="font-display">{lesson.kanga.proverb}</b>
          </p>
        )}
        <p className={`text-xs mt-3 opacity-80 max-w-md ${detail}`}>{note}</p>
        {googlePlaceId && <PhotoCredit googlePlaceId={googlePlaceId} className={`opacity-70 mt-1 ${detail}`} />}
      </div>
    </section>
  )
}
