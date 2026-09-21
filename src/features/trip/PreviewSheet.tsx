// On a phone, holds the place preview card as a sheet that slides over the bottom of the screen, above the tabs.
// Exists because the card does not fit inside the small phone map: its "Add to itinerary" button was cut off.
import { useEffect, type ReactNode } from 'react'

interface PreviewSheetProps {
  onClose: () => void
  children: ReactNode
}

export function PreviewSheet({ onClose, children }: PreviewSheetProps) {
  // While the sheet is open: close on Escape, and stop the page behind from scrolling.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-40 flex items-end" style={{ background: 'color-mix(in srgb, var(--ink) 55%, transparent)' }} onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label="Add this place" onClick={(e) => e.stopPropagation()}
        className="w-full max-h-[88dvh] overflow-y-auto overscroll-contain rounded-t-card" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)', background: 'var(--surface)' }}>
        {children}
      </div>
    </div>
  )
}
