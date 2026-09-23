// The public About page. The text is carried over from v1 unchanged.
// Exists so reviewers can learn who built this without logging in.
import { Link } from 'react-router'
import { Card } from '../../components/Card'
import { Hero } from '../../components/Hero'
import { Button } from '../../components/Button'
import { TopBar } from '../../components/TopBar'
import { LeaveButton } from '../../components/LeaveButton'
import { Footer } from '../../components/Footer'
import { allPhotos } from '../places/photoData'

const PHOTOS = [
  { src: '/about/nevin-with-giraffe-small.jpg', alt: 'Nevin taking a selfie beside a giraffe, with acacia trees behind' },
  { src: '/about/nevin-feeding-giraffe-small.jpg', alt: 'Nevin feeding a giraffe by hand from a raised wooden platform' },
]
const CAPTION = 'Twiga is Swahili for giraffe. Up close, they are taller than you expect.'

function HeroPhotos() {
  return (
    <figure className="hidden md:block absolute right-8 top-1/2 -translate-y-1/2 w-[17rem]">
      <div className="flex justify-center">
        <img src={PHOTOS[0].src} alt={PHOTOS[0].alt} width={768} height={1024} className="w-32 aspect-[3/4] object-cover rounded-input shadow-lift -rotate-6 translate-x-3" style={{ border: '4px solid var(--surface)' }} />
        <img src={PHOTOS[1].src} alt={PHOTOS[1].alt} width={768} height={1024} className="w-32 aspect-[3/4] object-cover rounded-input shadow-lift rotate-3 -translate-x-3 translate-y-3" style={{ border: '4px solid var(--surface)' }} />
      </div>
      <figcaption className="text-xs text-center mt-5 opacity-80">{CAPTION}</figcaption>
    </figure>
  )
}

export function AboutScreen() {
  return (
    <div className="min-h-dvh">
      <TopBar />
      <main className="mx-auto max-w-3xl px-4 pt-4 pb-28 min-[700px]:pb-6 flex flex-col gap-6">
        <LeaveButton kind="back" label="Back" to="/" showLabel className="self-start -mb-3" />
        <Hero title="Kuhusu mimi" artFrom="md" art={<HeroPhotos />}>
          <p className="text-lg">About me, and why I built this.</p>
          <p className="inline-flex flex-wrap items-baseline gap-x-3 gap-y-1 mt-4 rounded-card px-4 py-3" style={{ background: 'var(--ink)', color: 'var(--on-ink)' }}>
            <b lang="sw" className="font-display">Mtu ni watu</b>
            <span className="text-sm opacity-75">A person is people. We are who we are because of others.</span>
          </p>
        </Hero>

        <figure className="md:hidden">
          <div className="grid grid-cols-2 gap-3 max-w-[17rem] mx-auto">
            <img src={PHOTOS[0].src} alt={PHOTOS[0].alt} width={768} height={1024} className="w-full aspect-[3/4] object-cover rounded-card shadow-soft" />
            <img src={PHOTOS[1].src} alt={PHOTOS[1].alt} width={768} height={1024} className="w-full aspect-[3/4] object-cover rounded-card shadow-soft" />
          </div>
          <figcaption className="text-sm text-muted text-center mt-3">{CAPTION}</figcaption>
        </figure>

        <Card className="flex flex-col gap-4 text-lg leading-relaxed">
          <h2 className="text-2xl">Why I made Safari Njema</h2>
          <p>My name is Nevin Dabrah. I was born in Kenya. My dad worked there for many years, so Kenya is part of my family's story even though I grew up elsewhere. It is the first place I ever lived, and I have always wanted to know it better than a birth certificate lets me.</p>
          <p>That is why I take Swahili classes at Yale. Learning the language as a student has shown me how much of a place is locked inside its words. Safari just means journey. A kanga is not only a cloth, it is a proverb you wear. When you know that, you see the country differently.</p>
          <p>On campus I spend a lot of my time in Yale's African student organizations, including the Yale African Students Association and the Yale Africa Innovation Symposium. A big part of that work is helping people connect with the continent as it actually is, not as a postcard.</p>
          <p>Most travel guides tell you where to go. Most language apps teach you sentences you will never say. I wanted one thing that does both, in the order a traveller needs it: the airport, the ride into town, the first meal, the market, the Mara, the coast. If you can greet someone properly and ask the price of a kanga in Swahili, you stop being a spectator on your own trip. People open up. That feeling of connection is what I want visitors to Kenya to have.</p>
          <p>I am still a learner myself. If you spot a mistake or know a better way to say something, I would like to hear it.</p>
          <div className="mt-2">
            <Link to="/signup"><Button variant="accent" tabIndex={-1}>Start the journey</Button></Link>
          </div>
        </Card>
        <Card>
          <h2 className="text-xl mb-2">The voice</h2>
          <p className="text-sm text-muted mb-5">
            The Swahili you hear is spoken by Meta's MMS text to speech model for Swahili, used under the{' '}
            <a href="https://creativecommons.org/licenses/by-nc/4.0/" target="_blank" rel="noreferrer" className="underline">CC BY-NC 4.0</a> licence.
            Four words that voice could not say clearly come from two community voices built on it:{' '}
            <a href="https://huggingface.co/Mwau/waxal_swahili-tts-mms" target="_blank" rel="noreferrer" className="underline">Waxal Swahili</a> by Mwau, under the same licence, and the{' '}
            <a href="https://huggingface.co/mussacharles60/swahili-tts-female-voice" target="_blank" rel="noreferrer" className="underline">Swahili female voice</a> by Mussa Charles, under the MIT licence.
            Every clip was checked by a Swahili speech recogniser, and clips it could not understand were left out.
          </p>
          <h2 className="text-xl mb-2">Photo credits</h2>
          <p className="text-sm text-muted mb-3">Place photos come from Wikimedia Commons under Creative Commons licences. Thank you to the photographers.</p>
          <ul className="text-xs text-muted flex flex-col gap-1">
            {allPhotos().map(([id, photo]) => (
              <li key={id}><a href={photo.filePage} target="_blank" rel="noreferrer" className="underline">{decodeURIComponent(photo.filePage.split('File:')[1] ?? id).replace(/_/g, ' ')}</a> by {photo.author}, {photo.licence}</li>
            ))}
          </ul>
        </Card>
        <Footer />
      </main>
    </div>
  )
}
