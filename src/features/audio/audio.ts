// Finds and plays the recorded Swahili for a phrase. One clip plays at a time.
// Exists so screens only say "play this phrase". The clips are made ahead of time by scripts/generateAudio.py.
import manifest from './audioManifest.json'

const CLIPS = manifest as Record<string, string>
let player: HTMLAudioElement | null = null

export function audioUrlFor(swahili: string): string | null {
  return CLIPS[swahili] ?? null
}

// Asks the browser to fetch these phrases' clips now and keep them, so playing one later does not wait on the network.
const warmed = new Set<string>()
export function preloadPhrases(swahili: string[]) {
  for (const phrase of swahili) {
    const url = audioUrlFor(phrase)
    if (!url || warmed.has(url)) continue
    warmed.add(url)
    fetch(url).catch(() => warmed.delete(url))
  }
}

// Plays any clip by its address. The phrasebook uses this for recordings that were held back from lessons.
export function playClip(url: string) {
  if (!player) player = new Audio()
  player.pause()
  player.src = url
  player.play().catch(() => {})
}

// Returns false when there is no clip, so a caller can hide its button.
export function playPhrase(swahili: string): boolean {
  const url = audioUrlFor(swahili)
  if (!url) return false
  if (!player) player = new Audio()
  player.pause()
  player.src = url
  // Browsers block sound that was not started by the user. Every call here follows a tap, but a refusal is harmless.
  player.play().catch(() => {})
  return true
}
