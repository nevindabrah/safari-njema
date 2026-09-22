// Where feedback goes. The address comes from an environment value, so it is not written into a public repository.
// Exists so every "send feedback" link agrees. With no address set, the email opens with the To line left empty.
export const FEEDBACK_EMAIL = (import.meta.env.VITE_FEEDBACK_EMAIL as string | undefined) ?? ''

export const GITHUB_ISSUES_URL = 'https://github.com/nevindabrah/safari-njema/issues/new'

export function feedbackMailto(subject: string, body: string): string {
  const trimmed = body.length > 1800 ? body.slice(0, 1800) + '\n\n(The rest was too long for an email link. Use Copy instead and paste it in.)' : body
  return `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(trimmed)}`
}
