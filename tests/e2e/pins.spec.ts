import { expect, test } from '@playwright/test'
import { glideTo, opacity, pinRange } from './helpers'

const INTRO = '[data-section="intro"]'
const BUILD = '[data-section="lets-build"]'
const WORKS = '[data-section="works"]'

test.describe('5a intro → hero (A1–A5)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)
    await page.waitForTimeout(1200)
  })

  test('greeting loop plays at rest; the hero is hidden under the closed iris', async ({ page }) => {
    const visible = await page.locator('[data-intro-greeting]').evaluateAll((els) => els.filter((e) => Number(getComputedStyle(e).opacity) > 0.05).length)
    expect(visible).toBeGreaterThan(0)
    expect(await page.locator('[data-intro-panel]').evaluate((el) => getComputedStyle(el).getPropertyValue('--reveal-radius').trim())).toBe('0px')
    expect(await opacity(page, '[data-hero-title]')).toBeLessThan(0.05)
    expect(await opacity(page, '[data-hero-subtitle]')).toBeLessThan(0.05)
  })

  test('iris opens mid-scroll, then the name rises; it all reverses on the way back', async ({ page }) => {
    const [start, end] = await pinRange(page, INTRO)
    expect(end - start).toBeGreaterThan(900 * 1.4)
    await glideTo(page, start + (end - start) * 0.12)
    const r = await page.locator('[data-intro-panel]').evaluate((el) => parseFloat(getComputedStyle(el).getPropertyValue('--reveal-radius')))
    expect(r).toBeGreaterThan(20)
    expect(r).toBeLessThan(840)
    await glideTo(page, end)
    expect(await opacity(page, '[data-hero-title]')).toBeGreaterThan(0.98)
    expect(await page.locator('[data-hero-char]').last().evaluate((el) => getComputedStyle(el).transform)).toMatch(/^(none|matrix\(1, 0, 0, 1, 0, 0\))$/)
    expect(await page.locator('[data-intro-panel]').evaluate((el) => getComputedStyle(el).visibility)).toBe('hidden')
    await glideTo(page, 0)
    expect(await page.locator('[data-intro-panel]').evaluate((el) => getComputedStyle(el).visibility)).toBe('visible')
    expect(await opacity(page, '[data-hero-title]')).toBeLessThan(0.05)
  })

  test('keyboard: tabbing into the hero jumps to the finished reveal', async ({ page }) => {
    let onHero = false
    for (let i = 0; i < 12 && !onHero; i++) {
      await page.keyboard.press('Tab')
      onHero = await page.evaluate(() => !!document.activeElement?.closest('[data-section="hero"]'))
    }
    expect(onHero).toBe(true)
    await page.waitForTimeout(900)
    const [, end] = await pinRange(page, INTRO)
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThanOrEqual(end - 2)
    expect(await page.evaluate(() => Number(getComputedStyle(document.activeElement!.closest('[data-hero-action]')!).opacity))).toBeGreaterThan(0.98)
  })
})

test.describe("5b Let's build (A10–A11)", () => {
  test('track centres each word, waves draw, PRODUCTS fills then scatters; reverse restores', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    await page.waitForTimeout(1000)
    const [start, end] = await pinRange(page, BUILD)
    const centreOf = (i: number) => page.locator('[data-build-slide]').nth(i).evaluate((el) => { const r = el.getBoundingClientRect(); return r.left + r.width / 2 })
    await glideTo(page, start)
    expect(Math.abs((await centreOf(0)) - 720)).toBeLessThan(6)
    const segLen = await page.locator('[data-build-wave-segment]').first().evaluate((el) => parseFloat((el as SVGPathElement).style.strokeDasharray))
    expect(segLen).toBeGreaterThan(50)
    // word 2 centred at its stop (timeline unit 1 of n-1+2.4)
    const units = 3 + 2.4
    await glideTo(page, start + (end - start) * (1 / units))
    expect(Math.abs((await centreOf(1)) - 720)).toBeLessThan(12)
    expect(await page.locator('[data-build-wave-segment]').first().evaluate((el) => parseFloat(getComputedStyle(el).strokeDashoffset))).toBeLessThan(2)
    // after the fill: PRODUCTS coral fully revealed
    await glideTo(page, start + (end - start) * ((3 + 1.0) / units))
    expect(await page.locator('[data-build-product-fill]').evaluate((el) => getComputedStyle(el).clipPath)).toMatch(/inset\(0(px|%)?\)|none/)
    await glideTo(page, end)
    const charOpacities = await page.locator('[data-build-char]').evaluateAll((els) => els.map((e) => Number(getComputedStyle(e).opacity)))
    expect(Math.max(...charOpacities)).toBeLessThan(0.05)
    await glideTo(page, start)
    expect(await opacity(page, '[data-build-char]')).toBeGreaterThan(0.98)
    expect(Math.abs((await centreOf(0)) - 720)).toBeLessThan(6)
  })
})

test.describe('5c Works turnover + Featured gallery (A12, A13, A24)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    await page.waitForTimeout(1000)
  })

  test('card lifts away, strip steps one frame per project, counter + copy follow, snap rests on a project', async ({ page }) => {
    const [start, end] = await pinRange(page, WORKS)
    const n = await page.locator('[data-works-info]').count()
    expect(n).toBeGreaterThanOrEqual(3)
    await glideTo(page, start)
    expect(await page.locator('[data-works-turnover]').evaluate((el) => el.getBoundingClientRect().top)).toBeLessThan(2)
    // scroll somewhere inside project 2's switch and let snap settle
    const total = 1 + (n - 1) * 1.35 + 0.35
    await glideTo(page, start + (end - start) * ((1 + 1.35 + 0.5) / total), 2200)
    const y = await page.evaluate(() => window.scrollY)
    const stops = [0, ...Array.from({ length: n }, (_, i) => 1.175 + i * 1.35).filter((t) => t < total), total].map((t) => start + ((end - start) * t) / total)
    expect(Math.min(...stops.map((s) => Math.abs(s - y)))).toBeLessThan(6)
    const counter = await page.locator('[data-works-count]').textContent()
    const activeIdx = await page.locator('[data-works-info]').evaluateAll((els) => els.findIndex((e) => e.hasAttribute('data-active')))
    expect(counter).toBe(String(activeIdx + 1).padStart(2, '0'))
    expect(await page.locator('[data-works-info]').nth(activeIdx).evaluate((el) => Number(getComputedStyle(el).opacity))).toBeGreaterThan(0.98)
    const stripShift = await page.locator('[data-works-track]').evaluate((el) => { const f = el.parentElement!.getBoundingClientRect(); return (f.top - el.getBoundingClientRect().top) / f.height })
    expect(Math.abs(stripShift - activeIdx)).toBeLessThan(0.02)
    expect(await page.locator('[data-works-turnover]').evaluate((el) => el.getBoundingClientRect().bottom)).toBeLessThan(2)
  })

  test('keyboard: focusing a later project\'s link brings that project in', async ({ page }) => {
    const link = page.locator('[data-works-info]').nth(2).locator('a').first()
    await link.focus()
    await page.waitForTimeout(1500)
    expect(await page.locator('[data-works-count]').textContent()).toBe('03')
    expect(await page.locator('[data-works-info]').nth(2).evaluate((el) => Number(getComputedStyle(el).opacity))).toBeGreaterThan(0.98)
  })
})

test.describe('pins: resize + mobile', () => {
  test('a resize re-measures the scenes (no stale pin lengths)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    await page.waitForTimeout(800)
    const [s1, e1] = await pinRange(page, INTRO)
    await page.setViewportSize({ width: 1024, height: 700 })
    await page.waitForTimeout(1200)
    const [s2, e2] = await pinRange(page, INTRO)
    expect(e1 - s1).toBeCloseTo(900 * 1.5, -1)
    expect(e2 - s2).toBeCloseTo(700 * 1.5, -1)
    await glideTo(page, (await pinRange(page, BUILD))[0])
    const c = await page.locator('[data-build-slide]').first().evaluate((el) => { const r = el.getBoundingClientRect(); return r.left + r.width / 2 })
    expect(Math.abs(c - 512)).toBeLessThan(6)
  })

  for (const vp of [{ width: 375, height: 812 }, { width: 768, height: 1024 }]) {
    test(`all three pins work at ${vp.width}px`, async ({ page }) => {
      await page.setViewportSize(vp)
      await page.goto('/')
      await page.waitForTimeout(800)
      for (const sel of [INTRO, BUILD, WORKS]) {
        const [s, e] = await pinRange(page, sel)
        expect(e).toBeGreaterThan(s)
      }
      const [, ie] = await pinRange(page, INTRO)
      await glideTo(page, ie)
      expect(await opacity(page, '[data-hero-title]')).toBeGreaterThan(0.98)
      // gallery fits one viewport so the pin is honest
      expect(await page.locator('[data-works-pin]').evaluate((el) => el.scrollHeight <= window.innerHeight + 1)).toBe(true)
    })
  }
})

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })
  test('no pins; hero shown directly; every project and word visible', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    await page.waitForTimeout(600)
    expect(await page.locator('.pin-spacer').count()).toBe(0)
    expect(await page.locator('[data-intro-panel]').evaluate((el) => getComputedStyle(el).display)).toBe('none')
    expect(await opacity(page, '[data-hero-title]')).toBe(1)
    for (let i = 0; i < 3; i++) {
      await expect(page.locator('[data-works-info]').nth(i)).toBeVisible()
      expect(await page.locator('[data-works-info]').nth(i).evaluate((el) => Number(getComputedStyle(el).opacity))).toBe(1)
    }
    expect(await opacity(page, '[data-build-char]')).toBe(1)
  })
})
