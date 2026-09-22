// The footer on the public pages: the way to the About, phrasebook and privacy pages, and the note about the phrases.
// Exists so every public page ends the same way.
import { Link } from 'react-router'
import { ReviewNote } from './ReviewNote'

export function Footer() {
  return (
    <footer className="mt-4 pb-6 text-center text-sm text-muted">
      <p>
        <Link to="/about" className="underline font-bold text-text">About</Link>
        {' \u00b7 '}
        <Link to="/phrasebook" className="underline font-bold text-text">Phrasebook</Link>
        {' \u00b7 '}
        <Link to="/privacy" className="underline font-bold text-text">Privacy</Link>
      </p>
      <ReviewNote />
    </footer>
  )
}
