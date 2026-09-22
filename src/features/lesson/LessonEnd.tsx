// The end of a lesson: the score, the kanga that was earned, anything worth another look, and where to go next.
// Exists apart from LessonPlayer to keep both files short. The confetti is decoration and is skipped for reduced motion.
import { Link } from 'react-router'
import { Button } from '../../components/Button'
import { Icon } from '../../components/icons'
import { KangaCloth } from '../../components/KangaCloth'
import { ReviewNote } from '../../components/ReviewNote'
import type { Lesson } from '../../lib/lessonSchema'
import type { Phrase } from '../../lib/types'
import type { QuizResult } from './QuizStep'

interface LessonEndProps {
  lesson: Lesson
  studied: Phrase[]
  result: QuizResult
  backTo: string
  backLabel: string
  userLessonId?: string
}

const CONFETTI = Array.from({ length: 12 }, (_, i) => ({ left: 6 + i * 8, delay: (i % 4) * 0.12, colour: ['var(--hero)', 'var(--accent)', 'var(--success)'][i % 3] }))

export function LessonEnd({ lesson, studied, result, backTo, backLabel, userLessonId }: LessonEndProps) {
  const missed = studied.filter((p) => result.missedPhraseIds.includes(p.id))
  return (
    <div className="relative text-center">
      <div className="confetti" aria-hidden="true">
        {CONFETTI.map((piece, i) => <span key={i} style={{ left: `${piece.left}%`, animationDelay: `${piece.delay}s`, background: piece.colour }} />)}
      </div>
      <h2 className="text-4xl mb-2">Safari njema</h2>
      <p className="text-muted">You got {result.correct} of {result.total} right on the first try and met {studied.length} phrases.</p>

      {lesson.kanga && (
        <div className="mt-6 mx-auto max-w-sm">
          <p className="text-xs uppercase tracking-wide font-bold text-muted mb-2">You earned a kanga</p>
          <KangaCloth proverb={lesson.kanga.proverb} className="shadow-lift" />
          <p className="text-muted mt-3">{lesson.kanga.meaning}</p>
        </div>
      )}

      {missed.length > 0 && (
        <div className="mt-6 text-left">
          <p className="text-xs uppercase tracking-wide font-bold text-muted mb-2">Worth another look</p>
          <ul className="flex flex-col gap-2">
            {missed.map((p) => (
              <li key={p.id} className="bg-surface-2 rounded-input px-4 py-2">
                <span lang="sw" className="font-display font-extrabold">{p.swahili}</span>
                <span className="text-muted"> · {p.english}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <Link to={backTo} className="flex-1"><Button full tabIndex={-1}>{backLabel}</Button></Link>
        {userLessonId && <Link to={`/card/${userLessonId}`} className="flex-1"><Button variant="soft" full tabIndex={-1}><Icon name="card" size={18} />Pocket card</Button></Link>}
        {userLessonId && <Link to="/kangas" className="flex-1"><Button variant="soft" full tabIndex={-1}><Icon name="cloth" size={18} />My kangas</Button></Link>}
      </div>
      <ReviewNote />
    </div>
  )
}
