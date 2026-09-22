// Tests for reading Wikivoyage entries and matching one to a place.
// Exists because a listing matched to the wrong business would describe somewhere the student is not going.
import { describe, expect, it } from 'vitest'
import { cleanWikitext, findListing, listingSummary, parseListings, trimToSentences, wikivoyagePagesFor, wikivoyagePageUrl } from './wikivoyage'

const page = `
==Eat==
* {{eat
| name=The Carnivore | alt= | url=https://tamarind.co.ke/ | email=
| address=Langata Link Road | lat=-1.3289 | long=36.8008 | directions=
| content=Just outside the city, close to the [[Uhuru Gardens]] along Lang'Ata road, it is a ''luxury'' restaurant famous for its meats. Reservations might be a good idea.{{dead link|date=2024}} Ask at your hotel.
}}
* {{eat | name=Furusato | lat=-1.27 | long=36.81 | content=Japanese food. }}
* {{sleep
| name=Sarova Stanley | address=Kenyatta Avenue | lat=-1.2838 | long=36.8219
| content=This over 100-year-old hotel has been renovated back to its Victorian style. In the city's shopping district.
}}
* {{see | name=Nothing here | content= }}
`

describe('parseListings', () => {
  it('reads the name, coordinates and cleaned text of every entry that has text', () => {
    const got = parseListings(page)
    expect(got.map((l) => l.name)).toEqual(['The Carnivore', 'Furusato', 'Sarova Stanley'])
    expect(got[0].kind).toBe('eat')
    expect(got[0].lat).toBeCloseTo(-1.3289)
    expect(got[0].lng).toBeCloseTo(36.8008)
    expect(got[0].content).toBe("Just outside the city, close to the Uhuru Gardens along Lang'Ata road, it is a luxury restaurant famous for its meats. Reservations might be a good idea. Ask at your hotel.")
  })
})

describe('cleanWikitext', () => {
  it('turns links, emphasis and templates into plain text', () => {
    expect(cleanWikitext("A [[Nairobi|city]] with '''bold''' and <ref>x</ref> {{note}} [http://x.y a site] here")).toBe('A city with bold and a site here')
  })
})

describe('findListing', () => {
  const listings = parseListings(page)
  it('matches by name whether the place name is longer or shorter than the entry', () => {
    expect(findListing(listings, 'Carnivore Restaurant', -1.3289, 36.8008)?.name).toBe('The Carnivore')
    expect(findListing(listings, 'Sarova Stanley Hotel', null, null)?.name).toBe('Sarova Stanley')
  })
  it('falls back to the nearest entry within 150 metres only when asked, and only of a fitting kind', () => {
    expect(findListing(listings, 'Some Other Name', -1.2839, 36.8220, ['sleep'])?.name).toBe('Sarova Stanley')
    expect(findListing(listings, 'Some Other Name', -1.2839, 36.8220, ['eat'])).toBeNull()
    expect(findListing(listings, 'Some Other Name', -1.2839, 36.8220)).toBeNull()
    expect(findListing(listings, 'Some Other Name', -1.30, 36.80, ['sleep'])).toBeNull()
  })
  it('refuses a name match that is kilometres away', () => {
    expect(findListing(listings, 'Furusato', -4.0, 39.6)).toBeNull()
  })
})

describe('trimToSentences', () => {
  it('keeps whole sentences up to the limit', () => {
    expect(trimToSentences('One. Two. Three.', 9)).toBe('One. Two.')
    expect(trimToSentences('Short')).toBe('Short')
  })
})

describe('pages and links', () => {
  it('picks town pages from the county first, then the region', () => {
    expect(wikivoyagePagesFor('Kwale County', 'coast')).toEqual(['Diani Beach', 'Ukunda', 'Mombasa', 'Malindi'])
    expect(wikivoyagePagesFor(null, 'nairobi')).toEqual(['Nairobi'])
    expect(wikivoyagePagesFor('Nyandarua County', null)).toEqual(['Nyandarua'])
  })
  it('asks for the page text and links the summary to the page', () => {
    expect(new URL(wikivoyagePageUrl('Diani Beach')).searchParams.get('titles')).toBe('Diani Beach')
    const summary = listingSummary(parseListings(page)[0], 'Nairobi')
    expect(summary.source).toBe('wikivoyage')
    expect(listingSummary({ kind: 'eat', name: 'X', content: 'set in a cave. Lovely.', lat: null, lng: null }, 'Diani Beach').extract).toBe('Set in a cave. Lovely.')
    expect(summary.url).toBe('https://en.wikivoyage.org/wiki/Nairobi')
  })
})
