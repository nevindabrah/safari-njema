// A short section for reviewers: the engineering decisions behind the product, in plain words, as a numbered list.
// Exists because this is also a portfolio piece, and the interesting parts are not visible from the UI.
import { Button } from '../../components/Button'
import { Icon } from '../../components/icons'
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
    <section aria-labelledby="built-title" className="grid lg:grid-cols-[18rem_1fr] gap-8">
      <div className="lg:sticky lg:top-24 self-start px-1">
        <p className="text-sm font-bold uppercase tracking-wide text-accent-text">For reviewers</p>
        <h2 id="built-title" className="text-3xl sm:text-4xl mb-3">How it is built</h2>
        <p className="text-muted mb-5">React, TypeScript, Tailwind, Supabase with Postgres and Edge Functions, Google Maps Platform and the Claude API.</p>
        <a href={GITHUB_URL} target="_blank" rel="noreferrer"><Button tabIndex={-1}>Read the code<Icon name="arrow" size={18} /></Button></a>
      </div>
      <ol className="flex flex-col">
        {POINTS.map((point, i) => (
          <li key={point.title} className="grid grid-cols-[3rem_1fr] gap-3 py-5 border-t" style={{ borderColor: 'var(--line)' }}>
            <span className="font-display font-extrabold text-2xl text-accent-text">{String(i + 1).padStart(2, '0')}</span>
            <div>
              <h3 className="text-xl mb-1">{point.title}</h3>
              <p className="text-muted leading-relaxed">{point.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
