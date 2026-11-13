import { glideTo, pinRange } from './helpers'
import { expect, test, type Page } from '@playwright/test'

const opacity = (page: Page, sel: string) => page.locator(sel).first().evaluate((el) => Number(getComputedStyle(el).opacity))

async function bringIntoView(page: Page, sel: string) {
  await page.locator(sel).first().evaluate((el) => el.scrollIntoView({ block: 'center' }))
  await page.waitForTimeout(1800)
}

test.describe('scroll reveals (A8, A14, A16–A19)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)
  })

  test('content below the fold starts hidden and is fully revealed in view', async ({ page }) => {
    expect(await opacity(page, '#experience [data-row-content]')).toBeLessThan(0.05)
    for (const sel of ['#what-i-do [data-reveal]', '#experience [data-row-content]', '#mockups [data-panel]', '#skills [data-row-content]', '#connect [data-connect-link]', '#footer [data-footer-reveal]']) {
      await bringIntoView(page, sel)
      expect(await opacity(page, sel), sel).toBeGreaterThan(0.98)
    }
  })

  test('title lines and rules settle at their final position', async ({ page }) => {
    await bringIntoView(page, '#connect [data-title-line]')
    const t = await page.locator('#connect [data-title-line]').first().evaluate((el) => getComputedStyle(el).transform)
    expect(['none', 'matrix(1, 0, 0, 1, 0, 0)']).toContain(t)
    await bringIntoView(page, '#skills [data-rule]')
    const w = await page.locator('#skills [data-rule]').first().evaluate((el) => el.getBoundingClientRect().width)
    expect(w).toBeGreaterThan(800)
  })

  test('connect note loops through words (SplitText) while in view', async ({ page }) => {
    await bringIntoView(page, '#connect [data-note]')
    expect(await page.locator('.connect__note-word').count()).toBeGreaterThan(1)
  })
})

test('reduced motion: everything is visible immediately, no hidden content', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  for (const sel of ['#experience [data-row-content]', '#mockups [data-panel]', '#connect [data-title-line]', '#footer [data-footer-reveal]']) {
    expect(await opacity(page, sel), sel).toBeGreaterThan(0.98)
  }
})

test.describe('skills accordion', () => {
  test('opens/closes with mouse and keyboard, with correct ARIA', async ({ page }) => {
    await page.goto('/#skills')
    const trigger = page.getByRole('button', { name: 'Blockchain & ZK' })
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await trigger.click()
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    const panel = page.getByRole('region', { name: 'Blockchain & ZK' })
    await expect(panel).toBeVisible()
    await expect(panel).toContainText('Groth16')
    await trigger.focus()
    await page.keyboard.press('Enter')
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await expect(panel).toBeHidden({ timeout: 2000 })
  })
})

test.describe('hover system (A24)', () => {
  test('connect row fills ink and inverts text on hover', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/#connect')
    await bringIntoView(page, '#connect [data-connect-link]')
    const row = page.locator('#connect [data-connect-link]').first()
    await row.hover()
    await page.waitForTimeout(900)
    expect(await row.evaluate((el) => getComputedStyle(el).color)).toBe('rgb(245, 245, 244)')
    expect(await row.evaluate((el) => getComputedStyle(el, '::before').transform)).toBe('matrix(1, 0, 0, 1, 0, 0)')
  })

  test('hero social circle fills on hover', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    const [, end] = await pinRange(page, '[data-section="intro"]')
    await glideTo(page, end)
    const icon = page.locator('.hero__socials a').first()
    await icon.hover()
    await page.waitForTimeout(1800)
    expect(await icon.evaluate((el) => getComputedStyle(el).backgroundSize)).toBe('100% 100%')
  })
})

test('keyboard: links below the fold are reachable by Tab before they have been revealed', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/#skills')
  await page.waitForTimeout(500)
  const footerWorks = page.locator('.site-footer__nav a', { hasText: 'Works' })
  let reached = false
  for (let i = 0; i < 40 && !reached; i++) {
    await page.keyboard.press('Tab')
    reached = await footerWorks.evaluate((el) => el === document.activeElement)
  }
  expect(reached).toBe(true)
  await page.waitForTimeout(1500)
  expect(await footerWorks.evaluate((el) => Number(getComputedStyle(el.closest('[data-footer-reveal]')!).opacity))).toBeGreaterThan(0.98)
})
