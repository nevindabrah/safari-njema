// The footer on the public pages: who built this, where the code is, and the honest note about the phrases.
// Exists so a reviewer can always find the source and the About page.
import { Link } from 'react-router'
import { ReviewNote } from './ReviewNote'

export const GITHUB_URL = 'https://github.com/nevindabrah/safari-njema'

export function Footer() {
  return (
    <footer className="mt-4 pb-6 text-center text-sm text-muted">
      <p>
        Built by Nevin Dabrah.{' '}
        <Link to="/about" className="underline font-bold text-text">About</Link>
        {' · '}
        <Link to="/phrasebook" className="underline font-bold text-text">Phrasebook</Link>
        {' · '}
        <Link to="/privacy" className="underline font-bold text-text">Privacy</Link>
        {' · '}
        <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="underline font-bold text-text">Code on GitHub</a>
      </p>
      <ReviewNote />
    </footer>
  )
}
