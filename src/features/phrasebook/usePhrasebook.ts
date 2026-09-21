// Loads every phrase with its recording, and keeps a reviewer's notes in this browser until they send them.
// Exists so the phrasebook screen only draws. It reads the seed and the audio report, so it works with no account.
import { useEffect, useState } from 'react'

export interface BookPhrase {
  swahili: string
  pronunciation: string
  english: string
  chapter: string
  // The recording's address, and whether it was held back from lessons because a speech recogniser could not understand it.
  clip: string | null
  held: boolean
  // In lessons, but the recogniser was not fully sure of it. Worth a human ear.
  unsure: boolean
}

const NOTES_KEY = 'safari-njema-phrase-notes'
const NAME_KEY = 'safari-njema-reviewer-name'

function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function usePhrasebook() {
  const [phrases, setPhrases] = useState<BookPhrase[]>([])
  const [notes, setNotes] = useState<Record<string, string>>(() => readStored(NOTES_KEY, {}))
  const [reviewer, setReviewer] = useState<string>(() => readStored(NAME_KEY, ''))

  // Both files are loaded only on this page, to keep them out of the main bundle.
  useEffect(() => {
    Promise.all([import('../../../supabase/seed/phrases.json'), import('../../../docs/audio-report.json')]).then(([seed, report]) => {
      const clips = new Map(report.default.map((r) => [r.swahili, r]))
      setPhrases(seed.default.map((p) => {
        const clip = clips.get(p.swahili)
        return {
          swahili: p.swahili,
          pronunciation: p.pronunciation,
          english: p.english,
          // The source reads "v1 chapter salamu: Greetings first". The part after the colon is the chapter's name.
          chapter: p.source.split(': ')[1] ?? 'Other',
          clip: clip ? `/audio/${clip.file}` : null,
          held: clip ? !clip.shipped : false,
          unsure: clip ? clip.shipped && clip.score < 0.9 : false,
        }
      }))
    })
  }, [])

  function saveNote(swahili: string, note: string) {
    setNotes((current) => {
      const next = { ...current, [swahili]: note }
      try { localStorage.setItem(NOTES_KEY, JSON.stringify(next)) } catch { /* the note then lasts for this visit */ }
      return next
    })
  }

  function saveReviewer(name: string) {
    setReviewer(name)
    try { localStorage.setItem(NAME_KEY, JSON.stringify(name)) } catch { /* as above */ }
  }

  function clearNotes() {
    setNotes({})
    try { localStorage.removeItem(NOTES_KEY) } catch { /* nothing to clear */ }
  }

  return { phrases, notes, reviewer, saveNote, saveReviewer, clearNotes }
}
