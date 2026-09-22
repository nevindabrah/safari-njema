// The first screen of a lesson: the learner picks how long they have. Quick, standard or deep.
// Exists because five minutes is not always what someone has. The choice is remembered for next time.
import { Button } from '../../components/Button'
import { LESSON_LENGTHS, type LessonLength } from '../../lib/lessonLength'

interface LengthPickerProps {
  selected: LessonLength
  sizes: Record<LessonLength, { phrases: number; exercises: number }>
  onSelect: (length: LessonLength) => void
  onStart: () => void
}

export function LengthPicker({ selected, sizes, onSelect, onStart }: LengthPickerProps) {
  const lengths = Object.keys(LESSON_LENGTHS) as LessonLength[]
  return (
    <div>
      <h2 className="text-2xl mb-1">How long do you have?</h2>
      <p className="text-muted mb-5">Every length starts with the phrases you need most here.</p>
      <div role="radiogroup" aria-label="Lesson length" className="flex flex-col gap-3">
        {lengths.map((length) => {
          const info = LESSON_LENGTHS[length]
          const active = length === selected
          return (
            <button key={length} type="button" role="radio" aria-checked={active} onClick={() => onSelect(length)}
              className="text-left rounded-card p-4 cursor-pointer flex items-center gap-4"
              style={{ background: active ? 'var(--primary)' : 'var(--tint)', color: active ? 'var(--on-primary)' : 'var(--text)' }}>
              <span className="font-display font-extrabold text-2xl w-16 shrink-0">{info.minutes} min</span>
              <span className="flex-1">
                <span className="block font-bold">{info.label}</span>
                <span className="block text-sm opacity-80">{info.blurb}</span>
                <span className="block text-xs opacity-70 mt-1">{sizes[length].phrases} phrases · {sizes[length].exercises} exercises</span>
              </span>
            </button>
          )
        })}
      </div>
      <Button variant="accent" full className="mt-6" onClick={onStart}>Start the lesson</Button>
    </div>
  )
}
