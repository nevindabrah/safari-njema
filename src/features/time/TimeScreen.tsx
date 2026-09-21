// The "Telling time" screen: the clock first, then the short story of why 7 am is hour one.
// Exists as its own screen so the clock is easy to find. Folded inside the phrasebook, nobody saw it.
import { TopBar } from '../../components/TopBar'
import { Footer } from '../../components/Footer'
import { Card } from '../../components/Card'
import { LeaveButton } from '../../components/LeaveButton'
import { ASK_THE_TIME, pronounce } from './timeWords'
import { TimeExplorer } from './TimeExplorer'
import { TimeSpeakButton } from './TimeSpeakButton'

export function TimeScreen() {
  return (
    <div className="min-h-dvh">
      <TopBar />
      <main className="mx-auto max-w-5xl px-4 pt-4 pb-28 sm:pb-10">
        <LeaveButton kind="back" label="Back" to="/" showLabel className="mb-3" />
        <h1 className="text-4xl sm:text-5xl">Telling time</h1>
        <p className="text-muted mt-2 max-w-2xl">In Swahili, 7 in the morning is hour one. Set the clock to any hour to see it both ways, then practise.</p>

        {/* On a laptop the clock and the story sit side by side. On a phone the clock comes first. */}
        <div className="grid lg:grid-cols-2 gap-5 items-start">
          <TimeExplorer />
          <Card className="mt-5">
            <h2 className="text-2xl sm:text-3xl">Why 7 am is hour one</h2>
            <p className="mt-3 leading-relaxed">
              Swahili time counts from sunrise, not from midnight. Kenya sits on the equator, so the sun comes up at about six and goes down at about six, every day of the year.
              The first full hour of daylight, which a watch calls 7 am, is hour one. When darkness falls the count starts again, so 7 pm is hour one of the night.
            </p>
            <p className="mt-3 leading-relaxed">
              The rule is simple: add or take away six. Many people keep their watch on clock time and say the Swahili hour out loud.
              So when you agree a pickup time, check which way you both mean. Hour two in the morning is 8 am, not 2.
            </p>
            <p className="mt-3 leading-relaxed">On a real watch there is a shortcut: read the number straight across the face from the hour hand. Across from 8 is 2.</p>
            <div className="mt-4 flex items-center gap-3"><TimeSpeakButton swahili={ASK_THE_TIME.swahili} /><p className="text-sm">To ask: <b lang="sw">{ASK_THE_TIME.swahili}</b> <span className="font-bold text-accent-text">{pronounce(ASK_THE_TIME.swahili)}</span> <span className="text-muted">{ASK_THE_TIME.english}</span></p></div>
            <p className="mt-3 text-xs text-muted">
              <span className="inline-block rounded-pill bg-tint text-text font-bold px-2 py-0.5 mr-1">Not yet reviewed</span>
              The time words here were added after the teacher's review of the phrasebook and are waiting for a check. Where one part of the day ends and the next begins also varies from speaker to speaker.
            </p>
          </Card>
        </div>
        <Footer />
      </main>
    </div>
  )
}
