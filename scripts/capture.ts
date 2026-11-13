/** Verification captures: per-section (after its reveal has played) + full page, at the given widths. */
import { chromium } from '@playwright/test'

const widths = (process.env.WIDTHS ?? '1024,1440,2560').split(',').map(Number)
const base = process.env.BASE ?? 'http://localhost:4173'
const out = process.env.OUT ?? 'verification'
const settle = Number(process.env.SETTLE ?? 1800)

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH })
for (const w of widths) {
  const h = w <= 430 ? 812 : w <= 800 ? 1024 : Math.round(w * 0.53)
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 })
  for (const route of ['/', '/projects']) {
    await page.goto(base + route, { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts.ready)
    const name = route === '/' ? 'home' : 'projects'
    if (route === '/') {
      const ids = await page.$$eval('[data-section]', (els) => els.map((e) => e.getAttribute('data-section')!))
      for (const id of ids) {
        await page.locator(`[data-section="${id}"]`).first().evaluate((el) => el.scrollIntoView({ block: 'start' }))
        await page.waitForTimeout(settle)
        await page.locator(`[data-section="${id}"]`).first().screenshot({ path: `${out}/home-${w}-${id}.png` }).catch(() => {})
      }
      await page.evaluate(() => window.scrollTo(0, 0))
    }
    await page.screenshot({ path: `${out}/${name}-${w}-full.png`, fullPage: true })
  }
  await page.close()
}
await browser.close()
console.log('captured', widths.join(', '))
