// The round speaker button for a time on the clock. It draws nothing when that time has no recording.
// Exists apart from the lesson SpeakButton because the 289 time recordings have their own list, loaded only with this screen.
import { Icon } from '../../components/icons'
import { playClip } from '../audio/audio'
import clips from './timeAudio.json'

// Made by scripts/generateTimeAudio.py: the Swahili phrase, then the address of its recording.
const CLIPS = clips as Record<string, string>

export function TimeSpeakButton({ swahili }: { swahili: string }) {
  const url = CLIPS[swahili]
  if (!url) return null
  return (
    <button type="button" onClick={() => playClip(url)} aria-label={`Listen to ${swahili}`} title="Listen"
      className="shrink-0 w-12 h-12 rounded-pill bg-hero text-on-hero flex items-center justify-center cursor-pointer active:translate-y-[2px] transition-transform">
      <Icon name="sound" size={22} />
    </button>
  )
}
