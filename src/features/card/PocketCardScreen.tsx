// The pocket card for one stop: every phrase, the three things to know, the etiquette note and the emergency numbers, on one page.
// Exists for the moment you are actually standing in the market. It prints cleanly, because signal in places like the Mara is unreliable.
import { Link, useParams } from 'react-router'
import { TopBar } from '../../components/TopBar'
import { LeaveButton } from '../../components/LeaveButton'
import { Button } from '../../components/Button'
import { Icon } from '../../components/icons'
import { ReviewNote } from '../../components/ReviewNote'
import { useLesson } from '../lesson/useLesson'
import { PlacePhoto, PhotoCredit } from '../places/PlacePhoto'
import type { PlaceType } from '../../lib/types'
import { SpeakButton } from '../audio/SpeakButton'

export function PocketCardScreen() {
  const { id } = useParams()
  const { data, error } = useLesson(id)

  return (
    <div className="min-h-dvh">
      <TopBar />
      <main className="mx-auto max-w-2xl px-4 pt-4 pb-28 sm:pb-10">
        <LeaveButton kind="back" label="Back to my trip" to="/trip" showLabel className="mb-3" />
        {error && <p className="p-8 text-center">{error} <Link to="/trip" className="underline font-bold">Back to my trip</Link></p>}
        {!error && !data && <p className="p-8 text-center text-muted">Opening your pocket card.</p>}
        {data && (
          <article className="bg-surface rounded-card shadow-soft overflow-hidden">
            {data.googlePlaceId && <PlacePhoto googlePlaceId={data.googlePlaceId} placeType={data.lesson.place.type as PlaceType} name={data.lesson.place.name} size="large" className="w-full h-40 no-print" />}
            <div className="p-5 sm:p-7">
              <p className="text-xs uppercase tracking-wide font-bold text-muted">Pocket card</p>
              <h1 className="text-3xl sm:text-4xl mt-1">{data.lesson.place.name}</h1>

              <h2 className="text-lg mt-6 mb-2">Say it</h2>
              <ul className="divide-y" style={{ borderColor: 'var(--line)' }}>
                {data.phrases.map((phrase) => (
                  <li key={phrase.id} className="py-2.5 grid grid-cols-[auto_1fr_1fr] gap-3 items-center" style={{ borderColor: 'var(--line)' }}>
                    <span className="w-11 no-print"><SpeakButton swahili={phrase.swahili} /></span>
                    <span><span lang="sw" className="font-display font-extrabold block">{phrase.swahili}</span><span className="text-xs text-accent-text font-bold">{phrase.pronunciation}</span></span>
                    <span className="text-sm text-muted">{phrase.english}</span>
                  </li>
                ))}
              </ul>

              <h2 className="text-lg mt-6 mb-2">Know it</h2>
              <ul className="flex flex-col gap-1.5 text-sm">
                {data.lesson.brief.know_today.map((item, i) => <li key={i} className="flex gap-2"><span className="font-bold text-accent-text">{i + 1}</span>{item}</li>)}
              </ul>
              <p className="text-sm mt-3"><b>Etiquette.</b> {data.lesson.brief.etiquette}</p>
              <p className="text-sm mt-1"><b>Practical.</b> {data.lesson.brief.practical}</p>

              <div className="mt-6 rounded-input bg-tint p-4 flex flex-wrap gap-x-8 gap-y-1 items-baseline">
                <p className="text-xs uppercase tracking-wide font-bold text-muted w-full">Emergency numbers in Kenya</p>
                <p className="font-display font-extrabold text-3xl">999</p>
                <p className="font-display font-extrabold text-3xl">112</p>
              </div>
              <p className="text-xs text-muted mt-3">Details change. Check locally.</p>
              {data.googlePlaceId && <PhotoCredit googlePlaceId={data.googlePlaceId} className="text-muted mt-1 no-print" />}

              <div className="mt-6 flex gap-3 no-print">
                <Button onClick={() => window.print()}><Icon name="print" size={18} />Print or save</Button>
                <Link to="/trip"><Button variant="soft" tabIndex={-1}>Back to my trip</Button></Link>
              </div>
            </div>
          </article>
        )}
        <div className="no-print"><ReviewNote /></div>
      </main>
    </div>
  )
}
