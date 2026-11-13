import { useEffect } from 'react'
import { Outlet, ScrollRestoration, useLocation } from 'react-router'
import { seo } from '@/content/seo'
import { startSmoothScroll, stopSmoothScroll } from '@/motion/lenis'
import { refreshWhenReady } from '@/motion/refresh'
import { scrollToTarget } from '@/motion/scroll'
import { takePendingEntry } from '@/motion/entryScroll'
import { RouteTransitionProvider } from '@/components/transitions/RouteTransition'

/**
 * Layout shell: Lenis + one refresh after fonts, and the route-transition layer (band/column wipes)
 * that every page link to another route goes through.
 */
export default function App() {
  const { pathname } = useLocation()
  // Client-side route changes keep the tab title + description in step with the prerendered pages.
  useEffect(() => {
    const page = seo.find((p) => p.path === (pathname.replace(/\/+$/, '') || '/'))
    if (!page) return
    document.title = page.title
    document.querySelector('meta[name="description"]')?.setAttribute('content', page.description)
  }, [pathname])

  useEffect(() => {
    startSmoothScroll()
    void refreshWhenReady().then(() => {
      const entry = takePendingEntry()
      if (!entry) return
      if ('top' in entry) return scrollToTarget(entry.top, { immediate: true })
      history.replaceState(history.state, '', entry.hash)
      if (document.querySelector(entry.hash)) scrollToTarget(entry.hash, { immediate: true })
    })
    return () => stopSmoothScroll()
  }, [])

  return (
    <RouteTransitionProvider>
      <a href="#main" className="skip-link">Skip to content</a>
      <div id="main-content">
        <Outlet />
      </div>
      <ScrollRestoration />
    </RouteTransitionProvider>
  )
}
