// Reads Google's detailed place types, which the app already stores for every stop, and picks the most specific one from the flavour table.
// Exists so a coffee house, a ferry terminal and a national park get different lessons instead of the same one for their broad kind.
import { FLAVOURS, type PlaceFlavour } from './placeFlavourTable.ts'

export type { PlaceFlavour } from './placeFlavourTable.ts'

export function flavourFor(googleTypes: string[] | null | undefined): PlaceFlavour | null {
  if (!googleTypes || googleTypes.length === 0) return null
  for (const entry of FLAVOURS) {
    if (googleTypes.some((t) => entry.types.includes(t))) return entry.flavour
  }
  return null
}
