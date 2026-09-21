// Turns the error text Supabase sends back from sign up, log in and password reset into a plain sentence.
// Exists because messages like "email rate limit exceeded" mean nothing to a traveller, and each one has a clear next step.

export function plainAuthMessage(message: string): string {
  const text = message.toLowerCase()
  if (text.includes('invalid login credentials')) return 'That email and password do not match an account.'
  if (text.includes('already registered') || text.includes('already been registered')) return 'That email already has an account. Log in instead.'
  if (text.includes('email not confirmed')) return 'Confirm your email first. Open the link we sent you, then log in.'
  if (text.includes('rate limit') || text.includes('only request this after')) return 'Too many tries in a short time. Wait a few minutes and try again.'
  if (text.includes('not authorized')) return 'We cannot send email to that address yet. Continue with Google instead.'
  if (text.includes('session missing')) return 'This link has expired or was opened on another device. Ask for a new link.'
  if (text.includes('failed to fetch') || text.includes('network')) return 'Could not reach the server. Check your connection and try again.'
  if (text.includes('provider is not enabled')) return 'Google sign in is not switched on yet. Use your email instead.'
  return message
}

// With email confirmation on, Supabase hides whether an email is taken: it answers with a user that has no identities.
export function isExistingAccount(user: { identities?: unknown[] } | null): boolean {
  return !!user && Array.isArray(user.identities) && user.identities.length === 0
}
