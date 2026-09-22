// Shared steps for the browser tests: open the demo, and solve any practice exercise using the seed phrases as the answer key.
// Exists so each test reads as the flow it checks, and the answer logic lives in one place.
import { readFileSync } from 'node:fs'
import { expect, type Page } from '@playwright/test'

interface SeedPhrase { swahili: string; english: string; pronunciation: string }
export const BANK: SeedPhrase[] = JSON.parse(readFileSync('supabase/seed/phrases.json', 'utf8'))
const strip = (w: string) => w.replace(/[?!.,]/g, '')

export async function openDemo(page: Page) {
  await page.goto('/')
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
  await page.goto('/')
  await page.getByRole('button', { name: 'Try the live demo' }).click()
  await expect(page).toHaveURL(/\/trip$/)
  await expect(page.getByRole('heading', { name: 'My trip to Kenya' })).toBeVisible()
}

export async function solveOneExercise(page: Page) {
  const instruction = (await page.locator('main p.text-sm.text-muted.mt-4').first().textContent())?.trim() ?? ''
  const promptBox = page.locator('main p.font-display.font-extrabold').first()
  const prompt = (await promptBox.count()) > 0 ? ((await promptBox.textContent()) ?? '').trim() : ''
  const optionTexts = async () => page.locator('main ul li button').evaluateAll((els) => els.map((e) => [...e.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim() || e.textContent!.trim()))
  const clickOption = async (text: string) => {
    const options = await optionTexts()
    const index = options.indexOf(text)
    expect(index, `option "${text}" among ${options.join(' | ')}`).toBeGreaterThanOrEqual(0)
    await page.locator('main ul li button').nth(index).click()
  }
  if (instruction === 'Match each phrase to its meaning') {
    const left = await page.locator('main .grid-cols-2 ul').first().locator('button').allTextContents()
    for (const sw of left.map((t) => t.trim())) {
      await page.locator('main .grid-cols-2 ul').first().getByRole('button', { name: sw, exact: true }).click()
      await page.locator('main .grid-cols-2 ul').nth(1).getByRole('button', { name: BANK.find((p) => p.swahili === sw)!.english, exact: true }).click()
    }
  } else if (instruction === 'Build this in Swahili') {
    for (const word of BANK.find((p) => p.english === prompt)!.swahili.split(' ').map(strip)) {
      await page.locator('main div[lang=sw]').last().getByRole('button', { name: word, exact: true }).first().click()
    }
    await page.getByRole('button', { name: 'Check' }).click()
  } else if (instruction === 'Type this in Swahili') {
    await page.locator('main input[type=text]').fill(BANK.find((p) => p.english === prompt)!.swahili.toLowerCase().replace('?', ''))
    await page.getByRole('button', { name: 'Check' }).click()
  } else if (instruction === 'Listen. What did you hear?') {
    const src = await page.evaluate(() => (window as unknown as { __plays: string[] }).__plays.at(-1) ?? '')
    const manifest = JSON.parse(readFileSync('src/features/audio/audioManifest.json', 'utf8')) as Record<string, string>
    await clickOption(Object.keys(manifest).find((k) => src.endsWith(manifest[k]))!)
  } else {
    let right = ''
    if (instruction === 'What does this mean?') right = BANK.find((p) => p.swahili === prompt)!.english
    else if (instruction === 'How do you say this in Swahili?') right = BANK.find((p) => p.english === prompt)!.swahili
    else if (instruction === 'Which phrase is said like this?') { const options = await optionTexts(); right = BANK.find((p) => p.pronunciation === prompt && options.includes(p.swahili))!.swahili }
    else if (instruction === 'Does it mean this?') { const shown = ((await page.locator('main p.mt-3.text-xl').textContent()) ?? '').trim().slice(1, -1); right = BANK.find((p) => p.swahili === prompt)!.english === shown ? 'Yes, that is what it means' : 'No, it means something else' }
    else if (instruction === 'Which word is missing?') { const english = ((await page.locator('main p.mt-1.text-muted').textContent()) ?? '').trim(); const full = BANK.find((p) => p.english === english)!.swahili.split(' '); right = strip(full[prompt.split(' ').findIndex((w) => w.includes('____'))]) }
    else throw new Error(`Unknown exercise: ${instruction}`)
    await clickOption(right)
  }
  await expect(page.locator('main [role=status] p').first()).toHaveText('Right.')
  await page.getByRole('button', { name: /^(Next|Finish)$/ }).click()
}

export async function trackAudioPlays(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { __plays: string[] }
    w.__plays = []
    const play = HTMLMediaElement.prototype.play
    HTMLMediaElement.prototype.play = function () { w.__plays.push(this.src); return play.call(this) }
  })
}
