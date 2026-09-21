// The speaker button in the top bar that turns sound effects on and off.
// Exists because sound should always be the user's choice. The choice is saved by lib/sounds.
import { useState } from 'react'
import { isSoundOn, playSound, setSoundOn } from '../lib/sounds'

export function SoundToggle() {
  const [on, setOn] = useState(isSoundOn)

  function toggle() {
    const next = !on
    setSoundOn(next)
    setOn(next)
    if (next) playSound('select')
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? 'Turn sound off' : 'Turn sound on'}
      title={on ? 'Sound is on' : 'Sound is off'}
      className="w-10 h-10 rounded-pill hover:bg-tint cursor-pointer text-base"
    >
      <span aria-hidden="true">{on ? '🔊' : '🔇'}</span>
    </button>
  )
}
