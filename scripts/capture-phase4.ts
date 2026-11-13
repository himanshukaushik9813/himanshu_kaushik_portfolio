/** Phase 4: reveal frame sequences + hover/accordion states at 2560×1355. */
import { chromium } from '@playwright/test'
const out = 'verification'
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH })
const p = await b.newPage({ viewport: { width: 2560, height: 1355 } })

async function sequence(name: string, sel: string, offset: number) {
  await p.goto('http://localhost:4173/'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(400)
  await p.evaluate(([s, o]) => { const el = document.querySelector(s as string)!; window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - (o as number)) }, [sel, offset])
  for (let i = 0; i < 12; i++) { await p.screenshot({ path: `${out}/p4-${name}-${String(i).padStart(2, '0')}.png` }); await p.waitForTimeout(60) }
}
await sequence('about', '#what-i-do', 1355 * 0.7)
await sequence('skills', '#skills', 1355 * 0.75)
await sequence('connect', '#connect', 1355 * 0.62)
await sequence('highlights', '#mockups', 1355 * 0.7)

// states
async function settleAt(sel: string) { await p.evaluate((s) => document.querySelector(s)!.scrollIntoView({ block: 'start' }), sel); await p.waitForTimeout(2200) }
await settleAt('#connect')
await p.hover('#connect [data-connect-link]:nth-child(2)'); await p.waitForTimeout(900)
await p.screenshot({ path: `${out}/p4-state-connect-hover.png` })
await settleAt('#skills')
await p.click('#skills .skills-row:nth-child(3) .skills-row__trigger'); await p.waitForTimeout(1300)
await p.screenshot({ path: `${out}/p4-state-skills-open.png` })
await p.goto('http://localhost:4173/#what-i-do'); await p.waitForTimeout(2400)
await p.screenshot({ path: `${out}/p4-state-about.png` })
await b.close(); console.log('ok')
