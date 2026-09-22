// A small quiet label shown where a phrase has no recording yet.
// Exists because a few recordings were held back until a person records them. Saying so beats an empty space.
export function AudioComingSoon({ className = '' }: { className?: string }) {
  return <span className={`inline-block text-[11px] font-bold text-muted rounded-pill bg-surface-2 px-2 py-1 whitespace-nowrap ${className}`}>Audio coming soon</span>
}
