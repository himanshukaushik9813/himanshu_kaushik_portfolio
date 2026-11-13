/**
 * Where the page was opened: a #section, or the scroll position of a reload / back-forward visit.
 *
 * The prerendered HTML lets the browser jump to a #section, or restore the old scroll, before any JS runs.
 * Pinned scroll scenes must be built from the top of the page (ScrollTrigger crashes creating `once`
 * triggers that are already passed), so this module, imported first in main.tsx and before GSAP reads the
 * scroll position, parks the page at the top. App scrolls to the entry once the scenes exist.
 */
type PendingEntry = { hash: string } | { top: number }

const SCROLL_KEY = 'scroll:'
let pendingEntry: PendingEntry | null = null

export const hasPendingEntry = () => pendingEntry !== null
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
  const { hash } = window.location
  if (hash.length > 1) {
    pendingEntry = { hash }
    // Dropping the fragment stops the browser from re-anchoring to it while the page loads.
    history.replaceState(history.state, '', window.location.pathname + window.location.search)
  } else {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
    const revisit = nav?.type === 'reload' || nav?.type === 'back_forward'
    const top = (revisit && readSaved()) || window.scrollY
    if (top > 0) pendingEntry = { top }
  }
  window.scrollTo(0, 0)
}
