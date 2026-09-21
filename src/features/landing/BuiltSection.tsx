// A short section for reviewers: the engineering decisions behind the product, in plain words.
// Exists because this is also a portfolio piece, and the interesting parts are not visible from the UI.
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { GITHUB_URL } from '../../components/Footer'

const POINTS = [
  { title: 'A phrase bank, not free text', body: 'Language models make mistakes in Swahili. So lessons are chosen from a bank of 95 phrases, tagged one by one. The model may pick and explain. It may not invent.' },
  { title: 'An AI switch', body: 'With the switch on, Claude writes the brief and chooses phrases from the candidates, and its JSON is checked with zod. With it off, a template builds the lesson from the same candidates. This demo runs with it off, so it costs nothing to keep live.' },
  { title: 'One pipeline, two runtimes', body: 'Scoring, the slot plan and the template are pure TypeScript functions. The same files run inside a Supabase Edge Function and inside this page.' },
  { title: 'Tests that read the lessons', body: 'Unit tests assert the exact phrases for a market, a beach and a game reserve, then sweep every kind of place so the bill never shows up at an airport.' },
  { title: 'Row Level Security everywhere', body: 'Every table has RLS on. Users see only their own trips and progress. Shared content is read only, and only server code can write it.' },
  { title: 'Written to be read', body: 'One feature per folder, no file over 200 lines, and every file starts by saying what it does and why it exists.' },
]

export function BuiltSection() {
  return (
    <section aria-labelledby="built-title">
      <h2 id="built-title" className="text-3xl mb-2 px-1">How it is built</h2>
      <p className="text-muted mb-5 px-1 max-w-2xl">React, TypeScript, Tailwind, Supabase with Postgres and Edge Functions, Google Maps Platform and the Claude API.</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {POINTS.map((point) => (
          <Card key={point.title}>
            <h3 className="text-lg mb-2">{point.title}</h3>
            <p className="text-sm text-muted leading-relaxed">{point.body}</p>
          </Card>
        ))}
      </div>
      <div className="mt-5 px-1">
        <a href={GITHUB_URL} target="_blank" rel="noreferrer"><Button tabIndex={-1}>Read the code on GitHub</Button></a>
      </div>
    </section>
  )
}
