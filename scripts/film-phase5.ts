/** Phase 5: "recording" — real wheel scrolling through a pinned scene, a frame every few ticks. SCENE=intro|build|works */
import { chromium } from '@playwright/test'
const out = 'verification'
const W = Number(process.env.W ?? 2560), H = Number(process.env.H ?? 1355)
const scene = process.env.SCENE ?? 'works'
const ticks = Number(process.env.TICKS ?? 90), every = Number(process.env.EVERY ?? 5), delta = Number(process.env.DELTA ?? 110)
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH })
const p = await b.newPage({ viewport: { width: W, height: H } })
await p.goto('http://localhost:4173/'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1200)
const sel = scene === 'intro' ? '[data-section="intro"]' : scene === 'build' ? '[data-section="lets-build"]' : '[data-section="works"]'
const lead = Number(process.env.LEAD ?? 0)
await p.evaluate(([s, lead]) => {
  const el = document.querySelector(s as string) as HTMLElement
  const spacer = el.parentElement as HTMLElement
  window.scrollTo(0, spacer.getBoundingClientRect().top + window.scrollY - (lead as number))
}, [sel, lead] as const)
await p.waitForTimeout(1500)
await p.mouse.move(W / 2, H / 2)
let f = 0
for (let i = 0; i < ticks; i++) {
  await p.mouse.wheel(0, delta)
  await p.waitForTimeout(40)
  if (i % every === 0) await p.screenshot({ path: `${out}/p5f-${scene}-${W}-${String(f++).padStart(3, '0')}.png` })
}
await p.waitForTimeout(900)
await p.screenshot({ path: `${out}/p5f-${scene}-${W}-${String(f++).padStart(3, '0')}.png` })
await b.close(); console.log('frames', f)
