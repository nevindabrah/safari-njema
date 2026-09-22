// The saved Wikipedia descriptions of the built-in places, looked up by place id.
// Exists so the catalogue never asks Wikipedia at run time, and the text shown was checked once by a person.
import type { WikipediaSummary } from '../../lib/wikipedia'
import summaries from './placeSummaries.json'

const SUMMARIES = summaries as Record<string, WikipediaSummary>

export function summaryFor(googlePlaceId: string): WikipediaSummary | null {
  return SUMMARIES[googlePlaceId] ?? null
}
