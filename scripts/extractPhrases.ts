// Reads the CHAPTERS array out of the v1 HTML file and writes phrases.json and proverbs.json.
// Exists so the phrase bank and the proverbs come from v1 unchanged instead of being typed in by hand.
// Run: node scripts/extractPhrases.ts [path-to-html]
import { readFileSync, writeFileSync } from 'node:fs'

const htmlPath = process.argv[2] ?? 'safari-njema-design-reference.html'

// In v1 every chapter has an id, and every phrase is [Swahili, how to say it, English].
interface Chapter {
  id: string
  sw: string
  en: string
  jina: [string, string]
  phrases: Array<[string, string, string]>
}

// Lesson tags for each v1 chapter. These are metadata for phrase selection, not changes to the Swahili.
const CHAPTER_TAGS: Record<string, string[]> = {
  salamu: ['greeting', 'polite'],
  uwanja: ['airport', 'transport', 'help'],
  usafiri: ['transport', 'directions', 'numbers'],
  chakula: ['food', 'drink'],
  sokoni: ['market', 'bargaining', 'numbers', 'money'],
  safari: ['safari', 'animals', 'questions'],
  pwani: ['coast', 'beach'],
  msaada: ['help', 'emergency'],
}

// A few phrases carry an extra tag or a different register. Keyed by the exact Swahili text.
const EXTRA_TAGS: Record<string, string[]> = {
  'Hujambo? / Sijambo': ['greeting', 'coastal'],
  'Habari za asubuhi?': ['greeting', 'coastal'],
  'Salama': ['greeting', 'coastal'],
  'Tutaonana': ['greeting', 'coastal'],
  'Naomba bili': ['money'],
  'Naweza kulipa na M-Pesa?': ['money'],
  'Ni shilingi ngapi?': ['numbers', 'money'],
  'Nauli ni ngapi?': ['money'],
  'Naomba chenji yangu': ['money'],
  'Naweza kupiga picha?': ['polite'],
  'Hakuna shida': ['polite'],
  'Pole': ['polite'],
}
const REGISTER: Record<string, string> = {
  'Sasa? / Poa': 'sheng',
  'Hujambo? / Sijambo': 'coastal',
  'Habari za asubuhi?': 'coastal',
  'Salama': 'coastal',
  'Tutaonana': 'coastal',
}

const html = readFileSync(htmlPath, 'utf8')
const marker = html.search(/(const|let|var)\s+CHAPTERS\s*=\s*\[/)
if (marker < 0) {
  console.error('Could not find a CHAPTERS array in', htmlPath)
  process.exit(1)
}
// Walk from the opening bracket to its matching close bracket, ignoring brackets inside strings.
const start = html.indexOf('[', marker)
let depth = 0
let inString: string | null = null
let end = -1
for (let i = start; i < html.length; i++) {
  const ch = html[i]
  if (inString) {
    if (ch === '\\') i++
    else if (ch === inString) inString = null
    continue
  }
  if (ch === '"' || ch === "'" || ch === '`') inString = ch
  else if (ch === '[') depth++
  else if (ch === ']') {
    depth--
    if (depth === 0) {
      end = i
      break
    }
  }
}
if (end < 0) {
  console.error('CHAPTERS array did not close')
  process.exit(1)
}

// The array is a JavaScript literal, so evaluate just that literal.
const chapters = new Function('return ' + html.slice(start, end + 1))() as Chapter[]

const phrases = chapters.flatMap((chapter) =>
  chapter.phrases.map(([swahili, pronunciation, english]) => ({
    swahili,
    pronunciation,
    english,
    tags: [...new Set([...(CHAPTER_TAGS[chapter.id] ?? ['questions']), ...(EXTRA_TAGS[swahili] ?? [])])],
    register: REGISTER[swahili] ?? 'standard',
    accepted_variants: [],
    source: `v1 chapter ${chapter.id}: ${chapter.en}`,
  })),
)

// Proverbs: one per chapter, plus the two used on the v1 home and About screens.
const proverbs = chapters.map((chapter) => ({ swahili: chapter.jina[0], meaning: chapter.jina[1], themes: CHAPTER_TAGS[chapter.id] ?? [] }))
for (const swahili of ['Haba na haba hujaza kibaba', 'Mtu ni watu']) {
  const match = html.match(new RegExp(`"${swahili}","([^"]+)"`))
  if (match) proverbs.push({ swahili, meaning: match[1], themes: ['general'] })
}

writeFileSync('supabase/seed/phrases.json', JSON.stringify(phrases, null, 2) + '\n')
writeFileSync('supabase/seed/proverbs.json', JSON.stringify(proverbs, null, 2) + '\n')
console.log(`Wrote ${phrases.length} phrases and ${proverbs.length} proverbs from ${chapters.length} chapters`)
