import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { readFileSync } from 'node:fs'

const fixture = readFileSync('tests/fixtures/github-himanshukaushik9813-2026-11-13.json', 'utf8')
const mock = (page: Page) => page.route('**/github-contributions-api.jogruber.de/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: fixture }))
const scan = async (page: Page, label: string) => {
  // Excluded from contrast only: purely decorative, aria-hidden duplicates of content that is available elsewhere
  // (the giant Works counter, the faint footer wordmark). WCAG 1.4.3 exempts such incidental text.
  const r = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
    .exclude('.works-header__count')
    .exclude('.site-footer__name')
    .analyze()
  const v = r.violations.map((x) => `${x.id} (${x.impact}): ${x.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`)
  expect(v, label).toEqual([])
}
async function walk(page: Page) {
  const h = await page.evaluate(() => innerHeight)
  const H = await page.evaluate(() => document.documentElement.scrollHeight)
  for (let y = 0; y < H; y += h * 0.8) { await page.evaluate((y) => scrollTo(0, y), y); await page.waitForTimeout(60) }
  await page.waitForTimeout(1200)
}

for (const vp of [{ width: 1440, height: 900 }, { width: 375, height: 812 }]) {
  test.describe(`axe (WCAG 2.2 AA) at ${vp.width}`, () => {
    test.beforeEach(async ({ page }) => { await page.setViewportSize(vp); await mock(page) })
    test('home, after every section has revealed', async ({ page }) => {
      await page.goto('/')
      await walk(page)
      await scan(page, 'home')
    })
    test('home, menu open', async ({ page }) => {
      await page.goto('/')
      await page.mouse.move(vp.width / 2, vp.height / 2)
      for (let i = 0; i < 6; i++) await page.mouse.wheel(0, 300)
      await page.waitForTimeout(1200)
      await page.locator('.site-nav__menu-button').click()
      await page.waitForTimeout(1500)
      await scan(page, 'menu')
    })
    test('home, email dialog open', async ({ page }) => {
      await page.goto('/')
      const y = await page.locator('[data-section="connect"]').evaluate((el) => el.getBoundingClientRect().top + scrollY + 300)
      await page.evaluate((y) => scrollTo(0, y), y)
      await page.waitForTimeout(1500)
      await page.locator('[data-section="connect"] button.connect-row').click()
      await page.waitForTimeout(600)
      await scan(page, 'dialog')
    })
    test('/projects', async ({ page }) => {
      await page.goto('/projects')
      await walk(page)
      await scan(page, 'projects')
    })
  })
}
