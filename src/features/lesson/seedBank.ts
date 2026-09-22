// Loads the seed phrases into the browser as a phrase bank, with a stable made-up id for each phrase.
// Exists for the two places that build lessons without a server: the sample lesson and test mode.
import type { Phrase } from '../../lib/types'

export type BankPhrase = Phrase & { register: string }

export async function loadSeedBank(): Promise<BankPhrase[]> {
  const module = await import('../../../supabase/seed/phrases.json')
  return module.default.map((p, i) => ({
    id: `00000000-0000-4000-8000-${String(i).padStart(12, '0')}`,
    swahili: p.swahili,
    pronunciation: p.pronunciation,
    english: p.english,
    tags: p.tags,
    register: p.register,
    verified: true,
  }))
}
