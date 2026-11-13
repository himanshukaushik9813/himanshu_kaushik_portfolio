// Reveals animate opacity only (never visibility), so not-yet-revealed links stay keyboard-focusable.
import { gsap, ScrollTrigger, SplitText } from './gsap'
import { prefersReducedMotion } from './useReducedMotion'

/**
 * Shared reveal recipes (Phase 4). All are `once` reveals except parallax.
 * Must be called inside a gsap.context (useGsap) so they revert on unmount.
 * Under reduced motion they do nothing: content is simply visible.
 */
export const reduced = () => prefersReducedMotion()

/** Skills/Experience row pattern (A16): content rises 34px while its rule draws left→right. */
export function revealRows(rows: HTMLElement[], start = 'top 88%') {
  rows.forEach((row) => {
    const content = row.querySelector<HTMLElement>('[data-row-content]')
    const rule = row.querySelector<HTMLElement>('[data-rule]')
    const tl = gsap.timeline({ scrollTrigger: { trigger: row, start, once: true } })
    if (content) tl.from(content, { opacity: 0, y: 34, duration: 0.8, ease: 'power3.out' })
    if (rule) tl.from(rule, { scaleX: 0, transformOrigin: 'left center', duration: 0.9, ease: 'power3.inOut' }, 0.08)
  })
}

/** Scrubbed parallax on a media layer between section enter and leave. */
export function parallax(target: HTMLElement, trigger: HTMLElement, from: gsap.TweenVars, to: gsap.TweenVars, scrub: number) {
  gsap.fromTo(target, from, { ...to, ease: 'none', scrollTrigger: { trigger, start: 'top bottom', end: 'bottom top', scrub } })
}

export { gsap, ScrollTrigger, SplitText }
