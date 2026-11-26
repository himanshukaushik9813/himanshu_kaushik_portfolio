import { expect, test } from '@playwright/test'

test.describe('prerendered HTML (SEO, link previews, no-JS)', () => {
  test('home HTML already contains the real content and head tags', async ({ request }) => {
    const html = await (await request.get('/')).text()
    expect(html).toContain('<title>Himanshu Kaushik — Full-Stack &amp; Web3 Developer</title>')
    expect(html).toMatch(/<meta name="description" content="Himanshu Kaushik is a Full-Stack &amp; Web3 Developer in Bengaluru/)
    expect(html).toMatch(/<meta property="og:title"/)
    expect(html).toMatch(/<meta name="twitter:card" content="summary_large_image"/)
    for (const text of ['Care4Edu', 'YieldMaze', 'ZeroPath', 'Engineering ideas.', 'Languages']) expect(html).toContain(text)
    const ld = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)![1]!)
    expect(ld).toMatchObject({ '@type': 'Person', name: 'Himanshu Kaushik', jobTitle: 'Full-Stack & Web3 Developer' })
    expect(ld.sameAs).toContain('https://github.com/himanshukaushik9813')
    expect(html).not.toMatch(/\+91|98\d{8}/) // phone number never shipped
  })

  test('/projects has its own HTML, title and description', async ({ request }) => {
    const html = await (await request.get('/projects')).text()
    expect(html).toContain('<title>Projects — Himanshu Kaushik</title>')
    expect(html).toContain('Aviation Disruption Intelligence Platform')
    expect(html).toMatch(/rel="modulepreload"[^>]*ProjectsPage-/)
  })

  test('robots.txt is served', async ({ request }) => {
    const res = await request.get('/robots.txt')
    expect(res.ok()).toBe(true)
    expect(await res.text()).toContain('User-agent: *')
  })

  test('hydrates without errors or warnings on both routes', async ({ page }) => {
    const logs: string[] = []
    page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') logs.push(m.text()) })
    page.on('pageerror', (e) => logs.push(e.message))
    for (const u of ['/', '/projects']) { await page.goto(u); await page.waitForTimeout(1500) }
    expect(logs.filter((l) => !/Failed to load resource/.test(l))).toEqual([])
  })

  test('client-side navigation updates the tab title', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/projects')
    await page.waitForTimeout(800)
    await page.locator('.archive-nav__back').click()
    await expect(page).toHaveURL(/\/$/, { timeout: 6000 })
    await expect(page).toHaveTitle('Himanshu Kaushik — Full-Stack & Web3 Developer')
  })
})

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false })
  test('the projects archive is fully readable', async ({ page }) => {
    await page.goto('/projects')
    for (const t of ['YieldMaze', 'ZeroPath', 'Aviation Disruption Intelligence Platform']) await expect(page.getByRole('heading', { name: t })).toBeVisible()
  })
  test('home sections below the intro are readable', async ({ page }) => {
    await page.goto('/')
    await page.locator('[data-section="experience"]').scrollIntoViewIfNeeded()
    await expect(page.getByText('Care4Edu Pvt. Ltd.').first()).toBeVisible()
  })
})

test.describe('keyboard', () => {
  test('first Tab reveals the skip link; it moves focus to the main content', async ({ page }) => {
    await page.goto('/')
    await page.keyboard.press('Tab')
    const skip = page.getByRole('link', { name: 'Skip to content' })
    await expect(skip).toBeFocused()
    await page.waitForTimeout(400) // slide-in
    expect(await skip.evaluate((el) => el.getBoundingClientRect().top)).toBeGreaterThanOrEqual(0)
    await page.keyboard.press('Enter')
    await expect(page.locator('main#main')).toBeFocused()
  })
})


test.describe('9 entry mid-page (prerendered anchors)', () => {
  const watchErrors = (page: import('@playwright/test').Page) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    page.on('console', (m) => { if (m.type() === 'error' && /reading 'end'|ErrorBoundary/.test(m.text())) errors.push(m.text()) })
    return errors
  }

  test('opening a #section builds the scenes without errors and lands on it', async ({ page }) => {
    const errors = watchErrors(page)
    await page.goto('/#skills')
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(1000)
    await expect(page).toHaveURL(/#skills$/)
    await expect(page.locator('[data-section="skills"]')).toBeVisible()
    expect(errors).toEqual([])
  })

  test('reloading halfway down starts over at the top with the intro, without errors', async ({ page }) => {
    const errors = watchErrors(page)
    await page.goto('/#skills')
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(1000)
    await page.reload()
    await page.waitForTimeout(2000)
    expect(await page.evaluate(() => scrollY)).toBe(0)
    await expect(page).not.toHaveURL(/#/)
    await expect(page.locator('.intro__title')).toBeVisible()
    expect(errors).toEqual([])
  })
})
