// Step one of the lesson: what this place is, three things to know, etiquette and a practical note.
// Exists as the orientation part of every lesson.
import type { Lesson } from '../../lib/lessonSchema'

export function BriefStep({ brief }: { brief: Lesson['brief'] }) {
  return (
    <div className="flex flex-col gap-5">
      <p className="text-lg leading-relaxed">{brief.what_it_is}</p>
      <div>
        <h3 className="text-xl mb-2">Things to know today</h3>
        <ul className="flex flex-col gap-2">
          {brief.know_today.map((item, i) => (
            <li key={i} className="flex gap-3 bg-tint rounded-input px-4 py-3">
              <span className="font-display font-extrabold text-accent-text">{i + 1}</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="bg-surface-2 rounded-input p-4">
          <p className="text-xs uppercase tracking-wide font-bold text-muted mb-1">Etiquette</p>
          <p>{brief.etiquette}</p>
        </div>
        <div className="bg-surface-2 rounded-input p-4">
          <p className="text-xs uppercase tracking-wide font-bold text-muted mb-1">Practical</p>
          <p>{brief.practical}</p>
        </div>
      </div>
      <p className="text-xs text-muted">Details change. Check locally.</p>
    </div>
  )
}
