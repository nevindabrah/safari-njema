// Every kind of visitor can get to every screen: signed out and signed in, on a phone, a tablet and a laptop.
// Exists because a visitor on a phone once had no way to reach the phrasebook, the clock or the food page.
import { expect, test } from '@playwright/test'
import { openDemo } from './helpers'

test('a signed out visitor can reach every public page from the bars', async ({ page, isMobile }) => {
  await page.goto('/')
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
  await page.goto('/')
  if (isMobile) {
    const tabs = page.getByRole('navigation', { name: 'Main' })
    await expect(tabs.getByRole('link', { name: /Phrases/ })).toBeVisible()
    await expect(tabs.getByRole('link', { name: /Food/ })).toBeVisible()
    await page.getByRole('button', { name: 'Open the menu' }).click()
    const menu = page.getByRole('dialog', { name: 'Menu' })
    for (const name of ['Log in', 'Create your account', 'Phrasebook', 'Telling time', 'Food', 'About']) await expect(menu.getByRole('link', { name, exact: true })).toBeVisible()
    await menu.getByRole('link', { name: 'Telling time', exact: true }).click()
    await expect(page).toHaveURL(/\/time$/)
    await expect(menu).toBeHidden()
  } else {
    const bar = page.getByRole('banner').getByRole('navigation', { name: 'Main' })
    for (const name of ['Phrasebook', 'Time', 'Food', 'About', 'Log in']) await expect(bar.getByRole('link', { name, exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Open the menu' })).toBeHidden()
  }
})

test('a signed in visitor sees their own tabs and menu', async ({ page, isMobile }) => {
  await openDemo(page)
  if (isMobile) {
    const tabs = page.getByRole('navigation', { name: 'Main' })
    for (const name of [/My trip/, /Friends/, /Kangas/, /Phrases/, /Time/]) await expect(tabs.getByRole('link', { name })).toBeVisible()
    await page.getByRole('button', { name: 'Open the menu' }).click()
    const menu = page.getByRole('dialog', { name: 'Menu' })
    for (const name of ['My trip', 'Friends', 'Your account', 'Food', 'About']) await expect(menu.getByRole('link', { name, exact: true })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(menu).toBeHidden()
  } else {
    const bar = page.getByRole('banner').getByRole('navigation', { name: 'Main' })
    for (const name of ['My trip', 'Friends', 'Kangas', 'Phrasebook', 'Time', 'Food']) await expect(bar.getByRole('link', { name: new RegExp(`^${name}`) })).toBeVisible()
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})
