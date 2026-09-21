// The Safari Njema mark and name. Pressing it always goes to the home screen.
// Exists so every screen has the same, obvious way home in its top left corner.
import { Link } from 'react-router'

// The same drawing as public/favicon.svg, in the kanga colours: a sun block, an ink centre and four pink corner dots.
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true" className="shrink-0">
      <rect width="64" height="64" rx="18" fill="var(--marigold)" />
      <circle cx="32" cy="32" r="10" fill="var(--ink)" />
      {[[14, 14], [50, 14], [14, 50], [50, 50]].map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="4" fill="var(--hibiscus)" />)}
    </svg>
  )
}

export function Logo() {
  return (
    <Link to="/" aria-label="Safari Njema, go to the home screen" className="flex items-center gap-2 min-h-[44px] min-w-[44px] font-display font-extrabold text-lg sm:text-xl tracking-tight whitespace-nowrap">
      <LogoMark />
      {/* The narrowest phones keep the mark and drop the words, so the controls beside it still fit. */}
      <span className="hidden min-[350px]:inline">Safari Njema</span>
    </Link>
  )
}
