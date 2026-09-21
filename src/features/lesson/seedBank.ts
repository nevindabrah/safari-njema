// Loads the seed phrases into the browser as a phrase bank, with a stable made-up id for each phrase.
// Exists for the two places that build lessons without a server: the sample lesson and test mode.
import type { Phrase } from '../../lib/types'

// The seed rows also carry a register, which the picker uses to leave Sheng out.
export type BankPhrase = Phrase & { register: string }

// Loaded on demand so the seed stays out of the main bundle.
export async function loadSeedBank(): Promise<BankPhrase[]> {
  const module = await import('../../../supabase/seed/phrases.json')
  return module.default.map((p, i) => ({
    id: `00000000-0000-4000-8000-${String(i).padStart(12, '0')}`,
    swahili: p.swahili,
    pronunciation: p.pronunciation,
    english: p.english,
    tags: p.tags,
    register: p.register,
    // The seed phrases have been reviewed by a Swahili teacher.
    verified: true,
  }))
}
