// The one big colour block per screen, with the kanga dots fading into a corner.
// Exists so landing, trip and lesson screens share the same bold moment.
import type { ReactNode } from 'react'

interface HeroProps {
  eyebrow?: string
  title: string
  children?: ReactNode
  // An optional picture placed behind the text, on the right.
  art?: ReactNode
}

export function Hero({ eyebrow, title, children, art }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-hero text-on-hero rounded-card p-6 sm:p-10">
      <div className="kanga-dots absolute inset-0 opacity-30 pointer-events-none" aria-hidden="true" />
      {art}
      <div className={`relative ${art ? 'lg:max-w-[62%]' : ''}`}>
        {eyebrow && <p className="text-sm font-bold uppercase tracking-wide opacity-80 mb-2">{eyebrow}</p>}
        <h1 className="text-4xl sm:text-6xl">{title}</h1>
        {children && <div className="mt-5">{children}</div>}
      </div>
    </section>
  )
}
