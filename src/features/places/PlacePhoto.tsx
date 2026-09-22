// A place's photo, or a tinted tile with the place type icon when there is none or it fails to load.
// Exists so every screen shows places the same way and nothing ever renders a broken image.
import { useState } from 'react'
import { Icon } from '../../components/icons'
import type { PlaceType } from '../../lib/types'
import { PHOTO_SIZES, photoFor, photoSrcSet, photoUrl } from './photoData'

interface PlacePhotoProps {
  googlePlaceId: string
  placeType: PlaceType
  name: string
  size: 'small' | 'large'
  sizes?: string
  className?: string
}

export function PlacePhoto({ googlePlaceId, placeType, name, size, sizes, className = '' }: PlacePhotoProps) {
  const [failed, setFailed] = useState(false)
  const photo = photoFor(googlePlaceId)

  if (!photo || failed) {
    return (
      <div className={`bg-tint text-text flex items-center justify-center ${className}`} aria-hidden="true">
        <Icon name={placeType} size={size === 'small' ? 26 : 56} />
      </div>
    )
  }
  return <img src={photoUrl(photo, size)} srcSet={photoSrcSet(photo)} sizes={sizes ?? (size === 'small' ? PHOTO_SIZES.thumb : PHOTO_SIZES.card)} alt={photo.illustrative ? `A photo that suits ${name}` : name} loading="lazy" onError={() => setFailed(true)} className={`object-cover ${className}`} />
}

export function PhotoCredit({ googlePlaceId, className = '' }: { googlePlaceId: string; className?: string }) {
  const photo = photoFor(googlePlaceId)
  if (!photo) return null
  return (
    <p className={`text-[11px] leading-snug ${className}`}>
      {photo.illustrative ? 'Illustrative photo' : 'Photo'} by {photo.author},{' '}
      <a href={photo.licenceUrl ?? photo.filePage} target="_blank" rel="noreferrer" className="underline">{photo.licence}</a>, via{' '}
      <a href={photo.filePage} target="_blank" rel="noreferrer" className="underline">Wikimedia Commons</a>
    </p>
  )
}
