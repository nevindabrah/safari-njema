// A chunky pill button with a darker bottom edge that presses down when tapped.
// Exists so every button in the app looks and feels the same.
import type { ButtonHTMLAttributes } from 'react'
import { playSound } from '../lib/sounds'

type Variant = 'primary' | 'accent' | 'soft' | 'onHero'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  full?: boolean
  silent?: boolean
}

const styles: Record<Variant, { bg: string; text: string; edge: string }> = {
  primary: { bg: 'var(--primary)', text: 'var(--on-primary)', edge: 'var(--primary-edge)' },
  accent: { bg: 'var(--accent)', text: 'var(--on-accent)', edge: 'var(--accent-edge)' },
  soft: { bg: 'var(--tint)', text: 'var(--text)', edge: 'var(--line)' },
  onHero: { bg: 'var(--hero-ghost)', text: 'var(--on-hero-ghost)', edge: 'var(--hero-ghost-edge)' },
}

export function Button({ variant = 'primary', full = false, silent = false, className = '', style, onClick, children, ...rest }: ButtonProps) {
  const s = styles[variant]
  return (
    <button
      {...rest}
      onClick={(event) => {
        if (!silent) playSound('tap')
        onClick?.(event)
      }}
      className={`inline-flex items-center justify-center gap-2 min-h-[48px] px-6 font-bold rounded-pill
        transition-transform duration-100 active:translate-y-[3px] disabled:opacity-50 disabled:cursor-not-allowed
        cursor-pointer select-none ${full ? 'w-full' : ''} ${className}`}
      style={{
        background: s.bg,
        color: s.text,
        boxShadow: `0 4px 0 ${s.edge}`,
        ...style,
      }}
    >
      {children}
    </button>
  )
}
