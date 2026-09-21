// The bar at the bottom of the phrasebook that gathers a reviewer's notes and sends them: by email, by copying, or as a file.
// Exists so feedback reaches Nevin with no account and no server. Three ways, because not everyone's device opens email links.
import { useState } from 'react'
import { Button } from '../../components/Button'
import { FEEDBACK_EMAIL, feedbackMailto } from '../../lib/contact'
import { countNotes, formatNotes, type NotedPhrase } from '../../lib/phraseNotes'

interface NotesBarProps {
  notes: Record<string, string>
  phrases: NotedPhrase[]
  reviewer: string
  onReviewer: (name: string) => void
  onClear: () => void
}

export function NotesBar({ notes, phrases, reviewer, onReviewer, onClear }: NotesBarProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const count = countNotes(notes)
  if (count === 0) return null
  const message = formatNotes(notes, phrases, reviewer)

  async function copy() {
    try {
      await navigator.clipboard.writeText(message)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  function download() {
    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([message], { type: 'text/plain' }))
    link.download = 'safari-njema-phrase-notes.txt'
    link.click()
    URL.revokeObjectURL(link.href)
  }

  return (
    <div className="no-print fixed z-30 left-0 right-0 bottom-0 px-4 pb-4" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}>
      <div className="mx-auto max-w-3xl bg-surface rounded-card shadow-lift p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="font-bold text-sm sm:text-base">{count} note{count === 1 ? '' : 's'} saved on this device</p>
          <Button variant="accent" className="whitespace-nowrap shrink-0" onClick={() => setOpen(!open)} aria-expanded={open}>{open ? 'Close' : 'Send my notes'}</Button>
        </div>
        {open && (
          <div className="mt-4">
            <label className="flex flex-col gap-1 text-sm font-bold mb-3">
              Your name, if you would like it included
              <input value={reviewer} onChange={(e) => onReviewer(e.target.value)} className="min-h-[44px] px-4 rounded-input field font-normal" />
            </label>
            <pre className="text-xs bg-surface-2 rounded-input p-3 max-h-40 overflow-auto whitespace-pre-wrap">{message}</pre>
            <div className="mt-3 flex flex-wrap gap-2">
              <a href={feedbackMailto('Safari Njema: notes on the Swahili phrases', message)}><Button tabIndex={-1}>Email them</Button></a>
              <Button variant="soft" onClick={copy}>{copied ? 'Copied' : 'Copy them'}</Button>
              <Button variant="soft" onClick={download}>Save as a file</Button>
              <button type="button" onClick={onClear} className="underline text-sm text-muted px-2 min-h-[44px] cursor-pointer">Clear my notes</button>
            </div>
            {!FEEDBACK_EMAIL && <p className="text-xs text-muted mt-2">The email opens with the address left empty. Send it to Nevin.</p>}
          </div>
        )}
      </div>
    </div>
  )
}
