// The bar at the bottom of the phrasebook that gathers a reviewer's notes and sends them to the teacher's page, or by email, copy or file.
// Exists so feedback reaches the people who can act on it with no account needed. The teacher's page is the main way; the others need no server.
import { useState } from 'react'
import { Button } from '../../components/Button'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
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
  const [sent, setSent] = useState<'no' | 'sending' | 'yes' | 'failed'>('no')
  const count = countNotes(notes)
  if (count === 0) return sent === 'yes' ? <p role="status" className="fixed z-30 left-4 right-4 bottom-4 mx-auto max-w-3xl bg-surface rounded-card shadow-lift p-4 font-bold text-center">Sent. Asante for your notes.</p> : null
  const message = formatNotes(notes, phrases, reviewer)

  async function copy() {
    try {
      await navigator.clipboard.writeText(message)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  async function sendToTeacher() {
    setSent('sending')
    const rows = phrases.filter((p) => (notes[p.swahili] ?? '').trim() !== '').map((p) => ({ swahili: p.swahili, note: notes[p.swahili].trim().slice(0, 1000), reviewer_name: reviewer.trim() || null }))
    const { error } = await supabase.from('phrase_notes').insert(rows)
    if (error) return setSent('failed')
    setSent('yes')
    onClear()
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
              {isSupabaseConfigured && <Button variant="accent" onClick={sendToTeacher} disabled={sent === 'sending'}>{sent === 'sending' ? 'Sending' : 'Send to the teacher'}</Button>}
              <a href={feedbackMailto('Safari Njema: notes on the Swahili phrases', message)}><Button tabIndex={-1}>Email them</Button></a>
              <Button variant="soft" onClick={copy}>{copied ? 'Copied' : 'Copy them'}</Button>
              <Button variant="soft" onClick={download}>Save as a file</Button>
              <button type="button" onClick={onClear} className="underline text-sm text-muted px-2 min-h-[44px] cursor-pointer">Clear my notes</button>
            </div>
            {sent === 'failed' && <p role="alert" className="text-sm text-accent-text font-bold mt-2">Could not send. Check your connection, or use one of the other ways.</p>}
            {!FEEDBACK_EMAIL && <p className="text-xs text-muted mt-2">The email opens with the address left empty. Send it to Nevin.</p>}
          </div>
        )}
      </div>
    </div>
  )
}
