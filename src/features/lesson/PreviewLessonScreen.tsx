// A public sample lesson built in the browser from the seed phrases, with no account and no server.
// Exists so a visitor or reviewer can see what a lesson is like, and so the app can be tried before Supabase is set up.
import { useEffect, useMemo, useState } from 'react'
import { TopBar } from '../../components/TopBar'
import { loadSeedBank, type BankPhrase } from './seedBank'
import { pickCandidates, pickTemplatePhrases, type CandidateContext } from '../../../supabase/functions/_shared/pickCandidates'
import { buildTemplateLesson } from '../../../supabase/functions/_shared/template'
import { LessonPlayer } from './LessonPlayer'

// The three stops from the Phase 1 acceptance test.
const SAMPLES: Array<{ name: string; placeId: string; ctx: CandidateContext }> = [
  { name: 'Maasai Market', placeId: 'sample-maasai-market', ctx: { placeType: 'market', activities: ['shopping'], region: 'nairobi', firstStop: true, level: 'none', knownIds: [] } },
  { name: 'Diani Beach', placeId: 'sample-diani', ctx: { placeType: 'beach', activities: ['eating out'], region: 'coast', firstStop: false, level: 'none', knownIds: [] } },
  { name: 'Maasai Mara National Reserve', placeId: 'sample-maasai-mara', ctx: { placeType: 'park', activities: ['game drive'], region: 'rift_valley_mara', firstStop: false, level: 'none', knownIds: [] } },
]

export function PreviewLessonScreen() {
  const [bank, setBank] = useState<BankPhrase[]>([])
  const [selected, setSelected] = useState(0)

  useEffect(() => {
    loadSeedBank().then(setBank)
  }, [])

  const built = useMemo(() => {
    if (bank.length === 0) return null
    const sample = SAMPLES[selected]
    const chosen = pickTemplatePhrases(pickCandidates(bank, sample.ctx), sample.ctx)
    const lesson = buildTemplateLesson({
      placeName: sample.name,
      placeType: sample.ctx.placeType,
      region: sample.ctx.region,
      firstStop: sample.ctx.firstStop,
      phrases: chosen,
    })
    const phrases = chosen.map((c) => bank.find((p) => p.id === c.phrase.id)!)
    return { lesson, phrases }
  }, [bank, selected])

  return (
    <div className="min-h-dvh">
      <TopBar />
      <main className="mx-auto max-w-2xl px-4 pb-28 sm:pb-10">
        <p className="text-sm text-muted px-1 mb-2">Sample lessons. Pick a stop to see how the lesson changes.</p>
        <div className="flex gap-2 flex-wrap mb-5" role="tablist" aria-label="Sample stops">
          {SAMPLES.map((sample, i) => (
            <button
              key={sample.name}
              type="button"
              role="tab"
              aria-selected={i === selected}
              onClick={() => setSelected(i)}
              className={`px-4 min-h-[44px] rounded-pill text-sm font-bold cursor-pointer ${i === selected ? 'bg-primary text-on-primary' : 'bg-surface text-text shadow-soft'}`}
            >
              {sample.name}
            </button>
          ))}
        </div>
        {built ? (
          <LessonPlayer key={selected} googlePlaceId={SAMPLES[selected].placeId} lesson={built.lesson} phrases={built.phrases} pool={bank.filter((p) => p.register !== 'sheng')} generatedBy="template" backTo="/" backLabel="Back to the start" />
        ) : (
          <p className="p-8 text-center text-muted">Opening the sample lesson.</p>
        )}
      </main>
    </div>
  )
}
