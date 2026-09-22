// Searches the place catalogue by what someone wants to do, not only by a place's name.
// Exists because nobody should need to know a restaurant's name to find somewhere to eat. It also forgives small typos.
import { editDistance } from './checkTyped'

export interface SearchablePlace {
  name: string
  address: string
  county: string | null
  placeType: string
  region: string
}

export const TYPE_WORDS: Record<string, string[]> = {
  restaurant: ['food', 'eat', 'eating', 'restaurant', 'restaurants', 'dinner', 'lunch', 'breakfast', 'meal', 'hungry', 'cafe', 'drink', 'nyama', 'choma', 'seafood', 'fish'],
  market: ['market', 'markets', 'shop', 'shopping', 'buy', 'souvenir', 'souvenirs', 'gifts', 'crafts', 'beads', 'bargain', 'mall'],
  park: ['safari', 'animals', 'wildlife', 'game', 'drive', 'nature', 'park', 'parks', 'reserve', 'forest', 'hike', 'hiking', 'lions', 'elephants', 'giraffe', 'giraffes', 'lake', 'mountain', 'outdoors'],
  beach: ['beach', 'beaches', 'swim', 'swimming', 'sea', 'ocean', 'sand', 'snorkel', 'sun'],
  hotel: ['hotel', 'hotels', 'stay', 'sleep', 'lodge', 'lodging', 'room', 'accommodation', 'resort'],
  airport: ['airport', 'airports', 'fly', 'flight', 'flying', 'plane', 'arrive', 'arrival', 'departure'],
  station: ['train', 'trains', 'station', 'railway', 'sgr', 'bus', 'transport', 'travel'],
  city: ['city', 'cities', 'town', 'towns', 'downtown', 'urban', 'walk'],
  religious_site: ['mosque', 'church', 'cathedral', 'pray', 'prayer', 'worship', 'religion', 'faith'],
  museum: ['museum', 'museums', 'history', 'culture', 'cultural', 'landmark', 'fort', 'ruins', 'heritage', 'art', 'sightseeing'],
}

const REGION_WORDS: Record<string, string[]> = {
  nairobi: ['nairobi', 'capital'],
  coast: ['coast', 'coastal', 'seaside'],
  rift_valley_mara: ['rift', 'valley', 'mara'],
  central_mt_kenya: ['central', 'highlands'],
  western_lake: ['western', 'victoria'],
  north: ['north', 'northern'],
}

function wordsOf(text: string): string[] {
  return text.toLowerCase().split(/[^a-z0-9']+/).filter(Boolean)
}

function matches(queryWord: string, placeWord: string, fuzzyFrom: number): boolean {
  if (placeWord.startsWith(queryWord)) return true
  if (queryWord.length < fuzzyFrom) return false
  const allowed = queryWord.length >= 8 ? 2 : 1
  return editDistance(queryWord, placeWord.slice(0, queryWord.length + 1)) <= allowed || editDistance(queryWord, placeWord) <= allowed
}

export function searchPlaces<T extends SearchablePlace>(places: T[], query: string): T[] {
  const queryWords = wordsOf(query).filter((w) => w.length >= 2 && !['in', 'at', 'to', 'the', 'near', 'for', 'and', 'of'].includes(w))
  if (queryWords.length === 0) return []
  const scored: Array<{ place: T; score: number; index: number }> = []
  places.forEach((place, index) => {
    const nameWords = wordsOf(`${place.name} ${place.address} ${place.county ?? ''}`)
    const kindWords = [...(TYPE_WORDS[place.placeType] ?? []), ...(REGION_WORDS[place.region] ?? [])]
    let score = 0
    for (const word of queryWords) {
      if (nameWords.some((w) => matches(word, w, 5))) score += 3
      else if (kindWords.some((w) => matches(word, w, 7))) score += 1
      else return
    }
    scored.push({ place, score, index })
  })
  return scored.sort((a, b) => b.score - a.score || a.index - b.index).map((s) => s.place)
}

export const CATEGORIES: Array<{ key: string; label: string; types: string[] }> = [
  { key: 'nature', label: 'Safari and nature', types: ['park'] },
  { key: 'beach', label: 'Beaches', types: ['beach'] },
  { key: 'food', label: 'Food', types: ['restaurant'] },
  { key: 'market', label: 'Markets and shops', types: ['market'] },
  { key: 'town', label: 'Towns', types: ['city'] },
  { key: 'culture', label: 'Culture and history', types: ['museum', 'religious_site'] },
  { key: 'stay', label: 'Places to stay', types: ['hotel'] },
  { key: 'travel', label: 'Getting around', types: ['airport', 'station'] },
]
