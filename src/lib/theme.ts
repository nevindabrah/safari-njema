// Light, dark, or follow the device. The choice is saved and applied by setting data-theme on the page.
// Exists so one small file owns the theme. index.html applies the saved choice before React loads, so nothing flashes.

export type ThemeMode = 'system' | 'light' | 'dark'

const KEY = 'safari-njema-theme'

export function savedTheme(): ThemeMode {
  try {
    const value = localStorage.getItem(KEY)
    if (value === 'light' || value === 'dark') return value
  } catch {
    // Storage can be blocked. Following the device still works.
  }
  return 'system'
}

export function applyTheme(mode: ThemeMode) {
  if (mode === 'system') delete document.documentElement.dataset.theme
  else document.documentElement.dataset.theme = mode
  try {
    if (mode === 'system') localStorage.removeItem(KEY)
    else localStorage.setItem(KEY, mode)
  } catch {
    // The choice then lasts for this visit only.
  }
}

// The button cycles through the three in this order.
export function nextTheme(mode: ThemeMode): ThemeMode {
  return mode === 'system' ? 'light' : mode === 'light' ? 'dark' : 'system'
}
