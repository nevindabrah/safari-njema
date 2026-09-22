// Asks Wikipedia once for a two sentence description of each built-in place and saves the ones that pass the fit check.
// Exists so the catalogue's descriptions are fixed, reviewed text with a credit, and only places found on Google Maps need a live lookup.
// Run: node scripts/fetchPlaceSummaries.ts
import { writeFileSync } from 'node:fs'
import { SAMPLE_PLACES } from '../src/features/demo/samplePlaces.ts'
import { pickWikipediaSummary, wikipediaSearchUrl, wikipediaTitleUrl, type WikipediaSummary } from '../src/lib/wikipedia.ts'

const USER_AGENT = 'SafariNjema/1.0 (student project; https://github.com/nevindabrah/safari-njema)'
const KNOWN_TITLES: Record<string, string> = {
  'sample-maasai-mara': 'Maasai Mara',
  'sample-lamu': 'Lamu',
  'sample-lake-nakuru': 'Lake Nakuru',
  'sample-watamu': 'Watamu',
  'sample-nairobi-cbd': 'Nairobi',
  'sample-sgr': 'Mombasa–Nairobi Standard Gauge Railway',
  'sample-mombasa-terminus': 'Mombasa–Nairobi Standard Gauge Railway',
  'sample-hotel': 'Stanley Hotel, Nairobi',
  'sample-nyali': 'Nyali',
  'sample-bamburi': 'Bamburi',
  'sample-all-saints': "All Saints' Cathedral, Nairobi",
}
const out: Record<string, WikipediaSummary> = {}
const missed: string[] = []

for (const place of SAMPLE_PLACES) {
  const ask = (url: string) => fetch(url, { headers: { 'User-Agent': USER_AGENT } }).then((r) => r.json())
  const known = KNOWN_TITLES[place.googlePlaceId]
  let reply = await ask(wikipediaTitleUrl(known ?? place.name))
  let summary = pickWikipediaSummary(reply, known ?? place.name)
  if (!summary) {
    reply = await ask(wikipediaSearchUrl(place.name, place.county))
    summary = pickWikipediaSummary(reply, place.name)
  }
  const hit = (reply as { query?: { pages?: Record<string, { title?: string }> } }).query?.pages
  const title = hit ? Object.values(hit)[0]?.title : undefined
  if (summary) out[place.googlePlaceId] = summary
  else missed.push(`${place.name}  (Wikipedia offered: ${title ?? 'nothing'})`)
  console.log(`${summary ? 'ok  ' : 'skip'} ${place.name}  ->  ${summary?.title ?? title ?? '-'}${summary ? '\n      ' + summary.extract.slice(0, 150) : ''}`)
}

writeFileSync('src/features/places/placeSummaries.json', JSON.stringify(out, null, 2) + '\n')
console.log(`\nSaved ${Object.keys(out).length} of ${SAMPLE_PLACES.length}. No fitting article for: ${missed.length ? '\n  ' + missed.join('\n  ') : 'none'}`)
