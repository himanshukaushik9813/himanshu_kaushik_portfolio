import { getLenis } from './lenis'

/** Scroll to an element or the top. Uses Lenis when active, native scrolling otherwise (reduced motion). */
export function scrollToTarget(target: string | HTMLElement | number, opts: { immediate?: boolean } = {}) {
  const lenis = getLenis()
  const el = typeof target === 'string' ? (target === '#top' ? 0 : document.querySelector<HTMLElement>(target)) : target
  if (el === null) return
  if (lenis) {
    lenis.scrollTo(el, { immediate: opts.immediate, force: true, duration: opts.immediate ? undefined : 1.2 })
    return
  }
  const top = typeof el === 'number' ? el : el.getBoundingClientRect().top + window.scrollY
  window.scrollTo({ top, behavior: opts.immediate ? 'auto' : 'smooth' })
}
