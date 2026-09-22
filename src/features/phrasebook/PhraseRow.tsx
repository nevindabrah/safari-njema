// One phrase in the phrasebook: its Swahili, pronunciation guide, English, recording, and a place to leave a note.
// Exists so a Swahili speaker can check each phrase by eye and by ear, and say what should change.
import { useState } from 'react'
import { Icon } from '../../components/icons'
import { AudioComingSoon } from '../audio/ComingSoon'
import { playClip } from '../audio/audio'
import type { BookPhrase } from './usePhrasebook'

interface PhraseRowProps {
  phrase: BookPhrase
  note: string
  onNote: (note: string) => void
}

export function PhraseRow({ phrase, note, onNote }: PhraseRowProps) {
  const [open, setOpen] = useState(note.trim() !== '')
  const noteId = `note-${phrase.swahili.replace(/\W+/g, '-')}`

  return (
    <li className="py-4 border-t" style={{ borderColor: 'var(--line)' }}>
      <div className="flex items-start gap-3">
        {phrase.clip && !phrase.held ? (
          <button type="button" onClick={() => playClip(phrase.clip!)} aria-label={`Listen to ${phrase.swahili}`} title="Listen"
            className="shrink-0 w-11 h-11 rounded-pill flex items-center justify-center cursor-pointer active:translate-y-[2px] transition-transform" style={{ background: 'var(--hero)', color: 'var(--on-hero)' }}>
            <Icon name="sound" size={20} />
          </button>
        ) : <span className="w-11 shrink-0" />}
        <div className="flex-1 min-w-0">
          <p lang="sw" className="font-display font-extrabold text-xl leading-tight">{phrase.swahili}</p>
          <p className="text-sm font-bold text-accent-text">{phrase.pronunciation}</p>
          <p className="text-muted">{phrase.english}</p>
          {phrase.unsure && (
            <p className="text-xs mt-1 rounded-input inline-block px-2 py-1 bg-tint">
              This recording is used in lessons, but a speech recogniser was not fully sure of it. Does it sound right to you?
            </p>
          )}
          {phrase.held && <AudioComingSoon className="mt-1" />}
        </div>
        <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls={noteId}
          className="shrink-0 text-sm font-bold underline min-h-[44px] px-1 cursor-pointer text-muted">
          {note.trim() ? 'Edit note' : 'Add a note'}
        </button>
      </div>
      {open && (
        <div id={noteId} className="mt-3 sm:ml-14">
          <label className="sr-only" htmlFor={`${noteId}-box`}>Your note on {phrase.swahili}</label>
          <textarea id={`${noteId}-box`} value={note} onChange={(e) => onNote(e.target.value.slice(0, 1000))} rows={2} maxLength={1000}
            placeholder="A correction, a better way to say it, a comment on the recording"
            className="w-full rounded-input field text-text placeholder:text-muted p-3" />
          {note.length > 800 && <p className="text-xs text-muted mt-1 text-right">{1000 - note.length} characters left</p>}
        </div>
      )}
    </li>
  )
}
