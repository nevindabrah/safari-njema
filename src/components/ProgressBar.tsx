// A rounded progress bar. Progress is never shown as plain text alone.
// Exists for the lesson steps and later for the trip overview.
interface ProgressBarProps {
  value: number
  max: number
  label: string
}

export function ProgressBar({ value, max, label }: ProgressBarProps) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100)
  return (
    <div className="flex items-center gap-3">
      <div
        className="flex-1 h-3 rounded-pill bg-tint overflow-hidden"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      >
        <div className="h-full rounded-pill bg-accent transition-[width] duration-300" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm font-bold text-muted">{value}/{max}</span>
    </div>
  )
}
