// The planner in the demo: the seeded trip, adding a stop from search, the confirmation before removing one.
// Exists because this is the first screen every student meets.
import { expect, test } from '@playwright/test'
import { openDemo } from './helpers'

test('the demo opens on a three stop trip and a stop can be added and removed', async ({ page }) => {
  await openDemo(page)
  await expect(page.getByRole('link', { name: 'Start lesson' })).toHaveCount(3)

  await page.getByRole('searchbox').first().fill('carniv')
  await page.getByRole('listbox').getByRole('button').first().click()
  await page.getByRole('button', { name: 'Add to itinerary' }).click()
  await expect(page.getByRole('link', { name: 'Start lesson' })).toHaveCount(4, { timeout: 15_000 })
  await expect(page.locator('main ul li').filter({ hasText: 'Carnivore Restaurant' })).toHaveCount(1)

  await page.getByRole('button', { name: /^Remove Carnivore/ }).click()
  await expect(page.getByRole('alertdialog')).toContainText('Remove this stop')
  await page.getByRole('button', { name: 'Keep' }).click()
  await expect(page.getByRole('link', { name: 'Start lesson' })).toHaveCount(4)
  await page.getByRole('button', { name: /^Remove Carnivore/ }).click()
  await page.getByRole('alertdialog').getByRole('button', { name: 'Remove' }).click()
  await expect(page.getByRole('link', { name: 'Start lesson' })).toHaveCount(3)
})

test('the catalogue opens, filters by kind, and closes with Escape', async ({ page }) => {
  await openDemo(page)
  await page.getByRole('button', { name: 'Add a place' }).click()
  const dialog = page.getByRole('dialog', { name: 'Where are you going?' })
  await expect(dialog).toBeVisible()
  await dialog.getByRole('searchbox', { name: 'Search places' }).fill('karura')
  await expect(dialog.getByRole('button', { name: /Karura Forest/ })).toBeVisible()
  await dialog.getByRole('searchbox', { name: 'Search places' }).fill('')
  await dialog.getByRole('button', { name: /^Food/ }).click()
  await expect(dialog.getByRole('button', { name: /^All/ })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
})
