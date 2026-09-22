// A button that asks "Are you sure?" before doing something that cannot be undone.
// Exists so removing a stop, a friend or a trip member is never one accidental tap.
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Button } from './Button'

interface ConfirmButtonProps {
  question: string
  confirmLabel: string
  onConfirm: () => void
  children: ReactNode
  variant?: 'soft' | 'accent'
  className?: string
  ariaLabel?: string
  icon?: boolean
}

export function ConfirmButton({ question, confirmLabel, onConfirm, children, variant = 'soft', className = '', ariaLabel, icon = false }: ConfirmButtonProps) {
  const [asking, setAsking] = useState(false)
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!asking) return
    const away = (event: MouseEvent) => { if (!box.current?.contains(event.target as Node)) setAsking(false) }
    const key = (event: KeyboardEvent) => { if (event.key === 'Escape') setAsking(false) }
    document.addEventListener('mousedown', away)
    document.addEventListener('keydown', key)
    return () => {
      document.removeEventListener('mousedown', away)
      document.removeEventListener('keydown', key)
    }
  }, [asking])

  if (asking) {
    return (
      <div ref={box} role="alertdialog" aria-label={question} className="inline-flex flex-wrap items-center gap-2 rounded-input p-2" style={{ background: 'var(--wrong-soft)' }}>
        <span className="text-sm font-bold px-1">{question}</span>
        <Button variant="accent" className="!min-h-[40px] !px-3 text-sm" onClick={() => { setAsking(false); onConfirm() }}>{confirmLabel}</Button>
        <Button variant="soft" className="!min-h-[40px] !px-3 text-sm" onClick={() => setAsking(false)}>Keep</Button>
      </div>
    )
  }
  if (icon) {
    return <button type="button" onClick={() => setAsking(true)} aria-label={ariaLabel} className={className}>{children}</button>
  }
  return <Button variant={variant} className={className} onClick={() => setAsking(true)} aria-label={ariaLabel}>{children}</Button>
}
