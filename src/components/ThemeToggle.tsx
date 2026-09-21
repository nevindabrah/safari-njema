// The top bar button that switches between following the device, light and dark.
// Exists because the PRD asks for a theme toggle in the top bar. lib/theme.ts does the work.
import { useState } from 'react'
import { applyTheme, nextTheme, savedTheme, type ThemeMode } from '../lib/theme'
import { Icon, type IconName } from './icons'

const LOOK: Record<ThemeMode, { icon: IconName; label: string }> = {
  system: { icon: 'system', label: 'Theme follows your device. Switch to light' },
  light: { icon: 'sun', label: 'Light theme. Switch to dark' },
  dark: { icon: 'moon', label: 'Dark theme. Switch to follow your device' },
}

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>(savedTheme)

  function cycle() {
    const next = nextTheme(mode)
    applyTheme(next)
    setMode(next)
  }

  return (
    <button type="button" onClick={cycle} aria-label={LOOK[mode].label} title={LOOK[mode].label} className="w-10 h-10 rounded-pill hover:bg-tint cursor-pointer flex items-center justify-center">
      <Icon name={LOOK[mode].icon} size={20} />
    </button>
  )
}
