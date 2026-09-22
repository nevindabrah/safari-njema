// Tests for the Wikipedia request and the guard that drops articles about the wrong thing.
// Exists because a wrong two-sentence description at the top of a lesson would be worse than none.
import { describe, expect, it } from 'vitest'
import { pickWikipediaSummary, titleFitsPlace, wikipediaSearchUrl, wikipediaTitleUrl } from './wikipedia'

const reply = (title: string, extract: string) => ({ query: { pages: { '1': { title, extract, fullurl: `https://en.wikipedia.org/wiki/${title.replace(/ /g, '_')}` } } } })

describe('wikipediaTitleUrl', () => {
  it('asks for the article with exactly that title, following redirects', () => {
    const url = new URL(wikipediaTitleUrl('Karura Forest'))
    expect(url.searchParams.get('titles')).toBe('Karura Forest')
    expect(url.searchParams.get('redirects')).toBe('1')
  })
})

describe('wikipediaSearchUrl', () => {
  it('asks for a two sentence plain text intro of the best search hit, with the county to steer it', () => {
    const url = new URL(wikipediaSearchUrl('Karura Forest', 'Nairobi County'))
    expect(url.origin).toBe('https://en.wikipedia.org')
    expect(url.searchParams.get('gsrsearch')).toBe('"Karura Forest" Nairobi')
    expect(url.searchParams.get('exsentences')).toBe('2')
    expect(url.searchParams.get('explaintext')).toBe('1')
    expect(url.searchParams.get('origin')).toBe('*')
  })
  it('adds Kenya when the county is unknown', () => {
    expect(new URL(wikipediaSearchUrl('Diani Beach', null)).searchParams.get('gsrsearch')).toBe('"Diani Beach" Kenya')
  })
})

describe('titleFitsPlace', () => {
  it('accepts a title that holds every word of the place name, in any order, with extra words allowed', () => {
    expect(titleFitsPlace('Karura Forest', 'Karura Forest')).toBe(true)
    expect(titleFitsPlace('Fort Jesus (Mombasa)', 'Fort Jesus')).toBe(true)
    expect(titleFitsPlace('Carnivore (restaurant)', 'Carnivore Restaurant')).toBe(true)
    expect(titleFitsPlace('Ruins of Gedi', 'Gedi Ruins')).toBe(true)
    expect(titleFitsPlace('Karen Blixen Museum, Kenya', 'Karen Blixen Museum')).toBe(true)
    expect(titleFitsPlace('The Village Market', 'Village Market')).toBe(true)
  })
  it('rejects an article about something else that shares a word, or a broader one', () => {
    expect(titleFitsPlace('Maasai people', 'Maasai Market')).toBe(false)
    expect(titleFitsPlace('Nairobi', 'Nairobi National Park')).toBe(false)
    expect(titleFitsPlace('Giraffe Manor', 'Giraffe Centre')).toBe(false)
    expect(titleFitsPlace('Nakuru', 'Lake Nakuru National Park')).toBe(false)
    expect(titleFitsPlace('Kisumu', 'Dunga Beach')).toBe(false)
  })
})

describe('pickWikipediaSummary', () => {
  it('returns the title, the tidied extract and the article link', () => {
    const got = pickWikipediaSummary(reply('Karura Forest', 'Karura Forest is an urban forest in Nairobi.  It is the second largest urban forest in the world.'), 'Karura Forest')
    expect(got).toEqual({ title: 'Karura Forest', extract: 'Karura Forest is an urban forest in Nairobi. It is the second largest urban forest in the world.', url: 'https://en.wikipedia.org/wiki/Karura_Forest' })
  })
  it('drops disambiguation pages, empty replies and articles that do not fit the place', () => {
    expect(pickWikipediaSummary(reply('Diani', 'Diani may refer to: Diani Beach, a beach in Kenya; Diani, a village in Greece.'), 'Diani Beach')).toBeNull()
    expect(pickWikipediaSummary({ batchcomplete: '' }, 'Diani Beach')).toBeNull()
    expect(pickWikipediaSummary(reply('Maasai people', 'The Maasai are a Nilotic ethnic group inhabiting northern, central and southern Kenya and northern Tanzania.'), 'Maasai Market')).toBeNull()
    expect(pickWikipediaSummary(reply('Karura Forest', 'Short.'), 'Karura Forest')).toBeNull()
    expect(pickWikipediaSummary({ query: { pages: { '-1': { title: 'Mama Oliech Restaurant', missing: '' } } } }, 'Mama Oliech Restaurant')).toBeNull()
  })
})
