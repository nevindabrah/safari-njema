// The app's own icon set: simple line drawings on a 24 unit grid, all in the current text colour.
// Exists so the interface has one consistent hand, instead of emoji that look different on every device.
import type { ReactNode } from 'react'

export type IconName =
  | 'city' | 'park' | 'beach' | 'market' | 'restaurant' | 'hotel' | 'airport' | 'station' | 'religious_site' | 'museum'
  | 'hospital' | 'school' | 'bank' | 'office' | 'other'
  | 'plus' | 'minus' | 'target' | 'search' | 'trash' | 'sound' | 'mute' | 'sun' | 'moon' | 'system' | 'check' | 'bolt' | 'card' | 'cloth' | 'arrow' | 'back' | 'print' | 'map' | 'close' | 'calendar' | 'clock' | 'user' | 'menu'

const PATHS: Record<IconName, ReactNode> = {
  city: <><path d="M3 20h18M5 20V10l4-2v12M9 20V5l6 2.5V20M15 20v-7l4 1.5V20" /><path d="M11.5 10v.01M11.5 13.5v.01M11.5 17v.01" /></>,
  park: <><path d="M3 10.5c2.5-4.5 15.5-4.5 18 0-3.5 1.6-14.5 1.6-18 0Z" /><path d="M12 11.7V20M12 15.5l-3.2-2.3M12 14.2l3-2.2M6.5 20h11" /></>,
  beach: <><circle cx="17" cy="7" r="3" /><path d="M2 15c2-2 4-2 6 0s4 2 6 0 4-2 6 0 1.4 1 2 1.4M2 19.5c2-2 4-2 6 0s4 2 6 0 4-2 6 0" /></>,
  market: <><path d="M3.5 10h17l-1.6 9.1a1 1 0 0 1-1 .9H6.1a1 1 0 0 1-1-.9L3.5 10Z" /><path d="M8 10l3-6M16 10l-3-6M9 13.5v3M12 13.5v3M15 13.5v3" /></>,
  restaurant: <><path d="M7 3v18M4.5 3v5a2.5 2.5 0 0 0 5 0V3" /><path d="M16.5 21v-8M16.5 13c-2 0-2.5-1.5-2.5-4 0-3 1-6 2.5-6V21" /></>,
  hotel: <><path d="M3 19.5V6M3 15.5h18M21 19.5v-5a3 3 0 0 0-3-3h-7.5v4" /><circle cx="6.7" cy="11.6" r="1.7" /></>,
  airport: <><path d="M21 3 3 10.5l7 2.8L12.8 21 21 3Z" /><path d="m10 13.3 4.5-4.6" /></>,
  station: <><rect x="5" y="3.5" width="14" height="13.5" rx="3" /><path d="M5 11h14M8.5 7.2h7M8 17l-1.5 3.5M16 17l1.5 3.5" /><path d="M8.5 14v.01M15.5 14v.01" /></>,
  religious_site: <><path d="M5 20v-7.5a7 7 0 0 1 14 0V20M3 20h18M12 5.5V2.8" /><path d="M9.8 20v-3.8a2.2 2.2 0 0 1 4.4 0V20" /></>,
  museum: <><path d="m3 9 9-5 9 5M4 9.2h16M3 20h18M6 9.5V17M10 9.5V17M14 9.5V17M18 9.5V17M4.5 17h15" /></>,
  hospital: <><path d="M4 20V9l8-4.5L20 9v11M3 20h18" /><path d="M12 10.5v5M9.5 13h5" /></>,
  school: <><path d="M2.5 9.2 12 4.7l9.5 4.5L12 13.7 2.5 9.2Z" /><path d="M6.8 11.4V16c0 1.3 2.3 2.4 5.2 2.4s5.2-1.1 5.2-2.4v-4.6M21.5 9.2v5.3" /></>,
  bank: <><path d="M3 10 12 4.5 21 10M3.5 10h17" /><path d="M6 10.8v7.4M10 10.8v7.4M14 10.8v7.4M18 10.8v7.4M3 20.5h18" /></>,
  office: <><path d="M6.5 3h7l4.5 4.5V21H6.5V3Z" /><path d="M13.5 3v4.5H18M9.5 12h5M9.5 16h5" /></>,
  other: <><path d="M12 21s-6.5-5.6-6.5-10.4a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21Z" /><circle cx="12" cy="10.5" r="2.2" /></>,
  plus: <path d="M12 5.5v13M5.5 12h13" />,
  minus: <path d="M5.5 12h13" />,
  target: <><circle cx="12" cy="12" r="6.5" /><circle cx="12" cy="12" r="1.6" /><path d="M12 2.5V5M12 19v2.5M2.5 12H5M19 12h2.5" /></>,
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 5 5" /></>,
  trash: <><path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l.9 12a1 1 0 0 0 1 .9h7.2a1 1 0 0 0 1-.9l.9-12M10 11v5.5M14 11v5.5" /></>,
  sound: <><path d="M4 9.5v5h3.5L12 18.5V5.5L7.5 9.5H4Z" /><path d="M15.5 9a4.2 4.2 0 0 1 0 6M18 6.5a7.8 7.8 0 0 1 0 11" /></>,
  mute: <><path d="M4 9.5v5h3.5L12 18.5V5.5L7.5 9.5H4Z" /><path d="m16 9.5 5 5M21 9.5l-5 5" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3 7 7M17 17l1.7 1.7M18.7 5.3 17 7M7 17l-1.7 1.7" /></>,
  moon: <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />,
  system: <><rect x="3" y="4.5" width="18" height="12" rx="2" /><path d="M8.5 20h7M12 16.5V20" /></>,
  check: <path d="m4.5 12.5 5 5L19.5 7" />,
  bolt: <path d="M13 2.5 4.5 13.5H11l-1 8 8.5-11H12l1-8Z" />,
  card: <><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="M7 10h6M7 14h10" /></>,
  cloth: <><rect x="3.5" y="5" width="17" height="14" rx="1.5" /><rect x="6.5" y="8" width="11" height="8" /><path d="M9 12h6" /></>,
  arrow: <path d="M4.5 12h15M13.5 6l6 6-6 6" />,
  print: <><path d="M7 8.5V3.5h10v5M7 17.5H4.5a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h15a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H17" /><rect x="7" y="14" width="10" height="6.5" /></>,
  map: <><path d="m3 6.5 6-2.5 6 2.5 6-2.5v13.5l-6 2.5-6-2.5-6 2.5V6.5Z" /><path d="M9 4v13.5M15 6.5V20" /></>,
  back: <path d="M19.5 12h-15M10.5 6l-6 6 6 6" />,
  calendar: <><rect x="3.5" y="5" width="17" height="15" rx="3" /><path d="M3.5 10h17M8 3v4M16 3v4" /></>,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  user: <><circle cx="12" cy="8.5" r="4" /><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" /></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
}

interface IconProps {
  name: IconName
  size?: number
  className?: string
}

export function Icon({ name, size = 24, className = '' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {PATHS[name]}
    </svg>
  )
}
