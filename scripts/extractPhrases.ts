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

// Every phrase gets its chapter's base tag, plus the per phrase tags below.
// Tags are metadata for choosing phrases. The Swahili, pronunciation and English are never changed.
const CHAPTER_BASE: Record<string, string> = {
  salamu: 'basics', uwanja: 'airport', usafiri: 'transport', chakula: 'food',
  sokoni: 'market', safari: 'safari', pwani: 'coast', msaada: 'help',
}

// Keyed by the exact Swahili text in v1. The script stops if a key here matches no phrase, so a typo cannot slip through.
const PHRASE_TAGS: Record<string, string[]> = {
  'Habari?': ['greeting', 'core_greeting', 'essential'],
  'Nzuri': ['greeting', 'core_greeting', 'essential'],
  'Sasa? / Poa': ['greeting'],
  'Shikamoo / Marahaba': ['greeting', 'respect'],
  'Asante sana': ['polite', 'essential'],
  'Karibu': ['polite'],
  'Tafadhali': ['polite'],
  'Samahani': ['polite'],
  'Jina langu ni Sam': ['introductions'],
  'Unaitwa nani?': ['introductions', 'questions'],
  'Ninajifunza Kiswahili': ['introductions'],
  'Sema polepole, tafadhali': ['help'],
  'Sielewi': ['help'],
  'Kwaheri': ['farewell'],
  'Mizigo yangu iko wapi?': ['questions'],
  'Choo kiko wapi?': ['help', 'questions'],
  'Ninahitaji teksi': ['transport'],
  'Naweza kubadilisha pesa wapi?': ['cash'],
  'Nipeleke hotelini, tafadhali': ['transport', 'hotel'],
  'Ni shilingi ngapi?': ['price'],
  'Nauli ni ngapi?': ['fare', 'essential'],
  'Naomba chenji yangu': ['fare'],
  'Kushoto / Kulia': ['directions'],
  'Moja kwa moja': ['directions'],
  'Ni mbali?': ['directions'],
  'Kituo cha treni kiko wapi?': ['directions'],
  'Naomba menyu': ['ordering', 'essential'],
  'Naomba maji': ['ordering', 'drink'],
  'Ningependa nyama choma na ugali': ['ordering'],
  'Baridi / Moto': ['drink'],
  'Naomba bili': ['ordering', 'paying'],
  'Naweza kulipa na M-Pesa?': ['paying'],
  'Moja, mbili, tatu, nne, tano': ['numbers'],
  'Sita, saba, nane, tisa, kumi': ['numbers'],
  'Mia / Elfu': ['numbers'],
  'Mia tano': ['numbers'],
  'Hii ni bei gani?': ['bargaining', 'price', 'essential'],
  'Ni ghali sana': ['bargaining'],
  'Punguza bei, tafadhali': ['bargaining', 'essential'],
  'Bei ya mwisho ni ngapi?': ['bargaining'],
  'Naangalia tu': ['shopping'],
  'Una rangi nyingine?': ['shopping'],
  'Nitachukua hii': ['shopping'],
  'Sitaki, asante': ['shopping'],
  'Simba': ['animals'], 'Tembo / Ndovu': ['animals'], 'Twiga': ['animals'], 'Chui': ['animals'], 'Duma': ['animals'],
  'Kifaru': ['animals'], 'Nyati': ['animals'], 'Punda milia': ['animals'], 'Kiboko': ['animals'], 'Nyumbu': ['animals'],
  'Angalia!': ['guide'],
  'Ni mnyama gani huyo?': ['guide', 'essential'],
  'Tunaweza kusimama hapa?': ['guide'],
  'Naweza kupiga picha?': ['guide', 'polite', 'questions'],
  'Hakuna shida': ['polite'],
  'Bahari': ['beach'], 'Pwani': ['beach'], 'Jahazi': ['beach'],
  'Samaki': ['food'],
  'Madafu': ['drink', 'food'],
  'Kuna joto sana leo': ['smalltalk'],
  'Naweza kuogelea hapa?': ['beach'],
  'Nisaidie, tafadhali': ['essential'],
  'Hujambo? / Sijambo': ['greeting', 'coastal_greeting', 'coastal'],
  'Habari za asubuhi?': ['greeting', 'coastal_greeting', 'coastal'],
  'Salama': ['greeting', 'coastal_greeting', 'coastal'],
  'Tutaonana': ['farewell', 'coastal'],
  'Ninaumwa': ['emergency'], 'Hospitali iko wapi?': ['emergency'], 'Ninahitaji daktari': ['emergency'], 'Dawa': ['emergency'],
  'Unaongea Kiingereza?': ['questions'],
  'Pole': ['polite'],
}
// These phrases sit in a chapter but are not that chapter's kind of phrase, so they skip its base tag.
// Coastal greetings are not coast vocabulary, and Pole is sympathy, not a request for help.
const NO_BASE_TAG = new Set(['Hujambo? / Sijambo', 'Habari za asubuhi?', 'Salama', 'Tutaonana', 'Pole'])

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
    tags: [...new Set([...(NO_BASE_TAG.has(swahili) ? [] : [CHAPTER_BASE[chapter.id] ?? 'basics']), ...(PHRASE_TAGS[swahili] ?? [])])],
    register: REGISTER[swahili] ?? 'standard',
    accepted_variants: [],
    source: `v1 chapter ${chapter.id}: ${chapter.en}`,
  })),
)

const allSwahili = new Set(phrases.map((p) => p.swahili))
const unmatched = [...Object.keys(PHRASE_TAGS), ...Object.keys(REGISTER)].filter((key) => !allSwahili.has(key))
if (unmatched.length > 0) {
  console.error('These tag keys match no phrase in v1:', unmatched)
  process.exit(1)
}

// Proverbs: one per chapter, plus the two used on the v1 home and About screens.
const proverbs = chapters.map((chapter) => ({ swahili: chapter.jina[0], meaning: chapter.jina[1], themes: [CHAPTER_BASE[chapter.id] ?? 'general'] }))
for (const swahili of ['Haba na haba hujaza kibaba', 'Mtu ni watu']) {
  const match = html.match(new RegExp(`"${swahili}","([^"]+)"`))
  if (match) proverbs.push({ swahili, meaning: match[1], themes: ['general'] })
}

writeFileSync('supabase/seed/phrases.json', JSON.stringify(phrases, null, 2) + '\n')
writeFileSync('supabase/seed/proverbs.json', JSON.stringify(proverbs, null, 2) + '\n')
console.log(`Wrote ${phrases.length} phrases and ${proverbs.length} proverbs from ${chapters.length} chapters`)
