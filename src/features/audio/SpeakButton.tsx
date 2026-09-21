// The round button that speaks a phrase aloud. It draws nothing when a phrase has no recording.
// Exists so every place a phrase appears can offer its sound the same way.
import { Icon } from '../../components/icons'
import { audioUrlFor, playPhrase } from './audio'

interface SpeakButtonProps {
  swahili: string
  size?: 'small' | 'large'
  className?: string
}

export function SpeakButton({ swahili, size = 'small', className = '' }: SpeakButtonProps) {
  if (!audioUrlFor(swahili)) return null
  const box = size === 'large' ? 'w-20 h-20' : 'w-11 h-11'
  return (
    <button type="button" onClick={() => playPhrase(swahili)} aria-label={`Listen to ${swahili}`} title="Listen"
      className={`no-print shrink-0 ${box} rounded-pill bg-hero text-on-hero flex items-center justify-center cursor-pointer active:translate-y-[2px] transition-transform ${className}`}>
      <Icon name="sound" size={size === 'large' ? 34 : 20} />
    </button>
  )
}
