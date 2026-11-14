import { expect, test, type Page } from '@playwright/test'
import { readFileSync } from 'node:fs'

const fixture = readFileSync('tests/fixtures/github-himanshukaushik9813-2026-11-13.json', 'utf8')
const API = '**/github-contributions-api.jogruber.de/**'

async function mockApi(page: Page, opts: { status?: number; delay?: number } = {}) {
  const hits: string[] = []
  await page.route(API, async (r) => {
    hits.push(r.request().url())
    if (opts.delay) await new Promise((res) => setTimeout(res, opts.delay))
    await r.fulfill({ status: opts.status ?? 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: opts.status && opts.status >= 400 ? '{}' : fixture })
  })
  return hits
}
const toActivity = async (page: Page) => {
  const y = await page.locator('[data-section="skills"]').evaluate((el) => el.getBoundingClientRect().top + scrollY)
  await page.evaluate((y) => scrollTo(0, y), y)
  await page.waitForTimeout(900)
}

test.describe('7a GitHub heatmap', () => {
  test.beforeEach(async ({ page }) => { await page.setViewportSize({ width: 1440, height: 900 }) })

  test('loads only near the viewport, then shows the real data in stone greys', async ({ page }) => {
    const hits = await mockApi(page)
    await page.goto('/')
    await page.waitForTimeout(1200)
    expect(hits).toHaveLength(0) // nothing fetched while the visitor is at the top
    await toActivity(page)
    await expect(page.locator('.gh-cal__title')).toHaveText('243 contributions in the last year', { timeout: 6000 })
    expect(hits).toEqual(['https://github-contributions-api.jogruber.de/v4/himanshukaushik9813?y=last'])
    await expect(page.locator('.gh-cal__grid span[data-level]')).toHaveCount(370)
    await expect(page.locator('.gh-cal__grid span[data-level="4"]')).toHaveCount(3)
    const greens = await page.locator('.gh-cal__grid span[data-level]').evaluateAll((els) => els.filter((e) => { const [r, g, b] = getComputedStyle(e).backgroundColor.match(/\d+/g)!.map(Number); return g! > r! + 20 && g! > b! + 20 }).length)
    expect(greens).toBe(0)
    await expect(page.locator('.gh-cal__months span').first()).toHaveText('Nov')
    await expect(page.locator('.gh-cal__grid')).toHaveAttribute('aria-label', /243 contributions/)
    expect(await page.locator('.gh-cal__grid span[data-level="4"]').first().getAttribute('title')).toMatch(/contributions on \w{3} \d+, 2026/)
  })

  test('shows a neutral skeleton while loading (no numbers) and caches for the tab', async ({ page }) => {
    const hits = await mockApi(page, { delay: 1500 })
    await page.goto('/')
    await toActivity(page)
    await expect(page.locator('.gh-cal')).toHaveAttribute('data-state', 'loading')
    await expect(page.locator('.gh-cal__title')).not.toContainText(/\d/)
    await expect(page.locator('.gh-cal__grid span[data-skeleton]')).toHaveCount(371)
    await expect(page.locator('.gh-cal__title')).toHaveText(/243 contributions/, { timeout: 6000 })
    await page.reload()
    await toActivity(page)
    await expect(page.locator('.gh-cal__title')).toHaveText(/243 contributions/, { timeout: 10000 })
    expect(hits).toHaveLength(1)
  })

  test('if the data cannot load, the whole block is hidden and pins re-measure', async ({ page }) => {
    await mockApi(page, { status: 500 })
    await page.goto('/')
    await toActivity(page)
    await expect(page.locator('[data-activity]')).toHaveCount(0, { timeout: 6000 })
    // the Connect title still reveals at its (re-measured) trigger point
    const y = await page.locator('[data-section="connect"]').evaluate((el) => el.getBoundingClientRect().top + scrollY)
    await page.evaluate((y) => scrollTo(0, y), y)
    await page.waitForTimeout(1600)
    expect(await page.locator('[data-title-line]').first().evaluate((el) => getComputedStyle(el).transform)).toMatch(/^(none|matrix\(1, 0, 0, 1, 0, 0\))$/)
  })

  test('mobile: the calendar scrolls sideways and starts at the latest weeks', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await mockApi(page)
    await page.goto('/')
    await toActivity(page)
    await expect(page.locator('.gh-cal__title')).toHaveText(/243/, { timeout: 6000 })
    const s = await page.locator('.gh-cal__scroll').evaluate((el) => [el.scrollLeft, el.scrollWidth - el.clientWidth])
    expect(s[1]).toBeGreaterThan(0)
    expect(Math.abs(s[0]! - s[1]!)).toBeLessThan(2)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375)
  })
})

test.describe('7b email dialog', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await page.setViewportSize({ width: 1440, height: 900 })
    await mockApi(page)
    await page.goto('/')
    const y = await page.locator('[data-section="connect"]').evaluate((el) => el.getBoundingClientRect().top + scrollY + 300)
    await page.evaluate((y) => scrollTo(0, y), y)
    await page.waitForTimeout(1400)
  })

  test('opens from the Email row; copy writes the address and announces it', async ({ page }) => {
    const row = page.locator('[data-section="connect"] button.connect-row')
    await expect(row).toHaveAttribute('aria-haspopup', 'dialog')
    await row.click()
    const dialog = page.getByRole('dialog', { name: 'Email' })
    await expect(dialog).toBeVisible()
    await expect(page.locator('[data-email-copy]')).toBeFocused()
    await page.locator('[data-email-copy]').click()
    await expect(page.getByRole('status')).toHaveText('Email address copied to clipboard.')
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('himanshukaushik981374@gmail.com')
    await expect(page.locator('[data-email-copy]')).toContainText('Copied')
  })

  test('Open Gmail links to a compose window for the right address', async ({ page }) => {
    await page.locator('[data-section="connect"] button.connect-row').click()
    const a = page.locator('[data-email-gmail]')
    await expect(a).toHaveAttribute('href', 'https://mail.google.com/mail/?view=cm&fs=1&to=himanshukaushik981374%40gmail.com')
    await expect(a).toHaveAttribute('target', '_blank')
    await expect(a).toHaveAttribute('rel', /noreferrer/)
  })

  test('keyboard: Enter opens, focus stays inside, Esc closes and returns focus; scroll is locked while open', async ({ page }) => {
    const row = page.locator('[data-section="connect"] button.connect-row')
    await row.focus()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('dialog')).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('hidden')
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Tab')
      expect(await page.evaluate(() => !!document.activeElement?.closest('dialog'))).toBe(true)
    }
    const yBefore = await page.evaluate(() => scrollY)
    await page.mouse.wheel(0, 600)
    await page.waitForTimeout(300)
    expect(await page.evaluate(() => scrollY)).toBe(yBefore)
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toBeHidden()
    await expect(row).toBeFocused()
    expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('')
  })

  test('clicking the backdrop closes it', async ({ page }) => {
    await page.locator('[data-section="connect"] button.connect-row').click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.mouse.click(10, 10)
    await expect(page.getByRole('dialog')).toBeHidden()
  })
})
