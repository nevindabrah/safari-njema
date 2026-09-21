// A small decorative silhouette of Kenya with three pins, shown beside the hero text on wide screens.
// Exists to give the landing page one picture of the idea: a trip across Kenya, one stop at a time.
import { KENYA } from '../demo/kenyaOutline'

const PINS: Array<[number, number]> = [[36.82, -1.29], [39.59, -4.28], [35.14, -1.49]]

export function HeroMap() {
  const outline = KENYA.map(([lng, lat], i) => `${i === 0 ? 'M' : 'L'}${lng} ${-lat}`).join(' ') + ' Z'
  return (
    <svg viewBox="33.2 -5.6 9.4 11" className="hidden lg:block absolute right-10 top-1/2 -translate-y-1/2 h-[82%] pointer-events-none" aria-hidden="true">
      <path d={outline} fill="var(--hero-ghost)" stroke="var(--ink)" strokeWidth="0.09" strokeLinejoin="round" />
      <polyline points={PINS.map(([lng, lat]) => `${lng},${-lat}`).join(' ')} fill="none" stroke="var(--ink)" strokeWidth="0.09" strokeDasharray="0.02 0.24" strokeLinecap="round" />
      {PINS.map(([lng, lat], i) => (
        <g key={i}>
          <circle cx={lng} cy={-lat} r="0.44" fill="var(--accent)" stroke="var(--surface)" strokeWidth="0.1" />
          <text x={lng} y={-lat + 0.15} fontSize="0.44" fontWeight="800" textAnchor="middle" fill="var(--on-accent)">{i + 1}</text>
        </g>
      ))}
    </svg>
  )
}
