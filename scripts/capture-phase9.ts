/** Phase 9 captures: no-JS rendering of the prerendered HTML, skip link, hash entry, per viewport. */
import { chromium } from '@playwright/test'
const sizes = [[1440, 900, 'desktop'], [834, 1112, 'tablet'], [390, 844, 'mobile']] as const
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH })
for (const [w, h, name] of sizes) {
  const noJs = await b.newContext({ viewport: { width: w, height: h }, javaScriptEnabled: false })
  const p1 = await noJs.newPage()
  await p1.goto('http://localhost:4173/projects'); await p1.waitForTimeout(600)
  await p1.screenshot({ path: `verification/p9-nojs-projects-${name}.png` })
  await noJs.close()
  const ctx = await b.newContext({ viewport: { width: w, height: h } })
  const p = await ctx.newPage()
  await p.goto('http://localhost:4173/'); await p.waitForTimeout(1500)
  await p.keyboard.press('Tab'); await p.waitForTimeout(400)
  await p.screenshot({ path: `verification/p9-skiplink-${name}.png` })
  await p.goto('http://localhost:4173/#skills'); await p.waitForTimeout(2500)
  await p.screenshot({ path: `verification/p9-hash-skills-${name}.png` })
  await ctx.close()
}
await b.close(); console.log('ok')
