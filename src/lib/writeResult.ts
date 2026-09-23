// Turns a Supabase write result into a plain message, or null when the write went through.
// Exists because every write returns { error } and never throws, and a delete the database refuses matches no rows and reports no error at all, so without this a refused change looks like a success.
export interface WriteResult {
  error: { message: string; code?: string } | null
}

export interface DeleteResult extends WriteResult {
  data: unknown[] | null
}

export function deleteProblem(result: DeleteResult, refusal: string): string | null {
  const problem = writeProblem(result)
  if (problem) return problem
  return (result.data?.length ?? 0) === 0 ? refusal : null
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
