// Finds and plays the recorded Swahili for a phrase. One clip plays at a time.
// Exists so screens only say "play this phrase". The clips are made ahead of time by scripts/generateAudio.py.
import manifest from './audioManifest.json'

const CLIPS = manifest as Record<string, string>
let player: HTMLAudioElement | null = null

export function audioUrlFor(swahili: string): string | null {
  return CLIPS[swahili] ?? null
}

const warmed = new Set<string>()
export function preloadPhrases(swahili: string[]) {
  for (const phrase of swahili) {
    const url = audioUrlFor(phrase)
    if (!url || warmed.has(url)) continue
    warmed.add(url)
    fetch(url).catch(() => warmed.delete(url))
  }
}

export function playClip(url: string) {
  if (!player) player = new Audio()
  player.pause()
  player.src = url
  player.play().catch(() => {})
}

export function playPhrase(swahili: string): boolean {
  const url = audioUrlFor(swahili)
  if (!url) return false
  if (!player) player = new Audio()
  player.pause()
  player.src = url
  player.play().catch(() => {})
  return true
}
