import { expect, test, type Page } from '@playwright/test'

const nav = (page: Page) => page.locator('nav.site-nav')
const isShown = (page: Page) => nav(page).evaluate((el) => getComputedStyle(el).visibility === 'visible' && Number(getComputedStyle(el).opacity) > 0.9)

async function userScrollPastIntro(page: Page) {
  for (let i = 0; i < 12; i++) {
    await page.mouse.wheel(0, 400)
    await page.waitForTimeout(60)
  }
  await page.waitForTimeout(1200)
}

test.describe('navbar visibility (A6)', () => {
  test('hidden during the intro, shown after a real user scroll past it', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    await page.waitForTimeout(300)
    expect(await isShown(page)).toBe(false)
    await page.mouse.move(700, 450)
    await userScrollPastIntro(page)
    await expect.poll(() => isShown(page)).toBe(true)
  })

  test('a programmatic scroll alone does not reveal it', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => window.scrollTo(0, 3000))
    await page.waitForTimeout(800)
    expect(await isShown(page)).toBe(false)
  })

  test('direct entry with a hash shows it immediately', async ({ page }) => {
    await page.goto('/#skills')
    await expect.poll(() => isShown(page)).toBe(true)
  })
})

test.describe('menu overlay (A7)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/#what-i-do')
    await expect.poll(() => isShown(page)).toBe(true)
  })

  test('opens as a modal dialog, traps focus, Esc closes and restores focus', async ({ page }) => {
    const button = page.getByRole('button', { name: 'Open navigation menu' })
    await button.click()
    await expect(button).toHaveAttribute('aria-expanded', 'true')
    const dialog = page.getByRole('dialog', { name: 'Site menu' })
    await expect(dialog).toBeVisible()
    await expect(page.getByRole('button', { name: 'Close navigation menu' })).toBeFocused()
    // Tab around the whole dialog: focus must never leave it
    for (let i = 0; i < 16; i++) {
      await page.keyboard.press('Tab')
      expect(await page.evaluate(() => !!document.activeElement?.closest('#site-menu'))).toBe(true)
    }
    expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('hidden')
    await page.keyboard.press('Escape')
    await expect(button).toHaveAttribute('aria-expanded', 'false')
    await expect(button).toBeFocused()
    await expect.poll(() => page.evaluate(() => document.documentElement.style.overflow)).toBe('')
    await expect(dialog).toBeHidden({ timeout: 4000 })
  })

  test('clicking a section link fades, jumps to the section and closes the menu', async ({ page }) => {
    await page.getByRole('button', { name: 'Open navigation menu' }).click()
    await page.waitForTimeout(1600)
    await page.getByRole('dialog', { name: 'Site menu' }).getByRole('link', { name: 'Skills' }).click()
    await page.waitForTimeout(1500)
    const top = await page.locator('#skills').evaluate((el) => el.getBoundingClientRect().top)
    expect(Math.abs(top)).toBeLessThan(4)
    await expect(page.getByRole('dialog', { name: 'Site menu' })).toBeHidden()
    expect(page.url()).toMatch(/#skills$/)
    expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('')
    expect(await page.locator('.fade-cover').evaluate((el) => getComputedStyle(el).display)).toBe('none')
  })

  test('menu link list matches page sections, in page order', async ({ page }) => {
    await page.getByRole('button', { name: 'Open navigation menu' }).click()
    const labels = await page.locator('#site-menu .menu-link__label').allTextContents()
    expect(labels).toEqual(['Home', 'About', 'Experience', 'Works', 'Highlights', 'Skills', 'Contact'])
    const hrefs = await page.locator('#site-menu .menu-link').evaluateAll((els) => els.map((e) => e.getAttribute('href')!))
    for (const h of hrefs) expect(await page.locator(h).count()).toBe(1)
  })
})

test('footer links navigate to their section', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/#connect')
  await page.locator('.site-footer__nav').getByRole('link', { name: 'Works' }).click()
  await page.waitForTimeout(1500)
  const top = await page.locator('#works').evaluate((el) => el.getBoundingClientRect().top)
  expect(Math.abs(top)).toBeLessThan(4)
})

test('reduced motion: menu opens instantly and links jump without the fade', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/#what-i-do')
  await page.getByRole('button', { name: 'Open navigation menu' }).click()
  await expect(page.getByRole('dialog', { name: 'Site menu' })).toBeVisible()
  await page.getByRole('dialog', { name: 'Site menu' }).getByRole('link', { name: 'Contact' }).click()
  await page.waitForTimeout(400)
  const top = await page.locator('#connect').evaluate((el) => el.getBoundingClientRect().top)
  expect(Math.abs(top)).toBeLessThan(4)
})
