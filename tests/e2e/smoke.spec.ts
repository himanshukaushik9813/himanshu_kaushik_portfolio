import { expect, test } from '@playwright/test'

const HOME_ORDER = ['intro', 'hero', 'what-i-do', 'experience', 'lets-build', 'works', 'works-turnover', 'mockups', 'skills', 'connect', 'footer']

test('home renders every section shell in plan order', async ({ page }) => {
  await page.goto('/')
  const order = await page.$$eval('[data-section]', (els) => els.map((e) => e.getAttribute('data-section')))
  expect(order).toEqual(HOME_ORDER)
  await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName('Himanshu Kaushik')
})

test('all three self-hosted fonts load', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)
  const loaded = await page.evaluate(async () => {
    await Promise.all([
      document.fonts.load('900 40px Satoshi'),
      document.fonts.load('500 20px "Clash Display"'),
      document.fonts.load('400 16px Amulya'),
    ])
    return [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family.replace(/"/g, ''))
  })
  for (const fam of ['Satoshi', 'Clash Display', 'Amulya']) expect(loaded).toContain(fam)
})

test('/projects route renders the archive with published projects only', async ({ page }) => {
  await page.goto('/projects')
  await expect(page.locator('[data-page="projects"]')).toBeVisible()
  await expect(page.getByRole('heading', { level: 2, name: 'YieldMaze' })).toBeVisible()
  await expect(page.getByText('TRACE', { exact: true })).toHaveCount(0)
})

test('unknown routes redirect home; no /lab', async ({ page }) => {
  await page.goto('/lab')
  await expect(page).toHaveURL(/\/$/)
})

test('no console errors on either route', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await page.goto('/projects')
  await page.waitForLoadState('networkidle')
  expect(errors).toEqual([])
})
