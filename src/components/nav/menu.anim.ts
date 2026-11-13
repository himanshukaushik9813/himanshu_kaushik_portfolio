import { gsap } from '@/motion/gsap'

/**
 * Menu overlay timeline (A7, REFERENCE_ANALYSIS §6.5):
 * panel xPercent 100→0 (1.05 s power4.inOut); link rows x 48→0 stagger .065 from .42;
 * aside blocks x 28→0 stagger .06 from .55. Compact (≤640px): shorter distances and faster.
 * Link hover: row fills paper (1.15 s power3.inOut), label nudges x 12 (.95 s power3.out).
 */
export function createMenuAnimation(panel: HTMLElement, { compact, reduced }: { compact: boolean; reduced: boolean }) {
  const inners = gsap.utils.toArray<HTMLElement>('.menu-link__inner', panel)
  const reveals = gsap.utils.toArray<HTMLElement>('[data-menu-reveal]', panel)
  const links = gsap.utils.toArray<HTMLElement>('.menu-link', panel)
  const panelX = compact ? 12 : 100
  const linkX = compact ? 12 : 48
  const asideX = compact ? 8 : 28
  const cleanups: Array<() => void> = []

  const ctx = gsap.context(() => {
    gsap.set(panel, { autoAlpha: 0, xPercent: reduced ? 0 : panelX })
    // opacity (not autoAlpha): items stay focusable mid-animation so the focus trap never skips them
    gsap.set(inners, { opacity: 0, x: reduced ? 0 : linkX })
    gsap.set(reveals, { opacity: 0, x: reduced ? 0 : asideX })
  }, panel)

  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.inOut' } })
  ctx.add(() => {
    if (reduced) {
      tl.set(panel, { xPercent: 0 })
        .to(panel, { autoAlpha: 1, duration: 0.2, ease: 'none' })
        .to([...inners, ...reveals], { opacity: 1, x: 0, duration: 0.01 })
      return
    }
    tl.set(panel, { autoAlpha: 1 })
      .to(panel, { xPercent: 0, duration: compact ? 0.8 : 1.05, ease: 'power4.inOut' })
      .to(inners, { opacity: 1, x: 0, duration: compact ? 0.65 : 0.8, stagger: compact ? 0.025 : 0.065 }, compact ? 0.16 : 0.42)
      .to(reveals, { opacity: 1, x: 0, duration: compact ? 0.55 : 0.68, stagger: compact ? 0.025 : 0.06 }, compact ? 0.24 : 0.55)
  })

  // Row hover / focus fill (instant on compact or reduced motion).
  const paper = getComputedStyle(document.documentElement).getPropertyValue('--stone-100').trim() || '#f5f5f4'
  const ink = getComputedStyle(document.documentElement).getPropertyValue('--stone-950').trim() || '#0c0a09'
  const fast = compact || reduced
  links.forEach((link) => {
    const label = link.querySelector<HTMLElement>('.menu-link__label')
    const enter = () => {
      gsap.killTweensOf([link, label])
      gsap.to(link, { backgroundColor: paper, color: ink, duration: fast ? 0.01 : 1.15, ease: 'power3.inOut' })
      if (label) gsap.to(label, { x: fast ? 0 : 12, duration: fast ? 0.01 : 0.95, ease: 'power3.out' })
    }
    const leave = () => {
      gsap.killTweensOf([link, label])
      gsap.to(link, { backgroundColor: 'rgba(0,0,0,0)', color: paper, duration: fast ? 0.01 : 0.95, ease: 'power3.inOut' })
      if (label) gsap.to(label, { x: 0, duration: fast ? 0.01 : 0.9, ease: 'power3.out' })
    }
    const blur = (e: FocusEvent) => {
      if (!link.contains(e.relatedTarget as Node | null)) leave()
    }
    link.addEventListener('pointerenter', enter)
    link.addEventListener('pointerleave', leave)
    link.addEventListener('focus', enter)
    link.addEventListener('blur', blur)
    cleanups.push(() => {
      link.removeEventListener('pointerenter', enter)
      link.removeEventListener('pointerleave', leave)
      link.removeEventListener('focus', enter)
      link.removeEventListener('blur', blur)
    })
  })

  return {
    open: () => tl.timeScale(1).play(),
    close: (onDone?: () => void) => {
      tl.timeScale(compact ? 1.6 : 1.35).reverse()
      tl.eventCallback('onReverseComplete', () => {
        links.forEach((l) => gsap.set(l, { clearProps: 'backgroundColor,color' }))
        onDone?.()
      })
    },
    /** Hide instantly (used when a link navigates under the fade cover). */
    hideNow: () => {
      tl.pause(0)
      links.forEach((l) => gsap.set(l, { clearProps: 'backgroundColor,color' }))
    },
    revert: () => {
      cleanups.forEach((c) => c())
      tl.kill()
      ctx.revert()
    },
  }
}
