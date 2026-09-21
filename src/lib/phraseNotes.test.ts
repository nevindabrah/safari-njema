// Tests for turning reviewer notes into a message.
// Exists so a teacher's corrections arrive complete and readable, whatever they typed.
import { describe, expect, it } from 'vitest'
import { countNotes, formatNotes } from './phraseNotes'

const phrases = [
  { swahili: 'Habari?', english: 'How are you?', pronunciation: 'ha-BA-ri' },
  { swahili: 'Nzuri', english: 'Good', pronunciation: 'n-ZU-ri' },
  { swahili: 'Pole', english: 'Sorry', pronunciation: '' },
]

describe('formatNotes', () => {
  it('lists only phrases with a note, in phrasebook order, with what the app shows', () => {
    const text = formatNotes({ Nzuri: 'The recording sounds like "niori".', Pole: '  ', 'Habari?': 'Fine.' }, phrases, 'Prof. K')
    expect(text).toContain('From: Prof. K')
    expect(text).toContain('2 phrases noted')
    expect(text.indexOf('1. Habari?')).toBeLessThan(text.indexOf('2. Nzuri'))
    expect(text).toContain('Shown as: Good')
    expect(text).toContain('Pronunciation guide: n-ZU-ri')
    expect(text).not.toContain('Pole')
  })

  it('keeps a note on one line and says when there is no pronunciation guide', () => {
    const text = formatNotes({ Pole: 'First line\n\nsecond line' }, phrases)
    expect(text).toContain('Note: First line second line')
    expect(text).toContain('Pronunciation guide: none')
    expect(text).toContain('1 phrase noted')
    expect(text).not.toContain('From:')
  })

  it('gives nothing when there are no notes', () => {
    expect(formatNotes({}, phrases)).toBe('')
    expect(formatNotes({ Nzuri: '   ' }, phrases)).toBe('')
  })
})

describe('countNotes', () => {
  it('ignores empty notes', () => {
    expect(countNotes({ a: 'x', b: ' ', c: '' })).toBe(1)
  })
})
