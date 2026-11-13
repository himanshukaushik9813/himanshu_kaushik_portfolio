import { expect, test, type Page } from '@playwright/test'
import { glideTo, pinRange } from './helpers'


async function toHeroEnd(page: Page) {
  const [, end] = await pinRange(page, '[data-section="intro"]')
  await glideTo(page, end, 1600)
}
const overlayActive = (page: Page) => page.locator('[data-route-wipe]').evaluate((el) => el.hasAttribute('data-active'))
const waitIdle = async (page: Page) => expect.poll(() => overlayActive(page), { timeout: 8000 }).toBe(false)

test.describe('6b route wipes (A21, A22)', () => {
  test.beforeEach(async ({ page }) => { await page.setViewportSize({ width: 1440, height: 900 }) })

  test('keycap → band staircase: bands enter from the right, top band first', async ({ page }) => {
    await page.goto('/')
    await toHeroEnd(page)
    await page.locator('[data-keycap="enter"]').click()
    await page.waitForTimeout(700)
    const lefts = await page.locator('[data-wipe-piece="bands"]').evaluateAll((els) => els.map((e) => e.getBoundingClientRect().left))
    for (let i = 1; i < lefts.length; i++) expect(lefts[i]!).toBeGreaterThanOrEqual(lefts[i - 1]! - 0.5) // staircase: top leads
    expect(lefts[0]!).toBeLessThan(1440)
    await expect(page).toHaveURL(/\/projects$/, { timeout: 6000 })
    await waitIdle(page)
  })

  test('View more → column wipe → /projects; back arrow → column wipe → home at #works with the nav shown', async ({ page }) => {
    await page.goto('/')
    const [ws] = await pinRange(page, '[data-section="works"]')
    await glideTo(page, ws + 1200)
    await page.locator('.works-header__more').click()
    await page.waitForTimeout(500)
    const tops = await page.locator('[data-wipe-piece="columns"]').evaluateAll((els) => els.map((e) => e.getBoundingClientRect().top))
    expect(tops[0]!).toBeLessThan(900) // columns rising from the bottom, first column leads
    expect(tops[0]!).toBeLessThanOrEqual(tops[7]!)
    await expect(page).toHaveURL(/\/projects$/, { timeout: 6000 })
    await waitIdle(page)
    await page.locator('.archive-nav__back').click()
    await expect(page).toHaveURL(/\/$/, { timeout: 6000 })
    await waitIdle(page)
    const [ws2] = await pinRange(page, '[data-section="works"]')
    expect(Math.abs((await page.evaluate(() => window.scrollY)) - ws2)).toBeLessThan(4)
    await expect(page.locator('nav.site-nav')).toHaveAttribute('data-visible', 'true')
  })

  test('Backspace on /projects → reverse staircase → home on the finished hero', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForTimeout(1200)
    await page.keyboard.press('Backspace')
    await page.waitForTimeout(700)
    const lefts = await page.locator('[data-wipe-piece="bands"]').evaluateAll((els) => els.map((e) => e.getBoundingClientRect().left))
    // mirrored: bands come from the left, bottom band first
    expect(lefts[7]!).toBeGreaterThanOrEqual(lefts[0]! - 0.5)
    await expect(page).toHaveURL(/\/$/, { timeout: 6000 })
    await waitIdle(page)
    const [, end] = await pinRange(page, '[data-section="intro"]')
    expect(Math.abs((await page.evaluate(() => window.scrollY)) - end)).toBeLessThan(4)
    expect(await page.locator('[data-hero-title]').evaluate((el) => Number(getComputedStyle(el).opacity))).toBeGreaterThan(0.98)
  })

  test('rapid double activation runs one transition; overlay never sticks', async ({ page }) => {
    await page.goto('/')
    await toHeroEnd(page)
    const navs: string[] = []
    page.on('framenavigated', (f) => { if (f === page.mainFrame()) navs.push(f.url()) })
    const key = page.locator('[data-keycap="enter"]')
    await key.click()
    await key.click({ force: true }).catch(() => {})
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/\/projects$/, { timeout: 6000 })
    await waitIdle(page)
    expect(await page.evaluate(() => history.length)).toBeLessThanOrEqual(3)
  })

  test('browser back mid-wipe leaves no stuck overlay', async ({ page }) => {
    await page.goto('/')
    const [ws] = await pinRange(page, '[data-section="works"]')
    await glideTo(page, ws + 1200)
    await page.locator('.works-header__more').click()
    await expect(page).toHaveURL(/\/projects$/, { timeout: 6000 })
    await waitIdle(page)
    await page.locator('.archive-nav__back').click()
    await page.waitForTimeout(300)
    await page.goBack()
    await waitIdle(page)
    expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('')
  })

  test('no GSAP "target not found" warnings on either route', async ({ page }) => {
    const warns: string[] = []
    page.on('console', (m) => { if (m.text().includes('GSAP target')) warns.push(m.text()) })
    await page.goto('/')
    await page.waitForTimeout(1500)
    await page.goto('/projects')
    await page.waitForTimeout(1000)
    expect(warns).toEqual([])
  })
})

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })
  test('wipes become a short fade; keycap is the DOM key', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    await page.waitForTimeout(600)
    await expect(page.locator('[data-keycap="enter"] canvas')).toHaveCount(0)
    await page.locator('[data-keycap="enter"]').click()
    await expect(page).toHaveURL(/\/projects$/, { timeout: 4000 })
    await waitIdle(page)
  })
})
