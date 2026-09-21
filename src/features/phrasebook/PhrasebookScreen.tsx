// The phrasebook: every phrase the app can teach, grouped as in v1, each with its recording and a place for a note.
// Exists for two readers: a learner who wants to browse, and a Swahili speaker who wants to check the content and send corrections.
import { useState } from 'react'
import { TopBar } from '../../components/TopBar'
import { Footer } from '../../components/Footer'
import { countNotes } from '../../lib/phraseNotes'
import { usePhrasebook } from './usePhrasebook'
import { PhraseRow } from './PhraseRow'
import { NotesBar } from './NotesBar'

export function PhrasebookScreen() {
  const { phrases, notes, reviewer, saveNote, saveReviewer, clearNotes } = usePhrasebook()
  const [query, setQuery] = useState('')
  const [heldOnly, setHeldOnly] = useState(false)

  const q = query.trim().toLowerCase()
  const shown = phrases.filter((p) => (!heldOnly || p.held) && (q === '' || `${p.swahili} ${p.english}`.toLowerCase().includes(q)))
  const chapters = [...new Set(shown.map((p) => p.chapter))]
  const heldCount = phrases.filter((p) => p.held).length

  return (
    <div className="min-h-dvh">
      <TopBar />
      <main className={`mx-auto max-w-3xl px-4 pt-4 ${countNotes(notes) > 0 ? 'pb-44' : 'pb-28 sm:pb-10'}`}>
        <h1 className="text-4xl sm:text-5xl">Phrasebook</h1>
        <p className="text-muted mt-2">
          All {phrases.length || 95} phrases Safari Njema can teach, with the pronunciation guide and the recording learners hear. They have been reviewed by a Swahili teacher.
        </p>
        <div className="mt-4 rounded-card bg-tint p-4 text-sm">
          <p className="font-bold">Do you speak Swahili? Your ear is the best test.</p>
          <p className="mt-1">Tap the speaker to hear a phrase. If a phrase, a meaning or a recording is off, press "Add a note" beside it. Your notes stay on this device until you press "Send my notes" at the bottom.</p>
        </div>

        <div className="mt-5 flex flex-wrap gap-2 items-center">
          <label className="sr-only" htmlFor="book-search">Search the phrasebook</label>
          <input id="book-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search Swahili or English"
            className="flex-1 min-w-[12rem] min-h-[48px] px-5 rounded-pill bg-surface shadow-soft" />
          {heldCount > 0 && (
            <button type="button" aria-pressed={heldOnly} onClick={() => setHeldOnly(!heldOnly)}
              className={`px-4 min-h-[48px] rounded-pill text-sm font-bold cursor-pointer ${heldOnly ? 'bg-primary text-on-primary' : 'bg-surface shadow-soft'}`}>
              {heldCount} recordings to check
            </button>
          )}
        </div>

        {chapters.map((chapter) => (
          <section key={chapter} className="mt-8">
            <h2 className="text-2xl mb-1">{chapter}</h2>
            <ul>
              {shown.filter((p) => p.chapter === chapter).map((phrase) => (
                <PhraseRow key={phrase.swahili} phrase={phrase} note={notes[phrase.swahili] ?? ''} onNote={(note) => saveNote(phrase.swahili, note)} />
              ))}
            </ul>
          </section>
        ))}
        {phrases.length > 0 && shown.length === 0 && <p className="mt-8 text-muted">Nothing matches that search.</p>}
        <Footer />
      </main>
      <NotesBar notes={notes} phrases={phrases} reviewer={reviewer} onReviewer={saveReviewer} onClear={clearNotes} />
    </div>
  )
}
