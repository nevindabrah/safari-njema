// The colourways and motifs a kanga can be drawn with, and the rule that picks one for a proverb.
// A kanga's colours are its content, like the colours in a photo, so they live here as data and not as theme tokens.
// Exists so every proverb always gets the same cloth, on any device, without storing anything.

export interface Colourway {
  name: string
  border: string
  borderMotif: string
  field: string
  fieldMotif: string
  strip: string
  stripText: string
}

export const COLOURWAYS: Colourway[] = [
  { name: 'Sun', border: '#15173a', borderMotif: '#ffc83d', field: '#ffc83d', fieldMotif: '#e5386d', strip: '#15173a', stripText: '#ffffff' },
  { name: 'Ocean', border: '#0b4f6c', borderMotif: '#f4f1de', field: '#bfe3ea', fieldMotif: '#0b4f6c', strip: '#0b4f6c', stripText: '#ffffff' },
  { name: 'Hibiscus', border: '#8e1b47', borderMotif: '#ffd9e6', field: '#e5386d', fieldMotif: '#ffd9e6', strip: '#8e1b47', stripText: '#ffffff' },
  { name: 'Savanna', border: '#5b3a1e', borderMotif: '#f2c572', field: '#f2c572', fieldMotif: '#2f6b3c', strip: '#5b3a1e', stripText: '#ffffff' },
  { name: 'Night', border: '#1b1d4d', borderMotif: '#f0b323', field: '#2e3192', fieldMotif: '#f0b323', strip: '#f0b323', stripText: '#1b1d4d' },
  { name: 'Leaf', border: '#1f5f3f', borderMotif: '#fdf0d5', field: '#fdf0d5', fieldMotif: '#e76f51', strip: '#1f5f3f', stripText: '#ffffff' },
]

export const MOTIFS = ['diamonds', 'chevrons', 'dots', 'petals'] as const
export type Motif = (typeof MOTIFS)[number]

export interface KangaDesign {
  colourway: Colourway
  borderMotif: Motif
  fieldMotif: Motif
}

function hash(text: string): number {
  let value = 0
  for (let i = 0; i < text.length; i++) value = (value * 25 + text.charCodeAt(i)) >>> 0
  return value
}

export function kangaDesignFor(proverb: string): KangaDesign {
  const h = hash(proverb)
  const borderMotif = MOTIFS[Math.floor(h / COLOURWAYS.length) % MOTIFS.length]
  const others = MOTIFS.filter((m) => m !== borderMotif)
  return { colourway: COLOURWAYS[h % COLOURWAYS.length], borderMotif, fieldMotif: others[Math.floor(h / 97) % others.length] }
}
