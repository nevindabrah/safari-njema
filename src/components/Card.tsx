// A white surface with large corners and one soft, wide shadow.
// Exists so content floats on the tinted background without any outline borders.
import type { HTMLAttributes } from 'react'

export function Card({ className = '', children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...rest} className={`bg-surface rounded-card shadow-soft p-5 sm:p-6 ${className}`}>
      {children}
    </div>
  )
}
