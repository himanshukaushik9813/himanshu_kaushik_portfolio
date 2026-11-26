/**
 * Where the page was opened: a #section, or the scroll position of a back/forward visit. A reload
 * always starts at the top.
 *
 * The prerendered HTML lets the browser jump to a #section, or restore the old scroll, before any JS runs.
 * Pinned scroll scenes must be built from the top of the page (ScrollTrigger crashes creating `once`
 * triggers that are already passed), so this module, imported first in main.tsx and before GSAP reads the
 * scroll position, parks the page at the top. App scrolls to the entry once the scenes exist.
 */
type PendingEntry = { hash: string } | { top: number }

const SCROLL_KEY = 'scroll:'
let pendingEntry: PendingEntry | null = null

export const hasPendingEntry = () => pendingEntry !== null && !('top' in pendingEntry && pendingEntry.top === 0)
export const takePendingEntry = () => {
  const e = pendingEntry
  pendingEntry = null
  return e
}

function readSaved(): number {
  try {
    return Number(sessionStorage.getItem(SCROLL_KEY + window.location.pathname)) || 0
  } catch {
    return 0 // storage unavailable
  }
}

if (typeof window !== 'undefined') {
  // Set before GSAP loads: ScrollTrigger keeps whatever value it finds and puts it back on every refresh.
  history.scrollRestoration = 'manual'
  window.addEventListener('pagehide', () => {
    try {
      sessionStorage.setItem(SCROLL_KEY + window.location.pathname, String(Math.round(window.scrollY)))
    } catch {
      /* storage unavailable */
    }
  })
  const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
  const { hash } = window.location
  if (nav?.type === 'reload') {
    // A refresh always starts over from the top, with the intro, even if the address still has a #section.
    if (hash) history.replaceState(history.state, '', window.location.pathname + window.location.search)
    // The browser may still jump to the old #section or restore the old position while the page loads,
    // so App returns to the top again once the scroll scenes exist.
    pendingEntry = { top: 0 }
    // React Router's <ScrollRestoration> would otherwise put the old position back on a reload.
    try {
      sessionStorage.removeItem('react-router-scroll-positions')
    } catch {
      /* storage unavailable */
    }
  } else if (hash.length > 1) {
    pendingEntry = { hash }
    // Dropping the fragment stops the browser from re-anchoring to it while the page loads.
    history.replaceState(history.state, '', window.location.pathname + window.location.search)
  } else {
    // Back / forward returns to where the visitor was.
    const top = (nav?.type === 'back_forward' && readSaved()) || window.scrollY
    if (top > 0) pendingEntry = { top }
  }
  window.scrollTo(0, 0)
}
