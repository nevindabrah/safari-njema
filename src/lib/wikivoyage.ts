// Reads a Wikivoyage town page and finds the entry for one place, by name or by lying within 150 metres of it.
// Exists as the second free source of place descriptions: Wikivoyage lists the restaurants, hotels and sights that Wikipedia has no article for.
import type { WikipediaSummary } from './wikipedia'

export interface VoyageListing {
  kind: string
  name: string
  content: string
  lat: number | null
  lng: number | null
}

const COUNTY_PAGES: Record<string, string[]> = {
  Nairobi: ['Nairobi'], Kiambu: ['Nairobi'], Machakos: ['Nairobi'], Kajiado: ['Nairobi', 'Amboseli National Park'],
  Mombasa: ['Mombasa'], Kwale: ['Diani Beach', 'Ukunda'], Kilifi: ['Malindi', 'Watamu', 'Kilifi'], Lamu: ['Lamu'], 'Taita-Taveta': ['Tsavo East National Park', 'Tsavo West National Park'],
  Nakuru: ['Nakuru', 'Naivasha'], Narok: ['Maasai Mara National Reserve'], Laikipia: ['Nanyuki'], Nyeri: ['Nyeri'], Meru: ['Meru'],
  Kisumu: ['Kisumu'], 'Uasin Gishu': ['Eldoret'], Kakamega: ['Kakamega'], Samburu: ['Samburu National Reserve'], Isiolo: ['Isiolo'],
}

const REGION_PAGES: Record<string, string[]> = {
  nairobi: ['Nairobi'],
  coast: ['Mombasa', 'Diani Beach', 'Malindi', 'Watamu', 'Lamu'],
  rift_valley_mara: ['Nakuru', 'Naivasha', 'Maasai Mara National Reserve'],
  central_mt_kenya: ['Nanyuki', 'Nyeri', 'Mount Kenya'],
  western_lake: ['Kisumu', 'Eldoret', 'Kakamega'],
  north: ['Samburu National Reserve', 'Isiolo'],
}

export function wikivoyagePagesFor(county: string | null, region: string | null): string[] {
  const fromCounty = county ? COUNTY_PAGES[county.replace(/ County$/, '')] ?? [county.replace(/ County$/, '')] : []
  const fromRegion = region ? REGION_PAGES[region] ?? [] : []
  return [...new Set([...fromCounty, ...fromRegion])].slice(0, 4)
}

export function wikivoyagePageUrl(title: string): string {
  const params = new URLSearchParams({ action: 'query', format: 'json', origin: '*', redirects: '1', prop: 'revisions', rvprop: 'content', rvslots: 'main', titles: title })
  return `https://en.wikivoyage.org/w/api.php?${params.toString()}`
}

export function wikitextOf(reply: unknown): string | null {
  const pages = (reply as { query?: { pages?: Record<string, { revisions?: Array<{ slots?: { main?: { '*'?: string } } }> }> } })?.query?.pages
  if (!pages) return null
  return Object.values(pages)[0]?.revisions?.[0]?.slots?.main?.['*'] ?? null
}

export function cleanWikitext(text: string): string {
  return text
    .replace(/<ref[^>]*>.*?<\/ref>/gs, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\{\{[^{}]*\}\}/g, '')
    .replace(/\[\[[^\]|]*\|([^\]]*)\]\]/g, '$1')
    .replace(/\[\[([^\]]*)\]\]/g, '$1')
    .replace(/\[https?:\/\/\S+\s+([^\]]*)\]/g, '$1')
    .replace(/\[https?:\/\/\S+\]/g, '')
    .replace(/'{2,}/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function param(body: string, key: string): string | null {
  const match = new RegExp(`\\|\\s*${key}\\s*=\\s*([\\s\\S]*?)(?=\\n?\\s*\\|\\s*[a-z]+\\s*=|$)`, 'i').exec(body)
  const value = match?.[1]?.trim() ?? ''
  return value.length > 0 ? value : null
}

export function parseListings(wikitext: string): VoyageListing[] {
  const listings: VoyageListing[] = []
  const opener = /\{\{\s*(eat|drink|sleep|see|do|buy|listing)\s*\|/gi
  let match: RegExpExecArray | null
  while ((match = opener.exec(wikitext)) !== null) {
    let depth = 0
    let end = match.index
    for (let i = match.index; i < wikitext.length - 1; i++) {
      if (wikitext.startsWith('{{', i)) { depth++; i++ } else if (wikitext.startsWith('}}', i)) { depth--; i++; if (depth === 0) { end = i + 1; break } }
    }
    const body = wikitext.slice(match.index + match[0].length - 1, end - 2).replace(/\{\{[^{}]*\}\}/g, '')
    const name = param(body, 'name')
    const content = param(body, 'content')
    if (!name || !content) continue
    const lat = Number(param(body, 'lat'))
    const lng = Number(param(body, 'long'))
    listings.push({ kind: match[1].toLowerCase(), name: cleanWikitext(name), content: cleanWikitext(content), lat: Number.isFinite(lat) && lat !== 0 ? lat : null, lng: Number.isFinite(lng) && lng !== 0 ? lng : null })
    opener.lastIndex = end
  }
  return listings
}

const GENERIC = new Set(['the', 'a', 'an', 'of', 'and', 'at', 'in', 'on', 'restaurant', 'hotel', 'lodge', 'cafe', 'bar', 'resort', 'camp', 'club', 'centre', 'center', 'nairobi', 'mombasa', 'kenya'])

function words(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w.length > 0 && !GENERIC.has(w))
}

export function distanceMetres(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(bLat - aLat)
  const dLng = toRad(bLng - aLng)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2
  return 6371000 * 2 * Math.asin(Math.sqrt(h))
}

export const KINDS_FOR: Record<string, string[]> = {
  restaurant: ['eat', 'drink'], hotel: ['sleep'], market: ['buy', 'eat'], museum: ['see', 'do'], park: ['see', 'do'], beach: ['see', 'do'],
  religious_site: ['see'], city: ['see', 'do'], airport: ['listing', 'go'], station: ['listing', 'go'], other: [],
}

export function findListing(listings: VoyageListing[], name: string, lat: number | null, lng: number | null, kinds: string[] | null = null): VoyageListing | null {
  const wanted = words(name)
  if (wanted.length === 0) return null
  const near = (l: VoyageListing) => lat !== null && lng !== null && l.lat !== null && l.lng !== null ? distanceMetres(lat, lng, l.lat, l.lng) : null
  const byName = listings.filter((l) => {
    const have = words(l.name)
    if (have.length === 0) return false
    const [shorter, longer] = have.length <= wanted.length ? [have, wanted] : [wanted, have]
    if (!shorter.every((w) => longer.includes(w))) return false
    const d = near(l)
    return d === null || d < 2000
  })
  if (byName.length > 0) return byName.sort((a, b) => Math.abs(words(a.name).length - wanted.length) - Math.abs(words(b.name).length - wanted.length))[0]
  if (kinds === null) return null
  const close = listings.filter((l) => kinds.includes(l.kind)).map((l) => ({ l, d: near(l) })).filter((x) => x.d !== null && x.d < 150).sort((a, b) => a.d! - b.d!)
  return close[0]?.l ?? null
}

export function trimToSentences(text: string, maxLength = 320): string {
  const sentences = text.match(/[^.!?]+[.!?]+(\s|$)/g)
  if (!sentences) return text.length > maxLength ? text.slice(0, maxLength).trim() : text
  let out = ''
  for (const s of sentences) {
    if (out.length > 0 && (out + s).trim().length > maxLength) break
    out += s
  }
  return out.trim()
}

export function listingSummary(listing: VoyageListing, pageTitle: string): WikipediaSummary {
  const extract = trimToSentences(listing.content)
  return { title: listing.name, extract: extract.charAt(0).toUpperCase() + extract.slice(1), url: `https://en.wikivoyage.org/wiki/${encodeURIComponent(pageTitle.replace(/ /g, '_'))}`, source: 'wikivoyage' }
}
