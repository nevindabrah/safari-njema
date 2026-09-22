// Builds the Wikipedia requests for a place and picks a trustworthy summary out of the reply.
// Exists so the lesson can say what a place is in two sentences without an AI key, and so a wrong article is dropped rather than shown.
export interface WikipediaSummary {
  title: string
  extract: string
  url: string
}

const STOP_WORDS = new Set(['the', 'a', 'an', 'and', 'of', 'in', 'at', 'on', 'for', 'to', 'de', 'la'])

const EXTRACT_PARAMS = {
  action: 'query', format: 'json', origin: '*', redirects: '1',
  prop: 'extracts|info', inprop: 'url', exintro: '1', explaintext: '1', exsentences: '2',
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
  const pages = (reply as { query?: { pages?: Record<string, { title?: string; extract?: string; fullurl?: string; missing?: string }> } })?.query?.pages
  if (!pages) return null
  const page = Object.values(pages)[0]
  if (!page?.title || !page.extract || !page.fullurl || page.missing !== undefined) return null
  const extract = page.extract.replace(/\s+/g, ' ').trim()
  if (extract.length < 40 || /may refer to|may also refer to/i.test(extract)) return null
  if (!titleFitsPlace(page.title, placeName)) return null
  return { title: page.title, extract, url: page.fullurl }
}
