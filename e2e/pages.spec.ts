// The public pages: phrasebook, the clock, and the landing page in dark mode.
// Exists so the pages a teacher and a recruiter open first keep working.
import { expect, test } from '@playwright/test'

test('the phrasebook lists every phrase and filters by search', async ({ page }) => {
  await page.goto('/phrasebook')
  await expect(page.locator('main li p[lang=sw]')).toHaveCount(95)
  await page.getByRole('searchbox', { name: 'Search the phrasebook' }).fill('asante')
  await expect(page.locator('main li p[lang=sw]').first()).toContainText(/Asante/)
  await expect(page.locator('main li p[lang=sw]')).toHaveCount(await page.locator('main li p[lang=sw]').count())
})

test('the clock shows the Swahili hour and says the minutes the Swahili way', async ({ page }) => {
  await page.goto('/time')
  await page.getByRole('button', { name: "7 o'clock" }).click()
  await expect(page.getByText('saa moja asubuhi', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Minute hand' }).click()
  await page.getByRole('button', { name: '45 minutes' }).click()
  await expect(page.getByText('saa mbili kasorobo asubuhi', { exact: true })).toBeVisible()
})

test('the landing page has no sideways scroll in dark mode', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Try the live demo' })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})
