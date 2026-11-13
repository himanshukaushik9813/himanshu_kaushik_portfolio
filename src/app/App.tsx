import { useEffect } from 'react'
import { Outlet, ScrollRestoration } from 'react-router'
import { startSmoothScroll, stopSmoothScroll } from '@/motion/lenis'
import { refreshWhenReady } from '@/motion/refresh'

/**
 * Layout shell. Phase 3 adds SiteNav + MenuOverlay; Phase 6 adds BandWipe/ColumnWipe
 * and the RouteTransitionProvider. Phase 1: Lenis + one refresh after fonts.
 */
export default function App() {
  useEffect(() => {
    startSmoothScroll()
    void refreshWhenReady()
    return () => stopSmoothScroll()
  }, [])

  return (
    <>
      <a href="#main-content" className="sr-only focus:not-sr-only">Skip to content</a>
      <div id="main-content">
        <Outlet />
      </div>
      <ScrollRestoration />
    </>
  )
}
