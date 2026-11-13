import { expect, test } from '@playwright/test'

for (const width of [375, 768, 1024, 1440, 2560]) {
  for (const route of ['/', '/projects']) {
    test(`no horizontal overflow at ${width}px on ${route}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto(route)
      await page.evaluate(() => document.fonts.ready)
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
      expect(overflow).toBeLessThanOrEqual(0)
    })
  }
}

test('exactly one h1 per route and every image has alt text', async ({ page }) => {
  for (const route of ['/', '/projects']) {
    await page.goto(route)
    await expect(page.locator('h1')).toHaveCount(1)
    const missingAlt = await page.$$eval('img', (imgs) => imgs.filter((i) => !i.hasAttribute('alt')).length)
    expect(missingAlt).toBe(0)
  }
})
