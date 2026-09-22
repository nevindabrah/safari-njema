// Finds what Wikipedia knows about a place: two sentences and a freely licensed photo. Catalogue places use their saved text; others are looked up live and remembered in the browser.
// Exists so lessons and cards can show what a place is and looks like without an AI key or a paid photo. Undefined means still looking.
import { useEffect, useState } from 'react'
import { commonsImageUrl, pickCommonsImage, pickWikipediaSummary, wikipediaSearchUrl, wikipediaTitleUrl, type WikipediaSummary } from '../../lib/wikipedia'
import type { PlacePhotoInfo } from './photoData'
import { summaryFor } from './summaryData'

export interface PlaceFacts {
  summary: WikipediaSummary | null
  photo: PlacePhotoInfo | null
}

const remembered = new Map<string, PlaceFacts>()
const KEY = 'safari-njema:place-facts:'

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

async function lookUp(name: string, county: string | null): Promise<PlaceFacts> {
  let summary: WikipediaSummary | null = null
  try {
    summary = pickWikipediaSummary(await ask(wikipediaTitleUrl(name)), name) ?? pickWikipediaSummary(await ask(wikipediaSearchUrl(name, county)), name)
  } catch {
    return { summary: null, photo: null }
  }
  if (!summary?.imageFile) return { summary, photo: null }
  try {
    const image = pickCommonsImage(await ask(commonsImageUrl(summary.imageFile)))
    return { summary, photo: image ? { ...image, article: summary.url, illustrative: false, smallWidth: 500, largeWidth: 1920 } : null }
  } catch {
    return { summary, photo: null }
  }
}

export function usePlaceFacts(googlePlaceId: string | null, name: string, county: string | null = null): PlaceFacts | undefined {
  const builtIn = Boolean(googlePlaceId?.startsWith('sample-'))
  const [found, setFound] = useState<PlaceFacts | undefined>(() => (builtIn ? undefined : recall(name)))

  useEffect(() => {
    if (builtIn || !name) return
    const known = recall(name)
    if (known) {
      setFound(known)
      return
    }
    let alive = true
    lookUp(name, county).then((facts) => {
      remember(name, facts)
      if (alive) setFound(facts)
    })
    return () => {
      alive = false
    }
  }, [builtIn, name, county])

  if (builtIn) return { summary: googlePlaceId ? summaryFor(googlePlaceId) : null, photo: null }
  return found
}
