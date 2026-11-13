import { expect, test, type Page } from '@playwright/test'
import { glideTo, pinRange } from './helpers'


async function toHeroEnd(page: Page) {
  const [, end] = await pinRange(page, '[data-section="intro"]')
  await glideTo(page, end, 1600)
}
const overlayActive = (page: Page) => page.locator('[data-route-wipe]').evaluate((el) => el.hasAttribute('data-active'))
const waitIdle = async (page: Page) => expect.poll(() => overlayActive(page), { timeout: 8000 }).toBe(false)

test.use({ launchOptions: { executablePath: process.env.CHROME_PATH, args: ['--disable-3d-apis'] } })

test.describe('6a keycap without WebGL', () => {
  test('the DOM key stays, never downloads Three.js, and still navigates', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    const chunks: string[] = []
    page.on('request', (r) => { if (r.url().includes('keycapScene')) chunks.push(r.url()) })
    await page.goto('/')
    await toHeroEnd(page)
    await page.waitForTimeout(3000)
    const key = page.locator('[data-keycap="enter"]')
    expect(chunks).toHaveLength(0)
    await expect(key.locator('canvas')).toHaveCount(0)
    await expect(key.locator('.keycap-fallback')).toBeVisible()
    await key.click()
    await expect(page).toHaveURL(/\/projects$/, { timeout: 6000 })
    await waitIdle(page)
  })
})

