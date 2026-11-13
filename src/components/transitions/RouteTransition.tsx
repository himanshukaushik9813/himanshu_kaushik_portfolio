import { useCallback, useEffect, useMemo, useRef, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { gsap, ScrollTrigger } from '@/motion/gsap'
import { getLenis, lockScroll } from '@/motion/lenis'
import { scrollToTarget } from '@/motion/scroll'
import { prefersReducedMotion } from '@/motion/useReducedMotion'
import { RouteTransitionContext, type HomeRestore, type RouteTransitionApi } from './routeTransitionContext'
import './route-wipe.css'

const COUNT = 8
const HOLD = 0.28
const raf = () => new Promise<void>((r) => requestAnimationFrame(() => r()))
const nextFrames = async (n = 2) => { for (let i = 0; i < n; i++) await raf() }

/** Home landing positions, read from the pinned scenes' spacers after the page has mounted. */
function homeY(restore: HomeRestore): number {
  if (restore === 'top') return 0
  const sel = restore === 'hero' ? '[data-section="intro"]' : '[data-section="works"]'
  const el = document.querySelector<HTMLElement>(sel)
  if (!el) return 0
  const spacer = el.parentElement?.classList.contains('pin-spacer') ? el.parentElement : null
  const top = (spacer ?? el).getBoundingClientRect().top + window.scrollY
  if (restore === 'hero') return spacer ? top + spacer.offsetHeight - el.offsetHeight : top
  return top
}

/**
 * Route transitions (A21 band wipe, A22 column wipe; REFERENCE_ANALYSIS §9.3, plan R11).
 * A small state machine: idle → covering → swapping → revealing → idle. Input is ignored while busy,
 * scroll is locked under cover, and the overlay always clears (also if the browser navigates mid-wipe).
 *  - bands:   8 full-width bands slide in from the right, top band first (staircase), 280 ms hold,
 *             then continue off to the left. Going back home: mirrored, bottom band first.
 *  - columns: 8 columns rise from the bottom (stagger .075, 1.1 s power3.inOut) and leave through the top;
 *             mirrored on the way back.
 * Reduced motion: a 0.2 s fade instead.
 */
export function RouteTransitionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const rootRef = useRef<HTMLDivElement>(null)
  const state = useRef<'idle' | 'covering' | 'swapping' | 'revealing'>('idle')
  const expectedPath = useRef<string | null>(null)
  const tl = useRef<gsap.core.Timeline | null>(null)

  const finish = useCallback(() => {
    const root = rootRef.current
    tl.current?.kill()
    tl.current = null
    if (root) {
      gsap.set(root.querySelectorAll('[data-wipe-piece]'), { clearProps: 'transform' })
      gsap.set(root, { clearProps: 'opacity' })
      root.removeAttribute('data-active')
      root.removeAttribute('data-kind')
    }
    lockScroll(false)
    state.current = 'idle'
    expectedPath.current = null
  }, [])

  // Browser back/forward (or any navigation we did not start) mid-wipe: drop the overlay cleanly.
  useEffect(() => {
    if (state.current !== 'idle' && expectedPath.current !== null && location.pathname !== expectedPath.current) finish()
  }, [location.pathname, finish])

  const go = useCallback<RouteTransitionApi['go']>((to, kind, opts = {}) => {
    const root = rootRef.current
    if (!root || state.current !== 'idle') return false
    const toHome = to === '/'
    const restore: HomeRestore = opts.restore ?? 'top'
    state.current = 'covering'
    expectedPath.current = to
    lockScroll(true)
    root.setAttribute('data-active', '')
    root.setAttribute('data-kind', kind)
    const reduced = prefersReducedMotion()
    const pieces = Array.from(root.querySelectorAll<HTMLElement>(`[data-wipe-piece="${kind}"]`))
    const preload: Promise<unknown> = to.startsWith('/projects') ? import('@/pages/ProjectsPage') : Promise.resolve()

    const axis = kind === 'bands' ? 'xPercent' : 'yPercent'
    const enter = toHome ? -102 : 102
    const stagger = { each: kind === 'bands' ? 0.08 : 0.075, from: (toHome && kind === 'bands' ? 'end' : 'start') as 'end' | 'start' }
    const dur = kind === 'bands' ? 1.15 : 1.1

    const swap = async () => {
      state.current = 'swapping'
      await preload
      await navigate(to, { preventScrollReset: true, state: toHome ? { restore } : null })
      await nextFrames(3)
      if (expectedPath.current !== to) return // aborted by a browser navigation
      ScrollTrigger.refresh()
      getLenis()?.resize() // the new page's height: Lenis would otherwise clamp to the old page's limit
      lockScroll(false)
      scrollToTarget(toHome ? homeY(restore) : 0, { immediate: true })
      lockScroll(true)
      ScrollTrigger.update()
      await nextFrames(1)
      if (expectedPath.current !== to) return
      state.current = 'revealing'
      const out = gsap.timeline({ onComplete: finish })
      tl.current = out
      if (reduced) out.to(root, { opacity: 0, duration: 0.2 })
      else out.to(pieces, { [axis]: -enter, duration: dur, ease: 'power3.inOut', stagger }, HOLD)
    }

    const cover = gsap.timeline({ onComplete: () => { void swap() } })
    tl.current = cover
    if (reduced) {
      gsap.set(pieces, { x: 0, y: 0, xPercent: 0, yPercent: 0 })
      cover.fromTo(root, { opacity: 0 }, { opacity: 1, duration: 0.2 })
    } else {
      // x/y reset: GSAP would otherwise read the CSS rest transform (translate 102%) as a px offset
      gsap.set(pieces, { x: 0, y: 0, xPercent: 0, yPercent: 0 })
      cover.fromTo(pieces, { [axis]: enter }, { [axis]: 0, duration: dur, ease: 'power3.inOut', stagger })
    }
    return true
  }, [finish, navigate])

  const api = useMemo<RouteTransitionApi>(() => ({ go, isBusy: () => state.current !== 'idle' }), [go])

  return (
    <RouteTransitionContext.Provider value={api}>
      {children}
      <div ref={rootRef} className="route-wipe" aria-hidden="true" data-route-wipe>
        {Array.from({ length: COUNT }, (_, i) => (
          <span key={`b${i}`} className="route-wipe__band" style={{ top: `${(i * 100) / COUNT}%` }} data-wipe-piece="bands" />
        ))}
        {Array.from({ length: COUNT }, (_, i) => (
          <span key={`c${i}`} className="route-wipe__col" style={{ left: `${(i * 100) / COUNT}%` }} data-wipe-piece="columns" />
        ))}
      </div>
    </RouteTransitionContext.Provider>
  )
}
