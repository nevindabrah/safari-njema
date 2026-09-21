// Draws a kanga: a patterned border, a patterned field, and the strip that carries the proverb, which every kanga has.
// Exists to give finished lessons something made of the culture the product is about, not a generic badge.
import { useId } from 'react'
import { kangaDesignFor, type Motif } from '../lib/kangaDesigns'

// One repeat of each motif, drawn in a 20 by 20 tile.
function MotifTile({ motif, colour }: { motif: Motif; colour: string }) {
  if (motif === 'diamonds') return <path d="M10 2.5 17.5 10 10 17.5 2.5 10Z" fill={colour} />
  if (motif === 'chevrons') return <path d="M1 14 10 5l9 9M1 20l9-9 9 9" fill="none" stroke={colour} strokeWidth="2.4" strokeLinejoin="round" />
  if (motif === 'dots') return <><circle cx="10" cy="10" r="3.6" fill={colour} /><circle cx="0" cy="0" r="1.6" fill={colour} /><circle cx="20" cy="0" r="1.6" fill={colour} /><circle cx="0" cy="20" r="1.6" fill={colour} /><circle cx="20" cy="20" r="1.6" fill={colour} /></>
  return <>{[0, 90, 180, 270].map((turn) => <path key={turn} d="M10 1.5c2.8 2.6 2.8 5.4 0 8-2.8-2.6-2.8-5.4 0-8Z" fill={colour} transform={`rotate(${turn} 10 10)`} />)}</>
}

interface KangaClothProps {
  proverb: string
  className?: string
  // A kanga that has not been earned yet keeps its proverb hidden.
  veiled?: boolean
}

export function KangaCloth({ proverb, className = '', veiled = false }: KangaClothProps) {
  const id = useId()
  const { colourway, borderMotif, fieldMotif } = kangaDesignFor(proverb)
  // Long proverbs get smaller letters so they always fit the strip.
  const fontSize = Math.min(13, 250 / (proverb.length * 0.66))

  return (
    <svg viewBox="0 0 300 200" className={className} role="img" aria-label={veiled ? 'A kanga cloth you have not earned yet' : `A kanga cloth with the proverb ${proverb}`} style={{ borderRadius: 10, display: 'block', width: '100%' }}>
      <defs>
        <pattern id={`${id}-border`} width="20" height="20" patternUnits="userSpaceOnUse"><MotifTile motif={borderMotif} colour={colourway.borderMotif} /></pattern>
        <pattern id={`${id}-field`} width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="translate(30 30) scale(0.8)"><MotifTile motif={fieldMotif} colour={colourway.fieldMotif} /></pattern>
      </defs>
      <rect width="300" height="200" fill={colourway.border} />
      <rect width="300" height="200" fill={`url(#${id}-border)`} />
      <rect x="26" y="26" width="248" height="148" fill={colourway.border} />
      <rect x="30" y="30" width="240" height="140" fill={colourway.field} />
      <rect x="30" y="30" width="240" height="140" fill={`url(#${id}-field)`} opacity="0.55" />
      <ellipse cx="150" cy="84" rx="52" ry="34" fill={colourway.border} />
      <ellipse cx="150" cy="84" rx="44" ry="27" fill={colourway.field} />
      {/* The central motif, the part of a kanga called the mji: the field's motif, drawn once and large. */}
      <g transform="translate(124 58) scale(2.6)"><MotifTile motif={fieldMotif === 'chevrons' ? 'petals' : fieldMotif} colour={colourway.border} /></g>
      <rect x="30" y="132" width="240" height="26" fill={colourway.strip} />
      {!veiled && <text lang="sw" x="150" y="145.5" textAnchor="middle" dominantBaseline="middle" fontSize={fontSize} fontWeight="800" letterSpacing="0.06em" fill={colourway.stripText} style={{ fontFamily: 'var(--font-display)' }}>
        {proverb.toUpperCase()}
      </text>}
    </svg>
  )
}
