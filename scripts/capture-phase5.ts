/** Phase 5: scrubbed scene frames at fixed scroll positions. Usage: SCENE=intro|build|works W=2560 H=1355 */
import { chromium } from '@playwright/test'
const out = 'verification'
const W = Number(process.env.W ?? 2560), H = Number(process.env.H ?? 1355)
const scene = process.env.SCENE ?? 'intro'
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH })
const p = await b.newPage({ viewport: { width: W, height: H } })
await p.goto('http://localhost:4173/'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500)
const fracs = (process.env.FR ?? '0,.02,.08,.15,.22,.3,.4,.5,.56,.62,.66,.7,.76,.85,1').split(',').map(Number)
// scene start/end in px, read from the pinned trigger
const range = await p.evaluate((s) => {
  const sel = s === 'intro' ? '[data-section="intro"]' : s === 'build' ? '[data-section="lets-build"]' : '[data-section="works"]'
  const el = document.querySelector(sel) as HTMLElement
  const spacer = el.parentElement as HTMLElement
  if (!spacer.classList.contains('pin-spacer')) return null
  const top = spacer.getBoundingClientRect().top + window.scrollY
  return [top, top + spacer.offsetHeight - el.offsetHeight]
}, scene)
if (!range) throw new Error('no trigger')
let i = 0
for (const f of fracs) {
  const y = range[0] + (range[1] - range[0]) * f
  // approach the target in small steps so snap sees a realistic (low) velocity
  await p.evaluate(async (y) => {
    const from = window.scrollY
    const steps = Math.max(1, Math.ceil(Math.abs(y - from) / 60))
    for (let i = 1; i <= steps; i++) { window.scrollTo(0, from + ((y - from) * i) / steps); await new Promise((r) => requestAnimationFrame(() => r(0))) }
  }, y)
  await p.waitForTimeout(Number(process.env.WAIT ?? 1300))
  await p.screenshot({ path: `${out}/p5-${scene}-${W}-${String(i++).padStart(2, '0')}.png` })
}
await b.close(); console.log('ok', range)
