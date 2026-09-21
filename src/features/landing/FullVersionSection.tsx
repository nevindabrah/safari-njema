// Says plainly what the demo stands in for: Google Maps for the map and search, and the Claude API for writing lessons.
// Exists so nobody takes the sketch map and template lessons for the whole design. Both integrations are in the repository.
import { Card } from '../../components/Card'

const ROWS = [
  {
    part: 'Map and search',
    demo: 'A sketch of Kenya and a built-in catalogue of 51 places, searchable by name or by what you want to do.',
    full: 'Google Maps Platform. The Maps JavaScript API draws the map with numbered pins, and Places Autocomplete, limited to Kenya, finds any hotel, market, park or beach.',
    code: 'TripMap.tsx, usePlaceSearch.ts',
  },
  {
    part: 'Lessons',
    demo: 'A template picks phrases from the bank and adds a general brief for that kind of place.',
    full: 'The Claude API. It writes the brief for the exact place and chooses phrases from the bank. Its JSON is checked with zod, and the template is the fallback if anything fails.',
    code: 'generate-lesson/claude.ts',
  },
  {
    part: 'Accounts and data',
    demo: 'One demo account, saved in your browser.',
    full: 'Supabase. Email login, Postgres with Row Level Security on every table, and an Edge Function that keeps the API key on the server.',
    code: 'supabase/migrations, generate-lesson/index.ts',
  },
]

export function FullVersionSection() {
  return (
    <section aria-labelledby="full-title">
      <h2 id="full-title" className="text-3xl mb-2 px-1">The demo and the full product</h2>
      <p className="text-muted mb-5 px-1 max-w-2xl">
        Safari Njema is designed around Google Maps and the Claude API. This public demo runs without API keys, so it costs nothing to keep online. Here is what each part stands in for.
      </p>
      <div className="flex flex-col gap-4">
        {ROWS.map((row) => (
          <Card key={row.part} className="grid md:grid-cols-[10rem_1fr_1.4fr] gap-4 md:gap-6">
            <h3 className="text-lg">{row.part}</h3>
            <div>
              <p className="text-xs uppercase tracking-wide font-bold text-muted mb-1">In this demo</p>
              <p className="text-sm leading-relaxed">{row.demo}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide font-bold text-accent-text mb-1">With the keys switched on</p>
              <p className="text-sm leading-relaxed">{row.full}</p>
              <p className="text-xs text-muted mt-2">In the code: {row.code}</p>
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}
