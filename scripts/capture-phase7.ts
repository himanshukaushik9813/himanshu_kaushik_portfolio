/** Phase 7 captures: heatmap (real snapshot served for the live API URL) + email dialog. W/H env. */
import { chromium } from '@playwright/test'
import { readFileSync } from 'node:fs'
const W = Number(process.env.W ?? 2560), H = Number(process.env.H ?? 1355)
const fixture = readFileSync('tests/fixtures/github-himanshukaushik9813-2026-11-13.json', 'utf8')
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH, args: ['--disable-3d-apis'] })
const p = await b.newPage({ viewport: { width: W, height: H } })
await p.route('**/github-contributions-api.jogruber.de/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: fixture }))
await p.goto('http://localhost:4173/'); await p.waitForTimeout(1200)
const y = await p.locator('[data-activity]').evaluate((el) => el.getBoundingClientRect().top + scrollY - 140)
await p.evaluate((y) => scrollTo(0, y), y); await p.waitForTimeout(2200)
await p.screenshot({ path: `verification/p7-heatmap-${W}.png` })
const cy = await p.locator('[data-section="connect"] button.connect-row').evaluate((el, h) => el.getBoundingClientRect().top + scrollY - h / 2, H)
await p.evaluate((y) => scrollTo(0, y), cy); await p.waitForTimeout(1800)
await p.locator('[data-section="connect"] button.connect-row').click(); await p.waitForTimeout(700)
await p.screenshot({ path: `verification/p7-dialog-${W}.png` })
await b.close(); console.log('ok')
