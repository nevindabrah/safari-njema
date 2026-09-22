// Finds a freely licensed, wide, high resolution photo for each dish on the food page, or the exact Commons file named in dishes.ts, and saves it in three sizes with its credit.
// Exists for the same reason as fetchPlacePhotos.ts: the site serves its own photos and never depends on a live lookup.
// Run: node scripts/fetchDishPhotos.ts   (a search and one download per dish. Needs macOS for sips.)
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, statSync, unlinkSync, writeFileSync } from 'node:fs'

const USER_AGENT = 'SafariNjema/1.0 (student project; https://github.com/nevindabrah/safari-njema)'
const MIN_WIDE = 1200
const SIZES: Array<[suffix: string, width: number, quality: string]> = [['', 1600, '80'], ['-medium', 960, '78'], ['-small', 480, '76']]

const source = readFileSync('src/features/food/dishes.ts', 'utf8')
const dishes = [...source.matchAll(/id: '([^']+)'[^\n]*?search: '([^']+)'(?:, photo: '((?:[^'\\]|\\.)*)')?/g)].map((m) => ({ id: m[1], search: m[2], photo: m[3]?.replace(/\\'/g, "'") }))

async function api(params: Record<string, string>) {
  const url = 'https://commons.wikimedia.org/w/api.php?' + new URLSearchParams({ format: 'json', formatversion: '2', ...params })
  const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
  if (!response.ok) throw new Error(`Commons answered ${response.status}`)
  return response.json()
}
const stripTags = (html: string) => html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim()

const result: Record<string, unknown> = {}
mkdirSync('public/dishes', { recursive: true })
for (const dish of dishes) {
  if (dish.photo === 'none') { console.log(`  ${dish.id}: no photo by choice`); continue }
  await new Promise((resolve) => setTimeout(resolve, 1200))
  const found = dish.photo ? null : await api({ action: 'query', list: 'search', srnamespace: '6', srsearch: `${dish.search} filetype:bitmap`, srlimit: '12' })
  const titles = dish.photo ? ['File:' + dish.photo] : (found.query.search as Array<{ title: string }>).map((r) => r.title).filter((t) => /\.jpe?g$/i.test(t))
  if (titles.length === 0) { console.log(`  nothing for ${dish.id}`); continue }
  const info = await api({ action: 'query', titles: titles.join('|'), prop: 'imageinfo', iiprop: 'url|size|extmetadata', iiurlwidth: '2000' })
  const options = (info.query.pages as any[])
    .map((p) => p.imageinfo?.[0])
    .filter((i) => i && i.extmetadata?.LicenseShortName?.value && !/^(All rights reserved|Fair use)/i.test(i.extmetadata.LicenseShortName.value))
  const wide = options.filter((i) => i.width > i.height && i.width >= MIN_WIDE).sort((a, b) => b.width - a.width)[0]
  const chosen = wide ?? options.filter((i) => i.width > i.height).sort((a, b) => b.width - a.width)[0] ?? options.sort((a, b) => b.width - a.width)[0]
  if (!chosen) { console.log(`  no licensed photo for ${dish.id}`); continue }
  const paths = SIZES.map(([suffix]) => `public/dishes/${dish.id}${suffix}.jpg`)
  if (paths.some((path) => !existsSync(path))) {
    await new Promise((resolve) => setTimeout(resolve, 900))
    const response = await fetch(String(chosen.thumburl).split('?')[0], { headers: { 'User-Agent': USER_AGENT } })
    if (!response.ok) { console.log(`  could not download ${dish.id}: ${response.status}`); continue }
    const original = `public/dishes/${dish.id}-original.jpg`
    writeFileSync(original, Buffer.from(await response.arrayBuffer()))
    const sourceWidth = Math.min(chosen.width, 2000)
    for (const [suffix, width, quality] of SIZES) {
      const target = `public/dishes/${dish.id}${suffix}.jpg`
      execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', quality, '--resampleWidth', String(Math.min(width, sourceWidth)), original, '--out', target], { stdio: 'ignore' })
      if (statSync(target).size > width * 300) execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '70', target, '--out', target], { stdio: 'ignore' })
    }
    unlinkSync(original)
  }
  const meta = chosen.extmetadata
  result[dish.id] = {
    url: `/dishes/${dish.id}.jpg`, medium: `/dishes/${dish.id}-medium.jpg`, small: `/dishes/${dish.id}-small.jpg`,
    author: stripTags(meta.Artist?.value ?? 'Unknown author').slice(0, 80), licence: meta.LicenseShortName.value, licenceUrl: meta.LicenseUrl?.value ?? null, filePage: chosen.descriptionurl, width: chosen.width, height: chosen.height,
  }
  console.log(`  ${dish.id}: ${chosen.width}x${chosen.height} ${meta.LicenseShortName.value}`)
}
writeFileSync('src/features/food/dishPhotos.json', JSON.stringify(result, null, 2) + '\n')
console.log(`Saved ${Object.keys(result).length} of ${dishes.length} dish photos.`)
