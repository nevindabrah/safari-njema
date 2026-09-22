// Tests for the username rules.
// Exists because the same rule lives in the database as a check constraint, and the two must never disagree.
import { describe, expect, it } from 'vitest'
import { isEmail, normaliseUsername, suggestUsername, usernameProblem } from './username'

describe('normaliseUsername', () => {
  it('lower cases, drops spaces and symbols, and caps at 20', () => {
    expect(normaliseUsername(' Nevin Dabrah! ')).toBe('nevindabrah')
    expect(normaliseUsername('a'.repeat(30))).toBe('a'.repeat(20))
    expect(normaliseUsername('amina_k9')).toBe('amina_k9')
  })
})

describe('usernameProblem', () => {
  it('accepts a good name and explains a bad one', () => {
    expect(usernameProblem('amina_k9')).toBeNull()
    expect(usernameProblem('ab')).toBe('At least 3 characters.')
    expect(usernameProblem('a'.repeat(21))).toBe('At most 20 characters.')
    expect(usernameProblem('Amina')).toBe('Only lower case letters, numbers and underscores.')
  })
})

describe('isEmail and suggestUsername', () => {
  it('tells an email from a username by the @', () => {
    expect(isEmail('amina@example.com')).toBe(true)
    expect(isEmail('amina_k9')).toBe(false)
  })

  it('suggests from the display name first, then from the email', () => {
    expect(suggestUsername('a@b.com', 'Amina Kamau')).toBe('amina_kamau')
    expect(suggestUsername('amina.k@example.com', null)).toBe('aminak')
    expect(suggestUsername('a@b.com', 'Li')).toBe('a')
  })
})
