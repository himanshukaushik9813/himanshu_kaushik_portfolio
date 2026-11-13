/** Phase 6: route-wipe frame sequences. FLOW=keycap|viewmore|back|backspace */
import { chromium } from '@playwright/test'
const W = Number(process.env.W ?? 2560), H = Number(process.env.H ?? 1355)
const flow = process.env.FLOW ?? 'keycap'
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
const p = await b.newPage({ viewport: { width: W, height: H } })
const pinEnd = (sel: string) => p.evaluate((s) => { const el = document.querySelector(s) as HTMLElement; const sp = el.parentElement!; return sp.getBoundingClientRect().top + scrollY + sp.offsetHeight - el.offsetHeight }, sel)
const pinStart = (sel: string) => p.evaluate((s) => { const el = document.querySelector(s) as HTMLElement; const sp = el.parentElement!; return sp.getBoundingClientRect().top + scrollY }, sel)
if (flow === 'back' || flow === 'backspace') await p.goto('http://localhost:4173/projects')
else await p.goto('http://localhost:4173/')
await p.waitForTimeout(1500)
if (flow === 'keycap') { await p.evaluate((y) => scrollTo(0, y), await pinEnd('[data-section="intro"]')); await p.waitForTimeout(3000) }
if (flow === 'viewmore') { await p.evaluate((y) => scrollTo(0, y), await pinStart('[data-section="works"]') + 1500); await p.waitForTimeout(2500) }
if (flow === 'backspace') await p.waitForTimeout(2000)
const t0 = Date.now()
if (flow === 'keycap') await p.keyboard.press('Enter')
if (flow === 'viewmore') await p.locator('.works-header__more').click()
if (flow === 'back') await p.locator('.archive-nav__back').click()
if (flow === 'backspace') await p.keyboard.press('Backspace')
let i = 0
while (Date.now() - t0 < 5200) { await p.screenshot({ path: `verification/p6f-${flow}-${String(i++).padStart(3, '0')}.png`, scale: 'css', type: 'jpeg', quality: 60 }); }
await p.waitForTimeout(600)
await p.screenshot({ path: `verification/p6f-${flow}-${String(i++).padStart(3, '0')}.png`, type: 'jpeg', quality: 60 })
console.log(flow, 'frames', i, 'url', p.url(), 'scrollY', await p.evaluate(() => Math.round(scrollY)))
await b.close()
