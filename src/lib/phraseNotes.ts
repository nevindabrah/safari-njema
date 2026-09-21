// Turns a reviewer's notes on phrases into one plain text message that can be emailed, copied or saved.
// Exists so feedback from a Swahili teacher reaches Nevin in a form he can act on, with no server and no account.

export interface NotedPhrase {
  swahili: string
  english: string
  pronunciation: string
}

// notes maps a phrase's Swahili text to what the reviewer wrote about it. Empty notes are left out.
export function formatNotes(notes: Record<string, string>, phrases: NotedPhrase[], reviewer = ''): string {
  const noted = phrases.filter((p) => (notes[p.swahili] ?? '').trim() !== '')
  if (noted.length === 0) return ''
  const lines = ['Safari Njema: notes on the Swahili phrases', reviewer.trim() ? `From: ${reviewer.trim()}` : '', `${noted.length} phrase${noted.length === 1 ? '' : 's'} noted`, '']
  noted.forEach((p, i) => {
    lines.push(`${i + 1}. ${p.swahili}`, `   Shown as: ${p.english}`, `   Pronunciation guide: ${p.pronunciation || 'none'}`, `   Note: ${notes[p.swahili].trim().replace(/\s*\n\s*/g, ' ')}`, '')
  })
  return lines.filter((line, i) => !(line === '' && lines[i - 1] === '')).join('\n').trim() + '\n'
}

export function countNotes(notes: Record<string, string>): number {
  return Object.values(notes).filter((n) => n.trim() !== '').length
}
