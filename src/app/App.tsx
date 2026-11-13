import { useEffect } from 'react'
import { Outlet, ScrollRestoration } from 'react-router'
import { startSmoothScroll, stopSmoothScroll } from '@/motion/lenis'
import { refreshWhenReady } from '@/motion/refresh'
import { RouteTransitionProvider } from '@/components/transitions/RouteTransition'

/**
 * Layout shell: Lenis + one refresh after fonts, and the route-transition layer (band/column wipes)
 * that every page link to another route goes through.
 */
export default function App() {
  useEffect(() => {
    startSmoothScroll()
    void refreshWhenReady()
    return () => stopSmoothScroll()
  }, [])

  return (
    <RouteTransitionProvider>
      <a href="#main-content" className="sr-only focus:not-sr-only">Skip to content</a>
      <div id="main-content">
        <Outlet />
      </div>
      <ScrollRestoration />
    </RouteTransitionProvider>
  )
}
