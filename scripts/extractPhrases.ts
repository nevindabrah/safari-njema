// Reads the CHAPTERS array out of the v1 HTML file and writes supabase/seed/phrases.json.
// Exists so the phrase bank comes from v1 unchanged instead of being typed in by hand.
// Run: node scripts/extractPhrases.ts [path-to-html]
import { readFileSync, writeFileSync } from 'node:fs'

const htmlPath = process.argv[2] ?? 'safari-njema-design-reference.html'
const outPath = 'supabase/seed/phrases.json'

// Keywords in a chapter title map to lesson tags. Adjust after checking the real titles.
const CHAPTER_TAGS: Array<[RegExp, string[]]> = [
  [/greet|hello|basics|polite|essential/i, ['greeting', 'polite']],
  [/number|count|price|money|pay/i, ['numbers', 'money']],
  [/market|shop|bargain|buy/i, ['market', 'bargaining', 'numbers']],
  [/food|eat|restaurant|drink|menu/i, ['food', 'drink']],
  [/safari|animal|wild|park|game/i, ['safari', 'animals']],
  [/transport|matatu|taxi|bus|direction|travel|road/i, ['transport', 'directions']],
  [/hotel|lodge|stay|room/i, ['hotel']],
  [/help|emergency|health|doctor|police|safe/i, ['help', 'emergency']],
  [/airport|arriv|flight/i, ['airport', 'transport']],
  [/coast|beach|mombasa|lamu|diani/i, ['coast', 'coastal']],
  [/family|home|people|friend/i, ['family', 'polite']],
  [/time|day|week|when/i, ['time']],
  [/question|ask|what|where/i, ['questions']],
]

function tagsForTitle(title: string): string[] {
  const tags = new Set<string>()
  for (const [pattern, list] of CHAPTER_TAGS) {
    if (pattern.test(title)) list.forEach((t) => tags.add(t))
  }
  return tags.size > 0 ? [...tags] : ['questions']
}

function firstString(obj: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = obj[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return ''
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
const chapters = new Function('return ' + html.slice(start, end + 1))() as Array<Record<string, unknown>>

const phrases: Array<Record<string, unknown>> = []
for (const chapter of chapters) {
  const title = firstString(chapter, ['title', 'name', 'heading'])
  const items = (chapter.phrases ?? chapter.items ?? chapter.entries ?? chapter.cards ?? []) as Array<Record<string, unknown>>
  for (const item of items) {
    const swahili = firstString(item, ['sw', 'swahili', 'phrase', 'kiswahili'])
    const english = firstString(item, ['en', 'english', 'meaning', 'translation'])
    if (!swahili || !english) continue
    phrases.push({
      swahili,
      pronunciation: firstString(item, ['pron', 'pronunciation', 'say', 'sounds']),
      english,
      tags: tagsForTitle(title),
      register: 'standard',
      accepted_variants: [],
      source: `v1 chapter: ${title}`,
    })
  }
}

writeFileSync(outPath, JSON.stringify(phrases, null, 2) + '\n')
console.log(`Wrote ${phrases.length} phrases from ${chapters.length} chapters to ${outPath}`)
