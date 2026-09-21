// Works out the contrast ratio between two colours, the way the WCAG accessibility standard defines it.
// Exists so the theme can be tested: the PRD asks for 4.5 to 1 between text and its background in every palette.

function channel(value: number): number {
  const c = value / 255
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

// Relative luminance of a six digit hex colour like #15173a. 0 is black and 1 is white.
export function luminance(hex: string): number {
  const n = parseInt(hex.replace('#', ''), 16)
  return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255)
}

// From 1 (no contrast) to 21 (black on white). Order does not matter.
export function contrastRatio(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (light + 0.05) / (dark + 0.05)
}
