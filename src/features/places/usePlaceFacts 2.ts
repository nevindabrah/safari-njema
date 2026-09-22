// Finds what the free travel sources know about a place: two sentences from Wikipedia or Wikivoyage, and a freely licensed photo. Catalogue places use their saved text; others are looked up live and remembered in the browser.
// Exists so lessons and cards can show what a place is and looks like without an AI key or a paid photo. Undefined means still looking.
import { useEffect, useState } from 'react'
import { commonsImageUrl, pickCommonsImage, pickWikipediaSummary, wikipediaSearchUrl, wikipediaTitleUrl, type WikipediaSummary } from '../../lib/wikipedia'
import { KINDS_FOR, findListing, listingSummary, parseListings, wikitextOf, wikivoyagePagesFor, wikivoyagePageUrl } from '../../lib/wikivoyage'
import type { PlacePhotoInfo } from './photoData'
import { summaryFor } from './summaryData'

export interface PlaceFacts {
  summary: WikipediaSummary | null
  photo: PlacePhotoInfo | null
}

export interface Whereabouts {
  county?: string | null
  region?: string | null
  lat?: number | null
  lng?: number | null
  placeType?: string | null
}

const remembered = new Map<string, PlaceFacts>()
const pages = new Map<string, Promise<string | null>>()
const KEY = 'safari-njema:place-facts:v2:'

function recall(name: string): PlaceFacts | undefined {
  if (remembered.has(name)) return remembered.get(name)
  try {
    const raw = localStorage.getItem(KEY + name)
    if (raw) {
      const facts = JSON.parse(raw) as PlaceFacts
      remembered.set(name, facts)
      return facts
    }
  } catch {
    return undefined
  }
  return undefined
}

function remember(name: string, facts: PlaceFacts) {
  remembered.set(name, facts)
  try {
    localStorage.setItem(KEY + name, JSON.stringify(facts))
  } catch {
    return
  }
}

async function ask(url: string): Promise<unknown> {
  return fetch(url).then((r) => r.json())
}

async function fromWikipedia(name: string, county: string | null): Promise<WikipediaSummary | null> {
  try {
    return pickWikipediaSummary(await ask(wikipediaTitleUrl(name)), name) ?? pickWikipediaSummary(await ask(wikipediaSearchUrl(name, county)), name)
  } catch {
    return null
  }
}

function pageText(title: string): Promise<string | null> {
  if (!pages.has(title)) pages.set(title, ask(wikivoyagePageUrl(title)).then(wikitextOf).catch(() => null))
  return pages.get(title)!
}

async function fromWikivoyage(name: string, where: Whereabouts): Promise<WikipediaSummary | null> {
  for (const title of wikivoyagePagesFor(where.county ?? null, where.region ?? null)) {
    const text = await pageText(title)
    if (!text) continue
    const listing = findListing(parseListings(text), name, where.lat ?? null, where.lng ?? null, where.placeType ? KINDS_FOR[where.placeType] ?? [] : null)
    if (listing) return listingSummary(listing, title)
  }
  return null
}

async function photoFor(summary: WikipediaSummary): Promise<PlacePhotoInfo | null> {
  if (!summary.imageFile) return null
  try {
    const image = pickCommonsImage(await ask(commonsImageUrl(summary.imageFile)))
    return image ? { ...image, article: summary.url, illustrative: false, smallWidth: 500, largeWidth: 1920 } : null
  } catch {
    return null
  }
}

async function lookUp(name: string, where: Whereabouts): Promise<PlaceFacts> {
  const wikipedia = await fromWikipedia(name, where.county ?? null)
  if (wikipedia) return { summary: { ...wikipedia, source: 'wikipedia' }, photo: await photoFor(wikipedia) }
  return { summary: await fromWikivoyage(name, where), photo: null }
}

export function usePlaceFacts(googlePlaceId: string | null, name: string, where: Whereabouts = {}): PlaceFacts | undefined {
  const builtIn = Boolean(googlePlaceId?.startsWith('sample-'))
  const { county = null, region = null, lat = null, lng = null, placeType = null } = where
  const [found, setFound] = useState<PlaceFacts | undefined>(() => (builtIn ? undefined : recall(name)))

  useEffect(() => {
    if (builtIn || !name) return
    const known = recall(name)
    if (known) {
      setFound(known)
      return
    }
    let alive = true
    lookUp(name, { county, region, lat, lng, placeType }).then((facts) => {
      remember(name, facts)
      if (alive) setFound(facts)
    })
    return () => {
      alive = false
    }
  }, [builtIn, name, county, region, lat, lng, placeType])

  if (builtIn) return { summary: googlePlaceId ? summaryFor(googlePlaceId) : null, photo: null }
  return found
}
