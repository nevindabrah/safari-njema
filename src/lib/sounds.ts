// Small sound effects made with the browser's Web Audio, so there are no audio files and no library.
// Exists to make taps, right and wrong answers and a finished lesson feel alive. It can be muted, and the choice is remembered. Phones only let sound start from a tap, so the first tap on the page unlocks it.

export type SoundName = 'tap' | 'select' | 'correct' | 'wrong' | 'added' | 'complete'

const KEY = 'safari-njema-sound'
let context: AudioContext | null = null

export function isSoundOn(): boolean {
  try {
    return localStorage.getItem(KEY) !== 'off'
  } catch {
    return true
  }
}

export function setSoundOn(on: boolean) {
  try {
    localStorage.setItem(KEY, on ? 'on' : 'off')
  } catch {
  }
}

const SOUNDS: Record<SoundName, Array<{ freq: number; at: number; length: number; volume: number; wave: OscillatorType }>> = {
  tap: [{ freq: 520, at: 0, length: 0.05, volume: 0.05, wave: 'sine' }],
  select: [{ freq: 660, at: 0, length: 0.08, volume: 0.07, wave: 'sine' }],
  correct: [
    { freq: 660, at: 0, length: 0.12, volume: 0.12, wave: 'sine' },
    { freq: 880, at: 0.1, length: 0.2, volume: 0.12, wave: 'sine' },
  ],
  wrong: [
    { freq: 220, at: 0, length: 0.14, volume: 0.1, wave: 'triangle' },
    { freq: 174, at: 0.12, length: 0.22, volume: 0.1, wave: 'triangle' },
  ],
  added: [
    { freq: 523, at: 0, length: 0.09, volume: 0.1, wave: 'sine' },
    { freq: 784, at: 0.08, length: 0.16, volume: 0.1, wave: 'sine' },
  ],
  complete: [
    { freq: 523, at: 0, length: 0.16, volume: 0.12, wave: 'sine' },
    { freq: 659, at: 0.13, length: 0.16, volume: 0.12, wave: 'sine' },
    { freq: 784, at: 0.26, length: 0.16, volume: 0.12, wave: 'sine' },
    { freq: 1047, at: 0.39, length: 0.4, volume: 0.13, wave: 'sine' },
  ],
}

function ensureContext(): AudioContext | null {
  if (typeof AudioContext === 'undefined') return null
  if (!context) context = new AudioContext()
  return context
}

export function unlockSounds() {
  const audio = ensureContext()
  if (!audio) return
  if (audio.state === 'suspended') audio.resume().catch(() => {})
  const buffer = audio.createBuffer(1, 1, audio.sampleRate)
  const source = audio.createBufferSource()
  source.buffer = buffer
  source.connect(audio.destination)
  source.start(0)
}

function schedule(audio: AudioContext, name: SoundName) {
  const now = audio.currentTime
  for (const note of SOUNDS[name]) {
    const oscillator = audio.createOscillator()
    const gain = audio.createGain()
    oscillator.type = note.wave
    oscillator.frequency.value = note.freq
    gain.gain.setValueAtTime(0.0001, now + note.at)
    gain.gain.linearRampToValueAtTime(note.volume, now + note.at + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + note.at + note.length)
    oscillator.connect(gain).connect(audio.destination)
    oscillator.start(now + note.at)
    oscillator.stop(now + note.at + note.length + 0.02)
  }
}

export function playSound(name: SoundName) {
  if (!isSoundOn()) return
  try {
    const audio = ensureContext()
    if (!audio) return
    if (audio.state === 'running') schedule(audio, name)
    else audio.resume().then(() => schedule(audio, name)).catch(() => {})
  } catch {
  }
}
