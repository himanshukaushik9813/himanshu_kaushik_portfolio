/** Indicative frame-rate during real wheel scrolling through the three pins (headless Chrome, software GPU). */
import { chromium } from '@playwright/test'
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH, args: ['--enable-gpu-rasterization', '--ignore-gpu-blocklist'] })
const W = Number(process.env.W ?? 1440), H = Number(process.env.H ?? 900)
const p = await b.newPage({ viewport: { width: W, height: H } })
await p.goto('http://localhost:4173/'); await p.waitForTimeout(1500)
for (const [name, sel] of [['intro', '[data-section="intro"]'], ['build', '[data-section="lets-build"]'], ['works', '[data-section="works"]']] as const) {
  const [s, e] = await p.evaluate((q) => { const el = document.querySelector(q) as HTMLElement; const sp = el.parentElement!; const t = sp.getBoundingClientRect().top + scrollY; return [t, t + sp.offsetHeight - el.offsetHeight] }, sel)
  await p.evaluate((y) => window.scrollTo(0, y - 10), s); await p.waitForTimeout(900)
  await p.mouse.move(W / 2, H / 2)
  await p.evaluate('window.__f = []; window.__run = true; (function(){ var last = performance.now(); function loop(t){ window.__f.push(t - last); last = t; if (window.__run) requestAnimationFrame(loop) } requestAnimationFrame(loop) })()')
  const ticks = Math.ceil((e - s) / 100)
  for (let i = 0; i < ticks; i++) { await p.mouse.wheel(0, 100); await p.waitForTimeout(16) }
  await p.waitForTimeout(800)
  const f = (await p.evaluate('window.__run = false; window.__f.slice(2)')) as number[]
  f.sort((a, c) => a - c)
  const avg = f.reduce((a, c) => a + c, 0) / f.length
  console.log(name, `frames=${f.length} avg=${(1000 / avg).toFixed(1)}fps p95=${f[Math.floor(f.length * 0.95)]!.toFixed(1)}ms >33ms=${f.filter((x) => x > 33).length}`)
}
await b.close()
