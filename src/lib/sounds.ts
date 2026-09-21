// Small sound effects made with the browser's Web Audio, so there are no audio files and no library.
// Exists to make taps, right and wrong answers and a finished lesson feel alive. It can be muted, and the choice is remembered.

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
    // If storage is blocked the choice just lasts for this visit.
  }
}

// Each sound is a short list of notes: frequency in hertz, when it starts, how long it lasts, and how loud.
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

// Call this from a click or a key press. Browsers only allow sound after the user has done something.
export function playSound(name: SoundName) {
  if (!isSoundOn() || typeof AudioContext === 'undefined') return
  try {
    if (!context) context = new AudioContext()
    if (context.state === 'suspended') context.resume()
    const now = context.currentTime
    for (const note of SOUNDS[name]) {
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      oscillator.type = note.wave
      oscillator.frequency.value = note.freq
      // A quick fade in and a smooth fade out, so notes never click.
      gain.gain.setValueAtTime(0.0001, now + note.at)
      gain.gain.linearRampToValueAtTime(note.volume, now + note.at + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + note.at + note.length)
      oscillator.connect(gain).connect(context.destination)
      oscillator.start(now + note.at)
      oscillator.stop(now + note.at + note.length + 0.02)
    }
  } catch {
    // Sound is a nicety. If the browser refuses, the app carries on silently.
  }
}
