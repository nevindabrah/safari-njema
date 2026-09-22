// Live tests against the real Supabase project named in .env: usernames, the welcome step, friends and a shared trip.
// Exists to catch what the demo cannot, such as a saved username not being seen by every screen. Run with LIVE=1 npm run test:e2e. Every account it makes, it deletes.
import { readFileSync } from 'node:fs'
import { expect, test, type Page } from '@playwright/test'

const stamp = () => Date.now().toString(36).slice(-5)
const PASSWORD = 'safari-test-2026'

async function signUp(page: Page, username: string, email: string) {
  await page.goto('/signup')
  await page.getByLabel('Username').fill(username)
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(PASSWORD)
  await page.getByRole('button', { name: 'Sign up' }).click()
}

async function logIn(page: Page, identifier: string) {
  await page.goto('/login')
  await page.getByLabel('Email or username').fill(identifier)
  await page.getByLabel('Password').fill(PASSWORD)
  await page.getByRole('button', { name: 'Log in' }).click()
}

async function deleteAccount(page: Page) {
  await page.goto('/account')
  await page.getByRole('button', { name: 'Delete my account' }).click()
  await page.getByRole('button', { name: 'Yes, delete everything' }).click()
  await expect(page).toHaveURL(/\/(login)?$/)
}

async function signOut(page: Page) {
  await page.goto('/account')
  await page.getByRole('button', { name: 'Sign out' }).click()
  await expect(page).toHaveURL(/\/(login)?$/)
}

test('sign up with a username, log in by username, change the username without the screen bouncing', async ({ page }) => {
  const id = stamp()
  await signUp(page, `amina_${id}`, `amina-${id}@example.com`)
  await expect(page).toHaveURL(/\/trip$/)
  await expect(page.getByRole('heading', { name: 'My trip to Kenya' })).toBeVisible()

  await page.goto('/account')
  await expect(page.getByLabel('Username')).toHaveValue(`amina_${id}`)
  await page.getByLabel('Username').fill(`amina_${id}_2`)
  await page.getByRole('button', { name: 'Save profile' }).click()
  await expect(page.getByRole('status')).toHaveText('Saved.')
  await expect(page).toHaveURL(/\/account$/)
  await page.waitForTimeout(1500)
  await expect(page).toHaveURL(/\/account$/)

  await signOut(page)
  await logIn(page, `amina_${id}_2`)
  await expect(page).toHaveURL(/\/trip$/)
  await deleteAccount(page)
})

test('an account that arrives without a username is asked for one once, then goes to the trip and stays there', async ({ page, request }) => {
  const id = stamp()
  const env = Object.fromEntries(readFileSync('.env', 'utf8').split('\n').filter((l) => l.includes('=') && !l.trim().startsWith('#')).map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]))
  const made = await request.post(`${env.VITE_SUPABASE_URL}/auth/v1/signup`, { headers: { apikey: env.VITE_SUPABASE_ANON_KEY }, data: { email: `nameless-${id}@example.com`, password: PASSWORD } })
  expect(made.ok(), 'an account made without a username, the way Google sign in makes one').toBe(true)

  await logIn(page, `nameless-${id}@example.com`)
  await expect(page).toHaveURL(/\/welcome$/)
  await expect(page.getByRole('heading', { name: 'Choose your username' })).toBeVisible()
  await page.getByLabel('Username').fill(`nameless_${id}`)
  await page.getByRole('button', { name: 'Continue to my trip' }).click()
  await expect(page).toHaveURL(/\/trip$/)
  await page.waitForTimeout(2000)
  await expect(page).toHaveURL(/\/trip$/)
  await expect(page.getByRole('heading', { name: 'My trip to Kenya' })).toBeVisible()
  await deleteAccount(page)
})

test('accepting a friend request shares the trip, and each friend gets their own lesson', async ({ browser }) => {
  const id = stamp()
  const a = await browser.newPage()
  const d = await browser.newPage()
  await signUp(a, `owner_${id}`, `owner-${id}@example.com`)
  await expect(a).toHaveURL(/\/trip$/)
  await signUp(d, `guest_${id}`, `guest-${id}@example.com`)
  await expect(d).toHaveURL(/\/trip$/)

  await d.goto('/friends')
  await d.getByRole('searchbox', { name: 'Search by username' }).fill(`owner_${id}`)
  await d.getByRole('button', { name: 'Add friend' }).click()
  await expect(d.getByRole('heading', { name: 'Waiting for an answer' })).toBeVisible()

  await a.goto('/friends')
  await a.getByRole('button', { name: 'Accept' }).click()
  await expect(a.getByRole('heading', { name: 'Your friends' }).locator('..')).toContainText(`guest_${id}`)

  await a.goto('/trip')
  await expect(a.getByText(`guest-${id}`).first()).toBeVisible()
  await a.getByRole('searchbox').first().fill('diani')
  await a.getByRole('listbox').getByRole('button').first().click()
  await a.getByRole('button', { name: 'Add to itinerary' }).click()
  await expect(a.getByRole('link', { name: 'Start lesson' })).toHaveCount(1, { timeout: 20_000 })

  await d.goto('/trip')
  await d.getByRole('navigation', { name: 'Your trips' }).getByRole('link').nth(1).click()
  await expect(d).toHaveURL(/\/trip\//)
  await expect(d.getByText('owner', { exact: true })).toBeVisible()
  await expect(d.getByRole('link', { name: 'Start lesson' })).toHaveCount(1, { timeout: 20_000 })

  await d.getByRole('button', { name: 'Leave this trip' }).click()
  await d.getByRole('alertdialog').getByRole('button', { name: 'Leave' }).click()
  await expect(d).toHaveURL(/\/trip$/)

  await deleteAccount(d)
  await deleteAccount(a)
})
