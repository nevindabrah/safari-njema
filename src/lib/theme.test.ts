// Tests the colour tokens in index.css: both dark themes must match, and text must be readable on its background.
// Exists because a colour added to only one of the two dark blocks once made answer feedback unreadable for anyone
// who picked dark with the toggle. This reads the real stylesheet, so that mistake now fails the build.
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { contrastRatio } from './contrast'

const css = readFileSync('src/index.css', 'utf8')

function variablesIn(selector: string): Record<string, string> {
  const open = css.indexOf('{', css.indexOf(selector))
  let depth = 0
  let close = open
  for (let i = open; i < css.length; i++) {
    if (css[i] === '{') depth++
    if (css[i] === '}') depth--
    if (depth === 0) { close = i; break }
  }
  return Object.fromEntries([...css.slice(open, close).matchAll(/(--[\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]))
}

const light = variablesIn(':root {')
const deviceDark = variablesIn(':root:not([data-theme="light"])')
const toggleDark = variablesIn(':root[data-theme="dark"]')

function resolve(theme: Record<string, string>, name: string): string {
  let value = theme[name]
  for (let i = 0; i < 5 && value?.startsWith('var('); i++) value = theme[value.slice(4, -1)]
  return value
}

const PAIRS: Array<[string, string]> = [
  ['--text', '--bg'], ['--text', '--surface'], ['--text', '--surface-2'], ['--text', '--tint'],
  ['--muted', '--bg'], ['--muted', '--surface'], ['--muted', '--surface-2'],
  ['--on-hero', '--hero'], ['--on-ink', '--ink'], ['--on-accent', '--accent'], ['--on-primary', '--primary'], ['--on-success', '--success'],
  ['--text', '--field'], ['--muted', '--field'],
  ['--text', '--right-soft'], ['--text', '--wrong-soft'], ['--accent-text', '--surface'], ['--accent-text', '--bg'], ['--accent-text', '--tint'], ['--accent-text', '--surface-2'],
]

describe('the two dark themes', () => {
  it('declare exactly the same variables with the same values', () => {
    expect(toggleDark).toEqual(deviceDark)
  })
})

const EDGES: Array<[string, string]> = [['--field-edge', '--surface'], ['--field-edge', '--bg'], ['--field-edge', '--tint']]

describe.each([
  ['light', light],
  ['dark from the device', { ...light, ...deviceDark }],
  ['dark from the toggle', { ...light, ...toggleDark }],
])('contrast in the %s theme', (_name, theme) => {
  it.each(PAIRS)('%s on %s is at least 4.5 to 1', (text, background) => {
    const ratio = contrastRatio(resolve(theme, text), resolve(theme, background))
    expect(ratio, `${text} ${resolve(theme, text)} on ${background} ${resolve(theme, background)} is ${ratio.toFixed(2)}`).toBeGreaterThanOrEqual(4.5)
  })

  it.each(EDGES)('%s against %s is at least 3 to 1', (edge, around) => {
    const ratio = contrastRatio(resolve(theme, edge), resolve(theme, around))
    expect(ratio, `${edge} against ${around} is ${ratio.toFixed(2)}`).toBeGreaterThanOrEqual(3)
  })
})
