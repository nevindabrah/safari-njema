// A round back arrow or X that takes the visitor out of the screen or card they are on.
// Exists so there is always one obvious way to leave, in the same place and the same shape everywhere.
import { useNavigate } from 'react-router'
import { Icon } from './icons'

interface LeaveButtonProps {
  kind: 'back' | 'close'
  // Said to screen readers and shown beside a back arrow, for example "Back to my trip".
  label: string
  // Where to go. A back arrow first tries the screen the visitor came from, and uses this when there is none.
  to?: string
  // For cards and pop ups that close without changing the address.
  onLeave?: () => void
  showLabel?: boolean
  className?: string
}

export function LeaveButton({ kind, label, to = '/', onLeave, showLabel = false, className = '' }: LeaveButtonProps) {
  const navigate = useNavigate()

  function leave() {
    if (onLeave) return onLeave()
    // React Router numbers the screens visited in this tab. Above zero means there is one of ours to go back to.
    const cameFromInside = ((window.history.state as { idx?: number } | null)?.idx ?? 0) > 0
    if (kind === 'back' && cameFromInside) navigate(-1)
    else navigate(to)
  }

  return (
    <button type="button" onClick={leave} aria-label={showLabel ? undefined : label} className={`no-print inline-flex items-center gap-2 text-sm font-bold cursor-pointer ${className}`}>
      <span className="w-11 h-11 rounded-pill bg-surface text-text shadow-soft flex items-center justify-center shrink-0"><Icon name={kind} size={18} /></span>
      {showLabel && <span>{label}</span>}
    </button>
  )
}
