// The public About page. The text is carried over from v1 unchanged.
// Exists so reviewers can learn who built this without logging in.
import { Link } from 'react-router'
import { Card } from '../../components/Card'
import { Hero } from '../../components/Hero'
import { Button } from '../../components/Button'
import { TopBar } from '../../components/TopBar'
import { Footer } from '../../components/Footer'

export function AboutScreen() {
  return (
    <div className="min-h-dvh">
      <TopBar />
      <main className="mx-auto max-w-3xl px-4 py-6 flex flex-col gap-6">
        <Hero title="Kuhusu mimi">
          <p className="text-lg">About me, and why I built this.</p>
          <p className="inline-flex flex-wrap items-baseline gap-x-3 gap-y-1 mt-4 rounded-card px-4 py-3 bg-primary text-on-primary">
            <b lang="sw" className="font-display">Mtu ni watu</b>
            <span className="text-sm opacity-75">A person is people. We are who we are because of others.</span>
          </p>
        </Hero>
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
        <Footer />
      </main>
    </div>
  )
}
