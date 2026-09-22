// Finds a freely licensed photo for each built-in place, once, and saves it with the author and licence.
// Exists so the site never depends on a live photo lookup, and every photo carries the credit its licence requires.
// It also downloads each photo once at high resolution and saves three sizes in public/places, so the site serves sharp
// photos on every screen from Vercel's network. Wide landscape photos are preferred because every place they appear in is wider than tall.
// Run: node scripts/fetchPlacePhotos.ts   (a few batched requests, then one slow download per photo. Needs macOS for sips.)
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, statSync, unlinkSync, writeFileSync } from 'node:fs'

const USER_AGENT = 'SafariNjema/1.0 (student project; https://github.com/nevindabrah/safari-njema)'

const stamp = (path: string) => '?v=' + createHash('md5').update(readFileSync(path)).digest('hex').slice(0, 8)

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
  'sample-maasai-market': 'The Maasai Market Vendors Nairobi',
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
const MIN_WIDE = 1400

async function searchCommons(text: string): Promise<string[]> {
  await new Promise((resolve) => setTimeout(resolve, 1200))
  const found = await api('commons.wikimedia.org', { action: 'query', list: 'search', srnamespace: '6', srsearch: `${text} filetype:bitmap`, srlimit: '10' })
  return (found.query.search as Array<{ title: string }>).map((r) => r.title.replace(/^File:/, '')).filter((t) => /\.jpe?g$/i.test(t))
}

interface Candidate { file: string; width: number; height: number; licensed: boolean }

async function describe(files: string[]): Promise<Map<string, Candidate>> {
  const out = new Map<string, Candidate>()
  for (let i = 0; i < files.length; i += 40) {
    const info = await api('commons.wikimedia.org', { action: 'query', titles: files.slice(i, i + 40).map((f) => 'File:' + f).join('|'), prop: 'imageinfo', iiprop: 'size|extmetadata' })
    const back = new Map<string, string>((info.query.normalized ?? []).map((n: { from: string; to: string }) => [n.to, n.from]))
    for (const page of info.query.pages) {
      const image = page.imageinfo?.[0]
      if (!image) continue
      const file = (back.get(page.title) ?? page.title).replace(/^File:/, '')
      out.set(file.replace(/_/g, ' '), { file, width: image.width, height: image.height, licensed: Boolean(image.extmetadata?.LicenseShortName?.value) })
    }
  }
  return out
}

const isWide = (c: Candidate) => c.licensed && c.width > c.height && c.width >= MIN_WIDE

const candidatesById = new Map<string, string[]>()
for (const id of Object.keys(ARTICLES)) {
  if (NO_PHOTO.has(id)) continue
  const own = fileById.get(id)
  const search = COMMONS_SEARCH[id] ?? `${ARTICLES[id]} Kenya`
  const hits = await searchCommons(search)
  candidatesById.set(id, [...(own ? [own] : []), ...hits.filter((h) => h !== own)])
}
const known = await describe([...new Set([...candidatesById.values()].flat())])
for (const [id, names] of candidatesById) {
  const options = names.map((n) => known.get(n.replace(/_/g, ' '))).filter((c): c is Candidate => Boolean(c) && c!.licensed)
  const wide = options.find(isWide) ?? [...options].filter((c) => c.width > c.height).sort((a, b) => b.width - a.width)[0]
  const chosen = wide ?? [...options].sort((a, b) => b.width - a.width)[0]
  if (!chosen) continue
  fileById.set(id, chosen.file)
  if (chosen.file !== names[0] || !articleById.has(id)) articleById.delete(id)
}

const files = [...new Set(fileById.values())]
const infoPages: any[] = []
const normalised = new Map<string, string>()
for (let i = 0; i < files.length; i += 40) {
  const info = await api('commons.wikimedia.org', { action: 'query', titles: files.slice(i, i + 40).map((f) => 'File:' + f).join('|'), prop: 'imageinfo', iiprop: 'url|extmetadata|size', iiurlwidth: '2000' })
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
      width: image.width,
      height: image.height,
      author: stripTags(meta.Artist?.value ?? 'Unknown author').slice(0, 80),
      licence,
      licenceUrl: meta.LicenseUrl?.value ?? null,
      filePage: image.descriptionurl,
      article: articleById.get(id) ? `https://en.wikipedia.org/wiki/${encodeURIComponent(articleById.get(id)!.replace(/ /g, '_'))}` : null,
    }
  }
}

mkdirSync('public/places', { recursive: true })
const SIZES: Array<[suffix: string, width: number, quality: string]> = [['', 1600, '80'], ['-medium', 960, '78'], ['-small', 480, '76']]
for (const [id, photo] of Object.entries(result) as Array<[string, any]>) {
  const paths = SIZES.map(([suffix]) => `public/places/${id}${suffix}.jpg`)
  if (paths.some((path) => !existsSync(path))) {
    await new Promise((resolve) => setTimeout(resolve, 900))
    const response = await fetch(photo.source, { headers: { 'User-Agent': USER_AGENT } })
    if (!response.ok) { console.log(`  could not download ${id}: ${response.status}`); delete result[id]; continue }
    const original = `public/places/${id}-original.jpg`
    writeFileSync(original, Buffer.from(await response.arrayBuffer()))
    const sourceWidth = Math.min(photo.width, 2000)
    for (const [suffix, width, quality] of SIZES) {
      const target = `public/places/${id}${suffix}.jpg`
      execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', quality, '--resampleWidth', String(Math.min(width, sourceWidth)), original, '--out', target], { stdio: 'ignore' })
      if (statSync(target).size > width * 300) execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '70', target, '--out', target], { stdio: 'ignore' })
    }
    unlinkSync(original)
  }
  photo.url = `/places/${id}.jpg` + stamp(`public/places/${id}.jpg`)
  photo.medium = `/places/${id}-medium.jpg` + stamp(`public/places/${id}-medium.jpg`)
  photo.small = `/places/${id}-small.jpg` + stamp(`public/places/${id}-small.jpg`)
}

writeFileSync('src/features/places/placePhotos.json', JSON.stringify(result, null, 2) + '\n')
const missing = Object.keys(ARTICLES).filter((id) => !result[id])
console.log(`Saved ${Object.keys(result).length} of ${Object.keys(ARTICLES).length} photos.`, missing.length ? 'No free photo found for: ' + missing.join(', ') : '')
