// Rules for usernames: what counts as one, how typed text is tidied into one, and how to tell a username from an email.
// Exists so the sign up form, the account page and the log in screen all agree, and so the rules match the database check.

export const USERNAME_RULE = /^[a-z0-9_]{3,20}$/

export function normaliseUsername(typed: string): string {
  return typed.trim().toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20)
}

export function usernameProblem(username: string): string | null {
  if (username.length < 3) return 'At least 3 characters.'
  if (username.length > 20) return 'At most 20 characters.'
  if (!USERNAME_RULE.test(username)) return 'Only lower case letters, numbers and underscores.'
  return null
}

export function isEmail(text: string): boolean {
  return text.includes('@')
}

export function suggestUsername(email: string | undefined, displayName: string | null | undefined): string {
  const fromName = normaliseUsername((displayName ?? '').replace(/\s+/g, '_'))
  if (fromName.length >= 3) return fromName
  return normaliseUsername((email ?? '').split('@')[0])
}
