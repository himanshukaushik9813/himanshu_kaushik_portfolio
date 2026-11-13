import { expect, test } from '@playwright/test'

test.use({ launchOptions: { executablePath: process.env.CHROME_PATH, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] } })

test.describe('software WebGL', () => {
  test('no real GPU → the DOM key is kept and Three.js is never downloaded', async ({ page }) => {
    const chunks: string[] = []
    page.on('request', (r) => { if (r.url().includes('keycapScene')) chunks.push(r.url()) })
    await page.goto('/projects')
    await page.waitForTimeout(3500)
    expect(chunks).toEqual([])
    await expect(page.locator('[data-keycap] canvas')).toHaveCount(0)
  })
})
