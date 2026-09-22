// Finds the Wikipedia description of a place: the saved one for catalogue places, a live lookup for places found on Google Maps.
// Exists so lessons and the add card can say what a place is without an AI key. Undefined means still looking; null means no fitting article.
import { useEffect, useState } from 'react'
import { pickWikipediaSummary, wikipediaSearchUrl, wikipediaTitleUrl, type WikipediaSummary } from '../../lib/wikipedia'
import { summaryFor } from './summaryData'

const remembered = new Map<string, WikipediaSummary | null>()

async function lookUp(name: string, county: string | null): Promise<WikipediaSummary | null> {
  for (const url of [wikipediaTitleUrl(name), wikipediaSearchUrl(name, county)]) {
    try {
      const summary = pickWikipediaSummary(await fetch(url).then((r) => r.json()), name)
      if (summary) return summary
    } catch {
      return null
    }
  }
  return null
}

export function useWikipediaSummary(googlePlaceId: string | null, name: string, county: string | null = null): WikipediaSummary | null | undefined {
  const saved = googlePlaceId ? summaryFor(googlePlaceId) : null
  const builtIn = Boolean(googlePlaceId?.startsWith('sample-'))
  const [found, setFound] = useState<WikipediaSummary | null | undefined>(() => (remembered.has(name) ? remembered.get(name) : undefined))

  useEffect(() => {
    if (saved || builtIn || !name) return
    if (remembered.has(name)) {
      setFound(remembered.get(name) ?? null)
      return
    }
    let alive = true
    lookUp(name, county).then((summary) => {
      remembered.set(name, summary)
      if (alive) setFound(summary)
    })
    return () => {
      alive = false
    }
  }, [saved, builtIn, name, county])

  return saved ?? (builtIn ? null : found)
}
