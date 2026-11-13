import { expect, test, type Page } from '@playwright/test'
import { glideTo, pinRange } from './helpers'

const GL_ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']

async function toHeroEnd(page: Page) {
  const [, end] = await pinRange(page, '[data-section="intro"]')
  await glideTo(page, end, 1600)
}
const overlayActive = (page: Page) => page.locator('[data-route-wipe]').evaluate((el) => el.hasAttribute('data-active'))
const waitIdle = async (page: Page) => expect.poll(() => overlayActive(page), { timeout: 8000 }).toBe(false)

test.use({ launchOptions: { executablePath: process.env.CHROME_PATH, args: GL_ARGS } })

test.describe('6a keycap (A20)', () => {
  test('3D key lazy-loads and replaces the DOM key; hover part-presses it', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    const chunks: string[] = []
    page.on('request', (r) => { if (r.url().includes('keycapScene')) chunks.push(r.url()) })
    await page.goto('/')
    await toHeroEnd(page)
    const key = page.locator('[data-keycap="enter"]')
    await expect(key).toHaveAttribute('data-gl-ready', /.*/, { timeout: 10000 })
    expect(chunks.length).toBe(1)
    await expect(key.locator('canvas.keycap__canvas')).toHaveCount(1)
    expect(await key.locator('.keycap-fallback').evaluate((el) => Number(getComputedStyle(el).opacity))).toBeLessThan(0.05)
    await key.hover()
    await expect.poll(() => key.evaluate((el) => Number(getComputedStyle(el).getPropertyValue('--press')))).toBeGreaterThan(0.4)
  })

  test('Enter shortcut: ignored during the intro and when another control has focus, works on the hero', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    await page.waitForTimeout(1200)
    await page.keyboard.press('Enter') // key is in view but still hidden under the intro
    await page.waitForTimeout(600)
    expect(new URL(page.url()).pathname).toBe('/')
    await toHeroEnd(page)
    await page.locator('.hero__socials a').first().focus()
    await page.keyboard.press('Enter') // activates the focused link, not the keycap
    await page.waitForTimeout(600)
    expect(await overlayActive(page)).toBe(false)
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur())
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/\/projects$/, { timeout: 6000 })
    await waitIdle(page)
    expect(await page.evaluate(() => window.scrollY)).toBe(0)
  })
})

