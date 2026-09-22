// Two sentences about a place from Wikipedia, with the small credit its licence asks for.
// Exists so a learner knows what the place is before the phrases, without an AI key writing it.
import type { WikipediaSummary } from '../../lib/wikipedia'

export function WikipediaNote({ summary, className = '' }: { summary: WikipediaSummary | null; className?: string }) {
  if (!summary) return null
  return (
    <div className={className}>
      <p className="leading-relaxed">{summary.extract}</p>
      <p className="text-[10px] leading-snug text-muted mt-1">
        From <a href={summary.url} target="_blank" rel="noreferrer" className="underline">Wikipedia</a>,{' '}
        <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer" className="underline">CC BY-SA 4.0</a>
      </p>
    </div>
  )
}
