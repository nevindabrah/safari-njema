// Turns a Supabase write result into a plain message, or null when the write went through.
// Exists because every write returns { error } and never throws, so without this a failed save looks like a success.
export interface WriteResult {
  error: { message: string; code?: string } | null
}

export function writeProblem(result: WriteResult): string | null {
  if (!result.error) return null
  const text = result.error.message
  if (result.error.code === '42501' || /row-level security/i.test(text)) return 'You are not allowed to change that.'
  if (result.error.code === '23505') return 'That already exists.'
  if (result.error.code === '23514') return 'That value is not allowed.'
  if (/fetch|network|load failed/i.test(text)) return 'Could not reach the server. Your change was not saved.'
  return text
}
