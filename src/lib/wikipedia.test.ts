// Tests for the Wikipedia request and the guard that drops articles about the wrong thing.
// Exists because a wrong two-sentence description at the top of a lesson would be worse than none.
import { describe, expect, it } from 'vitest'
import { commonsImageUrl, pickCommonsImage, pickWikipediaSummary, titleFitsPlace, wikipediaSearchUrl, wikipediaTitleUrl } from './wikipedia'

const reply = (title: string, extract: string, pageimage?: string) => ({ query: { pages: { '1': { title, extract, pageimage, fullurl: `https://en.wikipedia.org/wiki/${title.replace(/ /g, '_')}` } } } })

const image = (over: Record<string, unknown> = {}, meta: Record<string, string> = {}) => ({ query: { pages: { '9': { imageinfo: [{
  url: 'https://upload.wikimedia.org/wikipedia/commons/3/3f/Java_Coffee.jpg?utm_source=commons&utm_campaign=imageinfo',
  thumburl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Java_Coffee.jpg/1920px-Java_Coffee.jpg?utm_source=commons',
  descriptionurl: 'https://commons.wikimedia.org/wiki/File:Java_Coffee.jpg',
  width: 5627, height: 4064,
  extmetadata: { Artist: { value: '<a href="//commons.wikimedia.org/wiki/User:Kihara">Kihara wa kigo</a>' }, LicenseShortName: { value: 'CC BY-SA 4.0' }, LicenseUrl: { value: 'https://creativecommons.org/licenses/by-sa/4.0' }, ...Object.fromEntries(Object.entries(meta).map(([k, v]) => [k, { value: v }])) },
  ...over,
}] } } } })

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
    expect(url.searchParams.get('prop')).toContain('pageimages')
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
    expect(got).toEqual({ title: 'Karura Forest', extract: 'Karura Forest is an urban forest in Nairobi. It is the second largest urban forest in the world.', url: 'https://en.wikipedia.org/wiki/Karura_Forest', imageFile: null })
    expect(pickWikipediaSummary(reply('Java House', 'Java House is a coffee house chain based in Nairobi, Kenya. It was founded in 1999.', 'Java_Coffee.jpg'), 'Java House')?.imageFile).toBe('Java_Coffee.jpg')
  })
  it('drops disambiguation pages, empty replies and articles that do not fit the place', () => {
    expect(pickWikipediaSummary(reply('Diani', 'Diani may refer to: Diani Beach, a beach in Kenya; Diani, a village in Greece.'), 'Diani Beach')).toBeNull()
    expect(pickWikipediaSummary({ batchcomplete: '' }, 'Diani Beach')).toBeNull()
    expect(pickWikipediaSummary(reply('Maasai people', 'The Maasai are a Nilotic ethnic group inhabiting northern, central and southern Kenya and northern Tanzania.'), 'Maasai Market')).toBeNull()
    expect(pickWikipediaSummary(reply('Karura Forest', 'Short.'), 'Karura Forest')).toBeNull()
    expect(pickWikipediaSummary({ query: { pages: { '-1': { title: 'Mama Oliech Restaurant', missing: '' } } } }, 'Mama Oliech Restaurant')).toBeNull()
  })
})

describe('commonsImageUrl', () => {
  it('asks Commons for the file, its size, its licence and a 1600 pixel copy', () => {
    const url = new URL(commonsImageUrl('Java_Coffee.jpg'))
    expect(url.origin).toBe('https://commons.wikimedia.org')
    expect(url.searchParams.get('titles')).toBe('File:Java_Coffee.jpg')
    expect(url.searchParams.get('iiurlwidth')).toBe('1920')
  })
})

describe('pickCommonsImage', () => {
  it('returns the three widths Wikimedia serves, the author as plain text and the licence', () => {
    const got = pickCommonsImage(image())
    expect(got?.url).toBe('https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Java_Coffee.jpg/1920px-Java_Coffee.jpg')
    expect(got?.medium).toBe('https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Java_Coffee.jpg/960px-Java_Coffee.jpg')
    expect(got?.small).toBe('https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Java_Coffee.jpg/500px-Java_Coffee.jpg')
    expect(got?.author).toBe('Kihara wa kigo')
    expect(got?.licence).toBe('CC BY-SA 4.0')
    expect(got?.filePage).toBe('https://commons.wikimedia.org/wiki/File:Java_Coffee.jpg')
    expect(got?.source).toBe('https://upload.wikimedia.org/wikipedia/commons/3/3f/Java_Coffee.jpg')
  })
  it('drops images that are not free, too small, not photos, or missing', () => {
    expect(pickCommonsImage(image({}, { LicenseShortName: 'Fair use' }))).toBeNull()
    expect(pickCommonsImage(image({ width: 500, height: 300 }))).toBeNull()
    expect(pickCommonsImage(image({ url: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Map.svg' }))).toBeNull()
    expect(pickCommonsImage({ query: { pages: { '-1': { missing: '' } } } })).toBeNull()
  })
  it('accepts public domain', () => {
    expect(pickCommonsImage(image({}, { LicenseShortName: 'Public domain' }))?.licence).toBe('Public domain')
  })
})
