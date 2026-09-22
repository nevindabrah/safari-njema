// The teacher's page: every note readers left on a phrase, newest first, grouped by phrase, with a way to mark each one handled.
// Exists so corrections from the phrasebook land in one list instead of an inbox. Only a profile marked is_teacher can read them.
import { useState } from 'react'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { TopBar } from '../../components/TopBar'
import { LeaveButton } from '../../components/LeaveButton'
import { ConfirmButton } from '../../components/ConfirmButton'
import { useProfile } from '../auth/useProfile'
import { useTeacherNotes, type PhraseNote } from './useTeacherNotes'

function when(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export function TeacherScreen() {
  const { profile, loading: profileLoading } = useProfile()
  const isTeacher = profile?.is_teacher === true
  const { notes, loading, setHandled, remove } = useTeacherNotes(isTeacher)
  const [showHandled, setShowHandled] = useState(false)
  const shown = notes.filter((n) => showHandled || !n.handled_at)
  const byPhrase = new Map<string, PhraseNote[]>()
  for (const note of shown) byPhrase.set(note.swahili, [...(byPhrase.get(note.swahili) ?? []), note])
  const open = notes.filter((n) => !n.handled_at).length

  return (
    <div className="min-h-dvh">
      <TopBar />
      <main className="mx-auto max-w-2xl px-4 pt-4 pb-28 sm:pb-10">
        <LeaveButton kind="back" label="Back to my trip" to="/trip" showLabel className="mb-3" />
        <h1 className="text-4xl sm:text-5xl mb-2">Notes from readers</h1>
        {profileLoading ? <p className="text-muted">One moment.</p> : !isTeacher ? (
          <Card><p>This page is for the Swahili teacher. If that is you, ask Nevin to mark your account.</p></Card>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <p className="text-muted">{open === 0 ? 'Nothing waiting. Every note has been handled.' : `${open} note${open === 1 ? '' : 's'} waiting.`}</p>
              <button type="button" onClick={() => setShowHandled(!showHandled)} aria-pressed={showHandled} className={`min-h-[40px] px-4 rounded-pill text-sm font-bold cursor-pointer ${showHandled ? 'bg-primary text-on-primary' : 'bg-tint'}`}>{showHandled ? 'Hiding nothing' : 'Show handled too'}</button>
            </div>
            {loading && <p className="text-muted">Loading.</p>}
            {[...byPhrase.entries()].map(([swahili, group]) => (
              <Card key={swahili} className="mb-4">
                <h2 lang="sw" className="text-2xl mb-3">{swahili}</h2>
                <ul className="flex flex-col gap-3">
                  {group.map((n) => (
                    <li key={n.id} className={`rounded-input p-3 ${n.handled_at ? 'bg-surface-2 opacity-70' : 'bg-tint'}`}>
                      <p className="whitespace-pre-wrap">{n.note}</p>
                      <p className="text-xs text-muted mt-2">{n.reviewer_name ? `${n.reviewer_name}, ` : ''}{when(n.created_at)}{n.handled_at ? `. Handled ${when(n.handled_at)}` : ''}</p>
                      <div className="flex gap-2 mt-3">
                        <Button variant={n.handled_at ? 'soft' : 'primary'} className="!min-h-[40px] !px-3 text-sm" onClick={() => setHandled(n.id, !n.handled_at)}>{n.handled_at ? 'Reopen' : 'Mark handled'}</Button>
                        <ConfirmButton question="Remove this note for good?" confirmLabel="Remove" onConfirm={() => remove(n.id)} className="!min-h-[40px] !px-3 text-sm">Remove</ConfirmButton>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </>
        )}
      </main>
    </div>
  )
}
