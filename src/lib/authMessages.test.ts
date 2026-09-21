// Tests for the plain sentences shown when sign up, log in or password reset fails.
// Exists so a change in wording never drops one of the cases friends are most likely to hit.
import { describe, expect, it } from 'vitest'
import { isExistingAccount, plainAuthMessage } from './authMessages'

describe('plainAuthMessage', () => {
  it('explains a wrong password without saying which half was wrong', () => {
    expect(plainAuthMessage('Invalid login credentials')).toBe('That email and password do not match an account.')
  })

  it('points an existing user to log in', () => {
    expect(plainAuthMessage('User already registered')).toContain('Log in instead')
  })

  it('explains the hourly email limit and the wait between requests', () => {
    expect(plainAuthMessage('email rate limit exceeded')).toContain('Wait a few minutes')
    expect(plainAuthMessage('For security purposes, you can only request this after 42 seconds.')).toContain('Wait a few minutes')
  })

  it('offers Google when the project cannot email that address', () => {
    expect(plainAuthMessage('Email address "a@b.com" cannot be used as it is not authorized')).toContain('Continue with Google')
  })

  it('explains an expired reset link and a dropped connection', () => {
    expect(plainAuthMessage('Auth session missing!')).toContain('Ask for a new link')
    expect(plainAuthMessage('TypeError: Failed to fetch')).toContain('Check your connection')
  })

  it('passes through anything it does not know, so nothing is hidden', () => {
    expect(plainAuthMessage('Password should be at least 6 characters')).toBe('Password should be at least 6 characters')
  })

  it('never uses an exclamation mark', () => {
    for (const message of ['Invalid login credentials', 'User already registered', 'Email not confirmed', 'email rate limit exceeded', 'not authorized', 'Auth session missing!', 'Failed to fetch', 'provider is not enabled']) {
      expect(plainAuthMessage(message)).not.toContain('!')
    }
  })
})

describe('isExistingAccount', () => {
  it('spots the empty identities list Supabase returns for an email that is already taken', () => {
    expect(isExistingAccount({ identities: [] })).toBe(true)
    expect(isExistingAccount({ identities: [{}] })).toBe(false)
    expect(isExistingAccount(null)).toBe(false)
  })
})
