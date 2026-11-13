// Must run first, before GSAP reads the scroll position (see entryScroll.ts).
import '@/motion/entryScroll'
import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { createBrowserRouter, matchRoutes } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import '@fontsource/sacramento/400.css'
import './index.css'
import '@/components/ui/ui.css'
import './styles/hover.css'
import '@/motion/gsap'
import { routes } from '@/app/routes'


/**
 * Pages are prerendered to static HTML at build time (scripts/prerender.mjs), so search engines, link previews
 * and slow connections get real content; the client then hydrates it. Lazy routes on the current URL are
 * resolved first so the hydrated tree matches the HTML. In dev (no prerendered HTML) it simply renders.
 */
const PRERENDERED = new Set(['/', '/projects'])

async function start() {
  const container = document.getElementById('root')!
  const path = window.location.pathname.replace(/\/+$/, '') || '/'
  const hydrate = container.hasChildNodes() && PRERENDERED.has(path)
  if (!hydrate) container.replaceChildren() // e.g. an unknown URL served the home HTML: render fresh instead
  if (hydrate) {
    const matches = matchRoutes(routes, window.location) ?? []
    await Promise.all(
      matches.map(async (m) => {
        const lazy = m.route.lazy
        if (typeof lazy !== 'function') return
        const mod = await lazy()
        Object.assign(m.route, { ...mod, lazy: undefined })
      }),
    )
  }
  const router = createBrowserRouter(routes)
  const app = (
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  )
  // entryScroll parked the page at the top after GSAP had already cached the restored position; a scroll
  // event makes ScrollTrigger read it again before any scene is built.
  window.scrollTo(0, 0)
  window.dispatchEvent(new Event('scroll'))
  if (hydrate) hydrateRoot(container, app)
  else createRoot(container).render(app)
}
void start()
