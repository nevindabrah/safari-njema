// Looks up the saved photo for a place, and picks the right size of it.
// Exists so screens ask one question, "is there a photo for this place?", and never touch the JSON or URL rules.
import saved from './placePhotos.json'

export interface PlacePhotoInfo {
  url: string
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
