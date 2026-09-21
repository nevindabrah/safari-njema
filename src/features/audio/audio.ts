// Finds and plays the recorded Swahili for a phrase. One clip plays at a time.
// Exists so screens only say "play this phrase". The clips are made ahead of time by scripts/generateAudio.py.
import manifest from './audioManifest.json'

const CLIPS = manifest as Record<string, string>
let player: HTMLAudioElement | null = null

export function audioUrlFor(swahili: string): string | null {
  return CLIPS[swahili] ?? null
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
