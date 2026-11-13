/** Generates public/og-image.png (1200×630 link-preview image) from the real hero. Run against `npm run preview`. */
import { chromium } from '@playwright/test'
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH, args: ['--disable-3d-apis'] })
const p = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
await p.goto('http://localhost:4173/'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1200)
const end = await p.evaluate(() => { const el = document.querySelector('[data-section="intro"]') as HTMLElement; const sp = el.parentElement!; return sp.getBoundingClientRect().top + scrollY + sp.offsetHeight - el.offsetHeight })
await p.evaluate((y) => scrollTo(0, y), end); await p.waitForTimeout(2500)
await p.addStyleTag({ content: '.site-nav-layer{display:none!important}' })
await p.waitForTimeout(300)
await p.screenshot({ path: 'public/og-image.png' })
await b.close(); console.log('public/og-image.png')
