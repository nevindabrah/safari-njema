// Finds a freely licensed photo for each built-in place, once, and saves it with the author and licence.
// Exists so the site never depends on a live photo lookup, and every photo carries the credit its licence requires.
// It also downloads each photo once and saves two compressed sizes in public/places, so the site serves its own photos
// from Vercel's network and never waits on a third party. The licences allow this as long as the credit stays, and it does.
// Run: node scripts/fetchPlacePhotos.ts   (a few batched requests, then one slow download per photo. Needs macOS for sips.)
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, statSync, unlinkSync, writeFileSync } from 'node:fs'

const USER_AGENT = 'SafariNjema/1.0 (student project; https://github.com/nevindabrah/safari-njema)'

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
  'sample-tsavo-east': "Tsavo East National Park",
  'sample-lake-naivasha': "Lake Naivasha",
  'sample-ol-pejeta': "Ol Pejeta Conservancy",
  'sample-samburu': "Samburu National Reserve",
  'sample-sheldrick': "Sheldrick Wildlife Trust",
  'sample-kakamega-forest': "Kakamega Forest",
  'sample-mombasa-old-town': "Mombasa",
  'sample-nanyuki': "Nanyuki",
  'sample-nakuru': "Nakuru",
  'sample-eldoret': "Eldoret",
  'sample-naivasha-town': "Naivasha",
  'sample-gedi': "Ruins of Gedi",
  'sample-national-museum': "Nairobi National Museum",
  'sample-bomas': "Bomas of Kenya",
  'sample-karen-blixen': "Karen Blixen Museum",
  'sample-kicc': "Kenyatta International Convention Centre",
  'sample-village-market': "Village Market",
  'sample-city-market': null,
  'sample-moi-airport': "Moi International Airport",
  'sample-wilson-airport': "Wilson Airport",
  'sample-mombasa-terminus': "Mombasa Terminus",
  'sample-nyali': "Nyali",
  'sample-bamburi': "Bamburi",
  'sample-tamarind': null,
  'sample-mama-oliech': null,
  'sample-ali-barbours': null,
  'sample-talisman': null,
  'sample-giraffe-manor': "Giraffe Manor",
  'sample-mara-serena': null,
  'sample-all-saints': "All Saints' Cathedral, Nairobi",
}
const COMMONS_SEARCH: Record<string, string> = {
  'sample-maasai-market': 'Maasai Market Nairobi beadwork',
  'sample-amboseli': 'Amboseli elephants Kilimanjaro',
  'sample-carnivore': 'nyama choma Kenya',
  'sample-city-market': 'Nairobi City Market',
  'sample-tamarind': 'Swahili seafood Mombasa',
  'sample-mama-oliech': 'fried tilapia ugali Kenya',
  'sample-talisman': 'Kenyan food plate Nairobi',
  'sample-mara-serena': 'safari lodge Maasai Mara',
}

async function api(host: string, params: Record<string, string>) {
  const url = `https://${host}/w/api.php?` + new URLSearchParams({ format: 'json', formatversion: '2', ...params })
  const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
  if (!response.ok) throw new Error(`${host} answered ${response.status}`)
  return response.json()
}

const stripTags = (html: string) => html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim()

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

const NO_PHOTO = new Set(['sample-ali-barbours'])
const stillMissing = Object.keys(ARTICLES).filter((id) => !fileById.has(id) && !NO_PHOTO.has(id))
for (const id of stillMissing) {
  const search = COMMONS_SEARCH[id] ?? `${ARTICLES[id]} Kenya`
  await new Promise((resolve) => setTimeout(resolve, 1200))
  const found = await api('commons.wikimedia.org', { action: 'query', list: 'search', srnamespace: '6', srsearch: `${search} filetype:bitmap`, srlimit: '5' })
  const hit = (found.query.search as Array<{ title: string }>).find((r) => /\.jpe?g$/i.test(r.title))
  if (hit) fileById.set(id, hit.title.replace(/^File:/, ''))
}

const files = [...new Set(fileById.values())]
const infoPages: any[] = []
const normalised = new Map<string, string>()
for (let i = 0; i < files.length; i += 40) {
  const info = await api('commons.wikimedia.org', { action: 'query', titles: files.slice(i, i + 40).map((f) => 'File:' + f).join('|'), prop: 'imageinfo', iiprop: 'url|extmetadata', iiurlwidth: '960' })
  infoPages.push(...info.query.pages)
  for (const n of info.query.normalized ?? []) normalised.set(n.to, n.from)
}

const result: Record<string, unknown> = {}
for (const page of infoPages) {
  const image = page.imageinfo?.[0]
  const meta = image?.extmetadata
  const licence = meta?.LicenseShortName?.value as string | undefined
  if (!image || !licence) continue
  const fileName = (normalised.get(page.title) ?? page.title).replace(/^File:/, '')
  for (const [id, file] of fileById) {
    if (file.replace(/_/g, ' ') !== fileName.replace(/_/g, ' ')) continue
    result[id] = {
      source: String(image.thumburl).split('?')[0],
      illustrative: !articleById.has(id),
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

mkdirSync('public/places', { recursive: true })
for (const [id, photo] of Object.entries(result) as Array<[string, any]>) {
  const large = `public/places/${id}.jpg`
  const small = `public/places/${id}-small.jpg`
  if (!existsSync(large) || !existsSync(small)) {
    await new Promise((resolve) => setTimeout(resolve, 900))
    const response = await fetch(photo.source, { headers: { 'User-Agent': USER_AGENT } })
    if (!response.ok) { console.log(`  could not download ${id}: ${response.status}`); delete result[id]; continue }
    const original = `public/places/${id}-original.jpg`
    writeFileSync(original, Buffer.from(await response.arrayBuffer()))
    execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '62', '-Z', '960', original, '--out', large], { stdio: 'ignore' })
    execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '60', '-Z', '420', original, '--out', small], { stdio: 'ignore' })
    if (statSync(large).size > 170 * 1024) execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '48', '-Z', '820', large, '--out', large], { stdio: 'ignore' })
    if (statSync(small).size > 45 * 1024) execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '48', '-Z', '400', small, '--out', small], { stdio: 'ignore' })
    unlinkSync(original)
  }
  photo.url = `/places/${id}.jpg`
  photo.small = `/places/${id}-small.jpg`
}

writeFileSync('src/features/places/placePhotos.json', JSON.stringify(result, null, 2) + '\n')
const missing = Object.keys(ARTICLES).filter((id) => !result[id])
console.log(`Saved ${Object.keys(result).length} of ${Object.keys(ARTICLES).length} photos.`, missing.length ? 'No free photo found for: ' + missing.join(', ') : '')
