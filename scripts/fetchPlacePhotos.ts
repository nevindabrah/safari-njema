// Finds a freely licensed photo for each built-in place, once, and saves it with the author and licence.
// Exists so the site never depends on a live photo lookup, and every photo carries the credit its licence requires.
// Run: node scripts/fetchPlacePhotos.ts   (two or three batched requests in total, to stay well inside Wikimedia's limits)
import { writeFileSync } from 'node:fs'

const USER_AGENT = 'SafariNjema/1.0 (student project; https://github.com/nevindabrah/safari-njema)'

// Built-in place id -> Wikipedia article whose lead photo shows the place. Null means search Wikimedia Commons instead.
const ARTICLES: Record<string, string | null> = {
  'sample-maasai-market': null,
  'sample-maasai-mara': 'Maasai Mara',
  'sample-diani': 'Diani Beach',
  'sample-lamu': 'Lamu',
  'sample-fort-jesus': 'Fort Jesus',
  'sample-nairobi-np': 'Nairobi National Park',
  'sample-giraffe-centre': 'Giraffe Centre',
  'sample-karura': 'Karura Forest',
  'sample-amboseli': null,
  'sample-lake-nakuru': 'Lake Nakuru',
  'sample-hells-gate': "Hell's Gate National Park",
  'sample-mount-kenya': 'Mount Kenya',
  'sample-watamu': 'Watamu',
  'sample-malindi': 'Malindi',
  'sample-kisumu': 'Kisumu',
  'sample-nairobi-cbd': 'Nairobi',
  'sample-jkia': 'Jomo Kenyatta International Airport',
  'sample-sgr': 'Nairobi Terminus',
  'sample-carnivore': null,
  'sample-hotel': 'Stanley Hotel, Nairobi',
  'sample-jamia': 'Jamia Mosque (Kenya)',
}
const COMMONS_SEARCH: Record<string, string> = {
  'sample-maasai-market': 'Maasai Market Nairobi beadwork',
  'sample-amboseli': 'Amboseli elephants Kilimanjaro',
  'sample-carnivore': 'nyama choma Kenya',
}

async function api(host: string, params: Record<string, string>) {
  const url = `https://${host}/w/api.php?` + new URLSearchParams({ format: 'json', formatversion: '2', ...params })
  const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
  if (!response.ok) throw new Error(`${host} answered ${response.status}`)
  return response.json()
}

const stripTags = (html: string) => html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim()

// 1. One request: the lead image file name of every article.
const titles = Object.values(ARTICLES).filter((t): t is string => t !== null)
const pages = await api('en.wikipedia.org', { action: 'query', titles: titles.join('|'), prop: 'pageimages', piprop: 'name', redirects: '1' })
const fileByTitle = new Map<string, string>()
for (const page of pages.query.pages) if (page.pageimage) fileByTitle.set(page.title, page.pageimage)
const redirected = new Map<string, string>((pages.query.redirects ?? []).map((r: { from: string; to: string }) => [r.from, r.to]))

const fileById = new Map<string, string>()
const articleById = new Map<string, string>()
for (const [id, title] of Object.entries(ARTICLES)) {
  if (!title) continue
  const finalTitle = redirected.get(title) ?? title
  const file = fileByTitle.get(finalTitle)
  if (file) { fileById.set(id, file); articleById.set(id, finalTitle) }
}

// 2. One Commons search per place that has no article photo. Only real photographs: jpg files.
for (const [id, search] of Object.entries(COMMONS_SEARCH)) {
  if (fileById.has(id)) continue
  const found = await api('commons.wikimedia.org', { action: 'query', list: 'search', srnamespace: '6', srsearch: `${search} filetype:bitmap`, srlimit: '5' })
  const hit = (found.query.search as Array<{ title: string }>).find((r) => /\.jpe?g$/i.test(r.title))
  if (hit) fileById.set(id, hit.title.replace(/^File:/, ''))
}

// 3. One request: the image URL, author and licence of every file. Commons only hosts freely licensed files.
const files = [...new Set(fileById.values())]
const info = await api('commons.wikimedia.org', { action: 'query', titles: files.map((f) => 'File:' + f).join('|'), prop: 'imageinfo', iiprop: 'url|extmetadata', iiurlwidth: '960' })
const normalised = new Map<string, string>((info.query.normalized ?? []).map((n: { from: string; to: string }) => [n.to, n.from]))

const result: Record<string, unknown> = {}
for (const page of info.query.pages) {
  const image = page.imageinfo?.[0]
  const meta = image?.extmetadata
  const licence = meta?.LicenseShortName?.value as string | undefined
  // No licence on Commons means the file is missing there (for example a fair use logo kept on Wikipedia). Skip it.
  if (!image || !licence) continue
  const fileName = (normalised.get(page.title) ?? page.title).replace(/^File:/, '')
  for (const [id, file] of fileById) {
    if (file.replace(/_/g, ' ') !== fileName.replace(/_/g, ' ')) continue
    result[id] = {
      url: String(image.thumburl).split('?')[0],
      // A photo found by search shows the kind of place, not always the exact spot, so the credit says so.
      illustrative: id in COMMONS_SEARCH && !ARTICLES[id],
      width: image.thumbwidth,
      height: image.thumbheight,
      author: stripTags(meta.Artist?.value ?? 'Unknown author').slice(0, 80),
      licence,
      licenceUrl: meta.LicenseUrl?.value ?? null,
      filePage: image.descriptionurl,
      article: articleById.get(id) ? `https://en.wikipedia.org/wiki/${encodeURIComponent(articleById.get(id)!.replace(/ /g, '_'))}` : null,
    }
  }
}

writeFileSync('src/features/places/placePhotos.json', JSON.stringify(result, null, 2) + '\n')
const missing = Object.keys(ARTICLES).filter((id) => !result[id])
console.log(`Saved ${Object.keys(result).length} of ${Object.keys(ARTICLES).length} photos.`, missing.length ? 'No free photo found for: ' + missing.join(', ') : '')
