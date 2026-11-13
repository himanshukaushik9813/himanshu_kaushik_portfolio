import Lenis from 'lenis'
import { gsap, ScrollTrigger } from './gsap'
import { lenisOptions } from './tokens'
import { prefersReducedMotion } from './useReducedMotion'

let lenis: Lenis | null = null
let tick: ((time: number) => void) | null = null

/** Starts the single Lenis instance on the GSAP ticker. No-op under reduced motion (native scroll). */
export function startSmoothScroll(): Lenis | null {
  if (lenis || typeof window === 'undefined' || prefersReducedMotion()) return lenis
  lenis = new Lenis({ ...lenisOptions })
  lenis.on('scroll', ScrollTrigger.update)
  tick = (time: number) => lenis?.raf(time * 1000)
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)
  return lenis
}

export function stopSmoothScroll() {
  if (tick) gsap.ticker.remove(tick)
  lenis?.destroy()
  lenis = null
  tick = null
}

export function getLenis() {
  return lenis
}

/** Pause/resume (menu overlay, route transitions). Falls back to overflow lock without Lenis. */
export function lockScroll(locked: boolean) {
  if (lenis) {
    if (locked) lenis.stop()
    else lenis.start()
  }
  document.documentElement.style.overflow = locked ? 'hidden' : ''
}
