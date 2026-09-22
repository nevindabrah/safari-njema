// Looks up the saved photo for a dish, with its three sizes and its credit.
// Exists so the food page asks one question, "is there a photo for this dish?", the same way places do.
import saved from './dishPhotos.json'

export interface DishPhotoInfo {
  url: string
  medium: string
  small: string
  author: string
  licence: string
  licenceUrl: string | null
  filePage: string
}

const PHOTOS = saved as Record<string, DishPhotoInfo>

export function dishPhotoFor(id: string): DishPhotoInfo | null {
  return PHOTOS[id] ?? null
}

export function dishSrcSet(photo: DishPhotoInfo): string {
  return `${photo.small} 480w, ${photo.medium} 960w, ${photo.url} 1600w`
}
