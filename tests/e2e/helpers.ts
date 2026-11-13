import type { Page } from '@playwright/test'

/** Scroll range [start, end] of the pinned scene that contains `sel` (read from GSAP's pin-spacer). */
export async function pinRange(page: Page, sel: string): Promise<[number, number]> {
  return page.evaluate((s) => {
    const el = document.querySelector(s) as HTMLElement
    const spacer = el.parentElement as HTMLElement
    if (!spacer.classList.contains('pin-spacer')) throw new Error(`not pinned: ${s}`)
    const top = spacer.getBoundingClientRect().top + window.scrollY
    return [top, top + spacer.offsetHeight - el.offsetHeight] as [number, number]
  }, sel)
}

/** Scroll to `y` in small steps (realistic velocity for snap), then let scrub settle. */
export async function glideTo(page: Page, y: number, settle = 1400) {
  await page.evaluate(async (target) => {
    const from = window.scrollY
    const steps = Math.max(1, Math.ceil(Math.abs(target - from) / 80))
    for (let i = 1; i <= steps; i++) {
      window.scrollTo(0, from + ((target - from) * i) / steps)
      await new Promise((r) => requestAnimationFrame(() => r(0)))
    }
  }, y)
  await page.waitForTimeout(settle)
}

export const opacity = (page: Page, sel: string) => page.locator(sel).first().evaluate((el) => Number(getComputedStyle(el).opacity))
