/** Phase 8 audit: at each viewport, flag elements poking outside the viewport, small touch targets, clipped text, tiny text. */
import { chromium } from '@playwright/test'
import { readFileSync } from 'node:fs'
const fixture = readFileSync('tests/fixtures/github-himanshukaushik9813-2026-11-13.json', 'utf8')
const VPS = (process.env.VPS ?? '375x812,430x932,768x1024,1024x768,1280x800,1280x620,1440x900,1920x1080,2560x1355').split(',').map((s) => s.split('x').map(Number) as [number, number])
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH, args: ['--disable-3d-apis'] })
for (const [w, h] of VPS) {
  for (const route of ['/', '/projects']) {
    const p = await b.newPage({ viewport: { width: w, height: h }, hasTouch: w < 1024, isMobile: w < 768 })
    await p.route('**/github-contributions-api.jogruber.de/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: fixture }))
    await p.goto('http://localhost:4173' + route); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(800)
    // walk the page so lazy things render and reveals finish
    const H = await p.evaluate(() => document.documentElement.scrollHeight)
    for (let y = 0; y < H; y += h * 0.8) { await p.evaluate((y) => scrollTo(0, y), y); await p.waitForTimeout(120) }
    await p.waitForTimeout(1200)
    const issues = await p.evaluate(`(function(){
      var out = []; var vw = innerWidth; var touch = vw < 1024;
      function clipped(el){ for (var a = el.parentElement; a && a !== document.body; a = a.parentElement){ var cs = getComputedStyle(a); if (cs.overflowX !== 'visible' || cs.overflow !== 'visible') return true; if (cs.position === 'fixed') return true } return false }
      function vis(el){ var cs = getComputedStyle(el); return cs.visibility !== 'hidden' && cs.display !== 'none' && parseFloat(cs.opacity) > 0.05 && el.getClientRects().length }
      var all = document.querySelectorAll('main *, footer *, nav *, .archive *');
      for (var i = 0; i < all.length; i++){ var el = all[i]; if (!vis(el)) continue; var r = el.getBoundingClientRect(); if (r.width === 0) continue;
        if ((r.right > vw + 1 || r.left < -1) && !clipped(el) && !el.closest('[aria-hidden="true"]')) out.push('OVERFLOW ' + desc(el) + ' ' + Math.round(r.left) + '..' + Math.round(r.right));
        if (touch && el.matches('a[href],button') && !el.closest('.gh-cal') && (r.width < 40 || r.height < 40) && el.textContent.trim().length < 40) out.push('SMALL-TARGET ' + desc(el) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height));
        var cs = getComputedStyle(el);
        if (el.children.length === 0 && el.textContent.trim() && (cs.overflow === 'hidden' || cs.overflowX === 'hidden') && el.scrollWidth > el.clientWidth + 2 && cs.textOverflow !== 'ellipsis' && !el.closest('[aria-hidden="true"]')) out.push('CLIPPED-TEXT ' + desc(el));
        if (el.children.length === 0 && el.textContent.trim() && parseFloat(cs.fontSize) < 10 && !el.closest('[aria-hidden="true"]')) out.push('TINY-TEXT ' + desc(el) + ' ' + cs.fontSize);
      }
      function desc(el){ return el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\\s+/).slice(0,2).join('.') : '') + ' "' + (el.textContent || '').trim().slice(0, 28) + '"' }
      return Array.from(new Set(out));
    })()`) as string[]
    console.log(`== ${w}x${h} ${route}: ${issues.length}`)
    for (const i of issues.slice(0, 25)) console.log('  ' + i)
    await p.close()
  }
}
await b.close()
