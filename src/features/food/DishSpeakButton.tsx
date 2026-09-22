// The round speaker button for a dish name. It draws nothing when that name has no recording yet.
// Exists apart from the lesson SpeakButton because the dish recordings have their own short list, loaded only with this page.
import { Icon } from '../../components/icons'
import { playClip } from '../audio/audio'
import { AudioComingSoon } from '../audio/ComingSoon'
import clips from './dishAudio.json'

const CLIPS = clips as Record<string, string>

export function DishSpeakButton({ name }: { name: string }) {
  const url = CLIPS[name]
  if (!url) return <AudioComingSoon />
  return (
    <button type="button" onClick={() => playClip(url)} aria-label={`Listen to ${name}`} title="Listen"
      className="shrink-0 w-11 h-11 rounded-pill bg-hero text-on-hero flex items-center justify-center cursor-pointer active:translate-y-[2px] transition-transform">
      <Icon name="sound" size={20} />
    </button>
  )
}
