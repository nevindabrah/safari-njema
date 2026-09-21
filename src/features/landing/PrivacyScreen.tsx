// The privacy page, in plain language: what the site keeps, where, and what it never collects.
// Exists because the PRD asks for one before the site is shared publicly. It must stay true, so update it when storage changes.
import { Card } from '../../components/Card'
import { TopBar } from '../../components/TopBar'
import { Footer } from '../../components/Footer'
import { isDemoMode } from '../demo/demoMode'

const SECTIONS = [
  {
    title: 'What is kept on your device',
    body: 'Your trip, your lesson progress, the kangas you have earned, and your choices for theme, sound and lesson length are saved in your browser. Notes you write in the phrasebook are saved there too, until you send or clear them. Clearing your browser data removes all of it.',
  },
  {
    title: 'What is kept on a server',
    body: isDemoMode
      ? 'Nothing. This version has no accounts, so nothing you do here leaves your device unless you choose to email your phrasebook notes.'
      : 'If you create an account, your email address, your trip, your stops and your lesson progress are stored with Supabase, our database provider, so you can sign in from another device. Only you can read them. You can ask for your account and everything in it to be deleted.',
  },
  {
    title: 'What is never collected',
    body: 'No advertising trackers and no analytics. No microphone recordings. Your location is never requested.',
  },
  {
    title: 'Other services this site talks to',
    body: 'Fonts load from Google Fonts. Place photos load from Wikimedia Commons. When the full version is switched on, the map and place search come from Google Maps, and lesson text is written by Anthropic\'s Claude from the name and kind of a place, never from anything about you.',
  },
]

export function PrivacyScreen() {
  return (
    <div className="min-h-dvh">
      <TopBar />
      <main className="mx-auto max-w-3xl px-4 pt-6 pb-28 sm:pb-6 flex flex-col gap-5">
        <h1 className="text-4xl sm:text-5xl px-1">Privacy</h1>
        <p className="text-muted px-1">Safari Njema is a student project by Nevin Dabrah. It is free, shows no adverts, and is built to keep as little about you as it can.</p>
        {SECTIONS.map((section) => (
          <Card key={section.title}>
            <h2 className="text-xl mb-2">{section.title}</h2>
            <p className="leading-relaxed">{section.body}</p>
          </Card>
        ))}
        <Footer />
      </main>
    </div>
  )
}
