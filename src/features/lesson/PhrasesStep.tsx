// Step two: the phrases for this place, with pronunciation and why you would say each one.
// Exists as the listen step: every phrase can be played aloud in a Swahili voice.
import type { Lesson } from '../../lib/lessonSchema'
import type { Phrase } from '../../lib/types'
import { SpeakButton } from '../audio/SpeakButton'

interface PhrasesStepProps {
  phrases: Phrase[]
  lessonPhrases: Lesson['phrases']
}

export function PhrasesStep({ phrases, lessonPhrases }: PhrasesStepProps) {
  const whyById = new Map(lessonPhrases.map((p) => [p.phrase_id, p.why_here]))
  return (
    <ul className="flex flex-col gap-3">
      {phrases.map((phrase) => (
        <li key={phrase.id} className="bg-tint rounded-card p-4">
          <div className="flex items-center gap-3">
            <SpeakButton swahili={phrase.swahili} />
            <p lang="sw" className="font-display font-extrabold text-2xl">{phrase.swahili}</p>
          </div>
          {phrase.pronunciation && <p className="text-sm text-muted mt-1">{phrase.pronunciation}</p>}
          <p className="mt-2 font-bold">{phrase.english}</p>
          {whyById.get(phrase.id) && <p className="text-sm text-muted mt-1">{whyById.get(phrase.id)}</p>}
          {!phrase.verified && <p className="text-[11px] text-muted mt-2">Not yet reviewed by a Swahili teacher</p>}
        </li>
      ))}
    </ul>
  )
}
