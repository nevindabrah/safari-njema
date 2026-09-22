// Builds the Wikipedia and Wikimedia Commons requests for a place, and picks a trustworthy summary and a freely licensed photo out of the replies.
// Exists so the lesson can show what a place is without an AI key or a paid photo, and so a wrong article or an unfree image is dropped rather than shown.
export interface WikipediaSummary {
  title: string
  extract: string
  url: string
  imageFile?: string | null
}

export interface CommonsImage {
  url: string
  medium: string
  small: string
  source: string
  width: number
  height: number
  author: string
  licence: string
  licenceUrl: string | null
  filePage: string
}

const STOP_WORDS = new Set(['the', 'a', 'an', 'and', 'of', 'in', 'at', 'on', 'for', 'to', 'de', 'la'])

const EXTRACT_PARAMS = {
  action: 'query', format: 'json', origin: '*', redirects: '1',
  prop: 'extracts|info|pageimages', inprop: 'url', exintro: '1', explaintext: '1', exsentences: '2', piprop: 'name',
}

export function wikipediaTitleUrl(placeName: string): string {
  const params = new URLSearchParams({ ...EXTRACT_PARAMS, titles: placeName })
  return `https://en.wikipedia.org/w/api.php?${params.toString()}`
}

export function wikipediaSearchUrl(placeName: string, county: string | null): string {
  const search = `"${placeName}" ${county ? county.replace(/ County$/, '') : 'Kenya'}`
  const params = new URLSearchParams({ ...EXTRACT_PARAMS, generator: 'search', gsrsearch: search, gsrlimit: '1', gsrnamespace: '0' })
  return `https://en.wikipedia.org/w/api.php?${params.toString()}`
}

function words(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w.length > 0 && !STOP_WORDS.has(w))
}

export function titleFitsPlace(title: string, placeName: string): boolean {
  const titleWords = words(title)
  const placeWords = words(placeName)
  return placeWords.length > 0 && placeWords.every((w) => titleWords.includes(w))
}

export function pickWikipediaSummary(reply: unknown, placeName: string): WikipediaSummary | null {
  const pages = (reply as { query?: { pages?: Record<string, { title?: string; extract?: string; fullurl?: string; missing?: string; pageimage?: string }> } })?.query?.pages
  if (!pages) return null
  const page = Object.values(pages)[0]
  if (!page?.title || !page.extract || !page.fullurl || page.missing !== undefined) return null
  const extract = page.extract.replace(/\s+/g, ' ').trim()
  if (extract.length < 40 || /may refer to|may also refer to/i.test(extract)) return null
  if (!titleFitsPlace(page.title, placeName)) return null
  return { title: page.title, extract, url: page.fullurl, imageFile: page.pageimage ?? null }
}

export function commonsImageUrl(imageFile: string): string {
  const params = new URLSearchParams({
    action: 'query', format: 'json', origin: '*', titles: `File:${imageFile}`,
    prop: 'imageinfo', iiprop: 'url|extmetadata|size', iiurlwidth: '1920', iiextmetadatafilter: 'Artist|LicenseShortName|LicenseUrl',
  })
  return `https://commons.wikimedia.org/w/api.php?${params.toString()}`
}

const FREE_LICENCE = /^(CC|Public domain|CC0|No restrictions)/i

function plainText(html: string): string {
  return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
}

const WIKIMEDIA_WIDTHS = { small: 500, medium: 960, large: 1920 } as const

function sized(thumbUrl: string, width: number): string {
  return thumbUrl.replace(/\?.*$/, '').replace(/\/\d+px-/, `/${width}px-`)
}

export function pickCommonsImage(reply: unknown): CommonsImage | null {
  type Info = { url?: string; thumburl?: string; descriptionurl?: string; width?: number; height?: number; extmetadata?: Record<string, { value?: string }> }
  const pages = (reply as { query?: { pages?: Record<string, { missing?: string; imageinfo?: Info[] }> } })?.query?.pages
  if (!pages) return null
  const page = Object.values(pages)[0]
  const info = page?.imageinfo?.[0]
  if (!info || page?.missing !== undefined || !info.thumburl || !info.url || !info.descriptionurl) return null
  const source = info.url.replace(/\?.*$/, '')
  if (!/\.(jpe?g|png|webp)$/i.test(source) || (info.width ?? 0) < 600 || (info.height ?? 0) < 400) return null
  const licence = info.extmetadata?.LicenseShortName?.value ?? ''
  if (!FREE_LICENCE.test(licence)) return null
  const author = plainText(info.extmetadata?.Artist?.value ?? '')
  return {
    url: sized(info.thumburl, WIKIMEDIA_WIDTHS.large),
    medium: sized(info.thumburl, WIKIMEDIA_WIDTHS.medium),
    small: sized(info.thumburl, WIKIMEDIA_WIDTHS.small),
    source,
    width: info.width ?? 0,
    height: info.height ?? 0,
    author: author || 'Wikimedia Commons contributor',
    licence,
    licenceUrl: info.extmetadata?.LicenseUrl?.value ?? null,
    filePage: info.descriptionurl,
  }
}
