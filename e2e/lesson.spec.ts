// A whole lesson in the demo: pick a length, read the brief and phrases, answer every practice exercise, reach the end.
// Exists because the lesson is the product. The seed phrases are the answer key, so a wrong verdict here is a real bug.
import { expect, test } from '@playwright/test'
import { openDemo, solveOneExercise, trackAudioPlays } from './helpers'

test('a Quick lesson can be finished with every answer right', async ({ page }) => {
  await trackAudioPlays(page)
  await openDemo(page)
  await page.getByRole('link', { name: 'Start lesson' }).first().click()
  await expect(page).toHaveURL(/\/lesson\//)
  await page.getByRole('radio', { name: /Quick/ }).click()
  await page.getByRole('button', { name: 'Start the lesson' }).click()
  await expect(page.getByText('The brief', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(page.locator('main ul > li p[lang=sw]')).toHaveCount(4)
  await page.getByRole('button', { name: 'Continue' }).click()

  for (let i = 0; i < 40 && (await page.locator('main p.text-sm.text-muted.mt-4').count()) > 0; i++) {
    await solveOneExercise(page)
  }
  await expect(page.getByText(/You got \d+ of \d+ right/)).toBeVisible()
  await page.getByRole('link', { name: 'Back to my trip' }).click()
  await expect(page.getByRole('link', { name: 'Review lesson' })).toHaveCount(1)
})
