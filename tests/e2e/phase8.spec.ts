import { expect, test, type Page } from '@playwright/test'

const PSEUDO_HIT = '.works-header__more, .code-activity__link, .archive-item__links a'

async function walk(page: Page) {
  const h = await page.evaluate(() => innerHeight)
  const H = await page.evaluate(() => document.documentElement.scrollHeight)
  for (let y = 0; y < H; y += h * 0.8) { await page.evaluate((y) => scrollTo(0, y), y); await page.waitForTimeout(80) }
  await page.waitForTimeout(1000)
}

for (const vp of [{ width: 375, height: 812 }, { width: 2560, height: 1355 }]) {
  test(`no visible text below 10px at ${vp.width}`, async ({ page }) => {
    await page.setViewportSize(vp)
    for (const route of ['/', '/projects']) {
      await page.goto(route)
      await walk(page)
      const tiny = await page.evaluate(`(function(){ var out=[]; document.querySelectorAll('main *, footer *, .archive *').forEach(function(el){ if (el.children.length || !el.textContent.trim() || el.closest('[aria-hidden="true"], .sr-only')) return; var cs = getComputedStyle(el); if (cs.display==='none'||cs.visibility==='hidden') return; if (parseFloat(cs.fontSize) < 10) out.push(el.textContent.trim().slice(0,30) + ' ' + cs.fontSize) }); return out })()`)
      expect(tiny, route).toEqual([])
    }
  })
}

test('touch: every link/button is at least 24px tall (or has an enlarged hit area)', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true })
  const page = await ctx.newPage()
  for (const route of ['/', '/projects']) {
    await page.goto(route)
    await walk(page)
    const small = await page.evaluate(`(function(sel){ var out=[]; document.querySelectorAll('main a[href], main button, footer a[href], .archive a[href], .archive button').forEach(function(el){ var r = el.getBoundingClientRect(); var cs = getComputedStyle(el); if (!r.width || cs.visibility==='hidden' || el.closest('.gh-cal')) return; if (r.height >= 24 && r.width >= 24) return; if (el.matches(sel) && getComputedStyle(el, '::before').content !== 'none') return; out.push((el.textContent||el.getAttribute('aria-label')||'').trim().slice(0,30) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height)) }); return out })(${JSON.stringify(PSEUDO_HIT)})`)
    expect(small, route).toEqual([])
  }
  await ctx.close()
})

test('short laptop (1280×620): Works gallery fits one screen and the menu shows all 7 links', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 620 })
  await page.goto('/')
  await page.waitForTimeout(800)
  expect(await page.locator('[data-works-pin]').evaluate((el) => el.scrollHeight <= innerHeight + 1)).toBe(true)
  await page.mouse.move(640, 300)
  for (let i = 0; i < 6; i++) await page.mouse.wheel(0, 300)
  await page.waitForTimeout(1200)
  await page.locator('.site-nav__menu-button').click()
  await page.waitForTimeout(1500)
  const bottoms = await page.locator('.menu-link').evaluateAll((els) => els.map((e) => e.getBoundingClientRect().bottom))
  expect(bottoms).toHaveLength(7)
  expect(Math.max(...bottoms)).toBeLessThanOrEqual(620)
})

test('tablet (768): the menu aside sits below the links', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 })
  await page.goto('/')
  await page.mouse.move(380, 500)
  for (let i = 0; i < 6; i++) await page.mouse.wheel(0, 300)
  await page.waitForTimeout(1200)
  await page.locator('.site-nav__menu-button').click()
  await page.waitForTimeout(1500)
  const lastLink = await page.locator('.menu-link').last().evaluate((e) => e.getBoundingClientRect().bottom)
  const aside = await page.locator('.menu-aside').evaluate((e) => e.getBoundingClientRect().top)
  expect(aside).toBeGreaterThan(lastLink)
})

test('phone held sideways: scenes are static (no pins), the hero shows directly', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 812, height: 375 }, hasTouch: true })
  const page = await ctx.newPage()
  await page.goto('/')
  await page.waitForTimeout(800)
  expect(await page.locator('.pin-spacer').count()).toBe(0)
  expect(await page.locator('[data-intro-panel]').evaluate((el) => getComputedStyle(el).display)).toBe('none')
  expect(await page.locator('[data-hero-title]').evaluate((el) => Number(getComputedStyle(el).opacity))).toBe(1)
  for (let i = 0; i < 3; i++) await expect(page.locator('[data-works-info]').nth(i)).toBeVisible()
  await ctx.close()
})

for (const vp of [{ width: 375, height: 812 }, { width: 1440, height: 900 }]) {
  test(`footer "Back to top" is revealed at the end of the page (${vp.width})`, async ({ page }) => {
    await page.setViewportSize(vp)
    await page.goto('/')
    await page.waitForTimeout(800)
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight))
    await page.waitForTimeout(2200)
    await expect(page.locator('.site-footer__top')).toBeVisible()
    expect(await page.locator('.site-footer__top-wrap').evaluate((el) => Number(getComputedStyle(el).opacity))).toBe(1)
  })
}
