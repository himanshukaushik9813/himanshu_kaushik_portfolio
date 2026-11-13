/** Phase 8: viewport "tour" — every part of every page at a given size, incl. pinned-scene states and the open menu. */
import { chromium } from '@playwright/test'
import { readFileSync, mkdirSync } from 'node:fs'
const fixture = readFileSync('tests/fixtures/github-himanshukaushik9813-2026-11-13.json', 'utf8')
const [W, H] = (process.env.VP ?? '375x812').split('x').map(Number) as [number, number]
const dir = `verification/tour-${W}x${H}`; mkdirSync(dir, { recursive: true })
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH, args: ['--disable-3d-apis'] })
const p = await b.newPage({ viewport: { width: W, height: H }, hasTouch: W < 1024, isMobile: W < 768 })
await p.route('**/github-contributions-api.jogruber.de/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: fixture }))
let n = 0
const shot = async (label: string) => { await p.screenshot({ path: `${dir}/${String(n++).padStart(2, '0')}-${label}.png` }) }
const go = async (y: number, wait = 1300) => {
  await p.evaluate(async (t) => { const f = scrollY; const k = Math.max(1, Math.ceil(Math.abs(t - f) / 150)); for (let i = 1; i <= k; i++) { scrollTo(0, f + ((t - f) * i) / k); await new Promise((r) => requestAnimationFrame(() => r(0))) } }, y)
  await p.waitForTimeout(wait)
}
const pin = (sel: string) => p.evaluate((s) => { const el = document.querySelector(s) as HTMLElement; const sp = el.parentElement!; if (!sp.classList.contains('pin-spacer')) { const t = el.getBoundingClientRect().top + scrollY; return [t, t + Math.max(0, el.offsetHeight - innerHeight)] } const t = sp.getBoundingClientRect().top + scrollY; return [t, t + sp.offsetHeight - el.offsetHeight] }, sel)
await p.goto('http://localhost:4173/'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500)
await shot('intro')
const [, ie] = await pin('[data-section="intro"]'); await go(ie, 1800); await shot('hero')
const top = (sel: string) => p.evaluate((s) => { const el = document.querySelector(s) as HTMLElement; return [el.getBoundingClientRect().top + scrollY, el.offsetHeight] }, sel)
for (const s of ['what-i-do', 'experience']) { const [t, h] = await top(`[data-section="${s}"]`); for (let y = t; y < t + h - 40; y += H * 0.85) { await go(y); await shot(s) } }
const [bs, be] = await pin('[data-section="lets-build"]'); const units = 3 + 2.4
await go(bs); await shot('build-start'); await go(bs + (be - bs) * (1.6 / units)); await shot('build-mid'); await go(bs + (be - bs) * (3.6 / units)); await shot('build-products')
const [ws, we] = await pin('[data-section="works"]'); await go(ws); await shot('works-turnover')
await go(ws + (we - ws) * (1.175 / 3.7), 2200); await shot('works-01'); await go(ws + (we - ws) * (2.525 / 3.7), 2200); await shot('works-02')
for (const s of ['mockups', 'skills', 'connect']) { const [t, h] = await top(`[data-section="${s}"]`); for (let y = t; y < t + h - 40; y += H * 0.85) { await go(y); await shot(s) } }
await go(await p.evaluate(() => document.documentElement.scrollHeight - innerHeight)); await shot('footer')
// one accordion open + menu open
const [st] = await top('[data-section="skills"]'); await go(st); await p.locator('.skills-row__trigger').nth(1).click().catch(() => {}); await p.waitForTimeout(1000); await shot('skills-open')
await p.mouse.move(W / 2, H / 2); await p.mouse.wheel(0, 200); await p.waitForTimeout(900); await p.locator('nav.site-nav button').last().click().catch((e) => console.log('menu', e.message)); await p.waitForTimeout(1400); await shot('menu')
await p.keyboard.press('Escape'); await p.waitForTimeout(800)
await p.goto('http://localhost:4173/projects'); await p.waitForTimeout(1500)
const PH = await p.evaluate(() => document.documentElement.scrollHeight)
for (let y = 0; y < PH - H * 0.3; y += H * 0.85) { await go(y, 700); await shot('projects') }
await b.close(); console.log(dir, n)
