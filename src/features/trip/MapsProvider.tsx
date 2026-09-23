// Loads the Google Maps script around the trip screen when a key exists, and does nothing without one. A value that is blank or only spaces counts as no key.
// Exists so the map, the search box and the catalogue can all ask Google from one loaded library, and so a half filled setting fails as no map rather than a broken one.
import type { ReactNode } from 'react'
import { APIProvider } from '@vis.gl/react-google-maps'

export const mapsKey = (import.meta.env.VITE_GOOGLE_MAPS_KEY as string | undefined)?.trim() || undefined

export const mapId = (import.meta.env.VITE_GOOGLE_MAP_ID as string | undefined)?.trim() || undefined

export function MapsProvider({ children }: { children: ReactNode }) {
  if (!mapsKey) return <>{children}</>
  return <APIProvider apiKey={mapsKey} libraries={['places']}>{children}</APIProvider>
}
