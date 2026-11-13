/** Phase 3 captures: menu open (static), hover states, and frame sequences of A7 + A23. */
import { chromium } from '@playwright/test'
const out = 'verification'
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH })
const p = await b.newPage({ viewport: { width: 2462, height: 1351 } })
await p.goto('http://localhost:4173/#what-i-do'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(900)
await p.screenshot({ path: `${out}/p3-nav-2462.png`, clip: { x: 0, y: 0, width: 2462, height: 120 } })
await p.hover('.site-nav__menu-button'); await p.waitForTimeout(1800)
await p.screenshot({ path: `${out}/p3-menu-button-hover.png`, clip: { x: 2250, y: 0, width: 212, height: 80 } })
await p.click('.site-nav__menu-button'); await p.waitForTimeout(2000)
await p.screenshot({ path: `${out}/p3-menu-open-2462.png` })
await p.hover('#site-menu .menu-link:nth-child(4)'); await p.waitForTimeout(1500)
await p.screenshot({ path: `${out}/p3-menu-hover-2462.png` })
// A7 open sequence @ 8fps
await p.keyboard.press('Escape'); await p.waitForTimeout(2200)
await p.mouse.move(10, 600)
await p.click('.site-nav__menu-button')
for (let i = 0; i < 16; i++) { await p.screenshot({ path: `${out}/p3-open-${String(i).padStart(2, '0')}.png`, scale: 'css' }); await p.waitForTimeout(125 - 40) }
await p.waitForTimeout(600)
// A23 menu → section sequence
await p.click('#site-menu .menu-link:nth-child(7)')
for (let i = 0; i < 16; i++) { await p.screenshot({ path: `${out}/p3-nav-${String(i).padStart(2, '0')}.png` }); await p.waitForTimeout(125 - 40) }
await b.close(); console.log('ok')
