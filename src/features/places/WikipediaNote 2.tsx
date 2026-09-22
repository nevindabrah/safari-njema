// Two sentences about a place from Wikipedia or Wikivoyage with the small credit their licence asks for, or a general note about this kind of place when neither has it.
// Exists so a learner always knows what the place is before the phrases, without an AI key writing it.
import type { WikipediaSummary } from '../../lib/wikipedia'

interface WikipediaNoteProps {
  summary: WikipediaSummary | null | undefined
  fallback?: string
  className?: string
}

export function WikipediaNote({ summary, fallback, className = '' }: WikipediaNoteProps) {
  if (summary === undefined) return null
  if (summary === null && !fallback) return null
  return (
    <div className={className}>
      <p className="leading-relaxed">{summary ? summary.extract : fallback}</p>
      {summary ? (
        <p className="text-[10px] leading-snug text-muted mt-1">
          From <a href={summary.url} target="_blank" rel="noreferrer" className="underline">{summary.source === 'wikivoyage' ? 'Wikivoyage' : 'Wikipedia'}</a>,{' '}
          <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer" className="underline">CC BY-SA 4.0</a>
        </p>
      ) : (
        <p className="text-[10px] leading-snug text-muted mt-1">A general note. Neither Wikipedia nor Wikivoyage describes this exact place.</p>
      )}
    </div>
  )
}
