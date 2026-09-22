// Looks up the saved photo for a place, and gives the browser its three sizes so each screen loads the sharpest one it needs.
// Exists so screens ask one question, "is there a photo for this place?", and never touch the JSON or URL rules.
import saved from './placePhotos.json'

export interface PlacePhotoInfo {
  url: string
  medium: string
  small: string
  source: string
  width: number
  height: number
  author: string
  licence: string
  licenceUrl: string | null
  filePage: string
  article: string | null
  illustrative: boolean
  smallWidth?: number
  largeWidth?: number
}

const PHOTOS = saved as Record<string, PlacePhotoInfo>

export function photoFor(googlePlaceId: string): PlacePhotoInfo | null {
  return PHOTOS[googlePlaceId] ?? null
}

export function allPhotos(): Array<[string, PlacePhotoInfo]> {
  return Object.entries(PHOTOS)
}

export function photoUrl(photo: PlacePhotoInfo, size: 'small' | 'large'): string {
  return size === 'small' ? photo.small : photo.url
}

export function photoSrcSet(photo: PlacePhotoInfo): string {
  return `${photo.small} ${photo.smallWidth ?? 480}w, ${photo.medium} 960w, ${photo.url} ${photo.largeWidth ?? 1600}w`
}

export const PHOTO_SIZES = {
  thumb: '(min-width: 640px) 120px, 96px',
  card: '(min-width: 1024px) 40vw, 100vw',
  hero: '(min-width: 640px) 42rem, 100vw',
} as const
